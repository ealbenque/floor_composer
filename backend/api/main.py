"""FastAPI server for Floor Composer corrugated system generation."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import json
import os
from pathlib import Path

import sys
from pathlib import Path

# Add src directory to Python path
src_path = str(Path(__file__).parent.parent / 'src')
sys.path.insert(0, src_path)

# Import directly from modules to avoid visualization dependencies
from floor_composer.core import create_point, create_curve_array
from floor_composer.factories import create_wave_profile, create_closed_wave_profile
from floor_composer.web_export import curve_to_web_dict, curve_array_to_web_dict
from floor_composer.materials import get_material

app = FastAPI(title="Floor Composer API", version="1.0.0")

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001", 
        "http://localhost:3000",  # React dev server
        "https://floor-composer-frontend.onrender.com",  # Production frontend
        "https://*.onrender.com"  # Allow all render.com subdomains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the steel deck database
DATABASE_PATH = Path(__file__).parent.parent / "data" / "arcelor_steel_deck_database.json"

def load_steel_deck_database() -> Dict[str, Any]:
    """Load the ArcelorMittal steel deck database."""
    try:
        with open(DATABASE_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"Database file not found: {DATABASE_PATH}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON in database: {e}")

# Request/Response models
class CorrugatedSystemRequest(BaseModel):
    profile: str = Field(..., description="Steel profile name (cofrastra_40 or cofraplus_80)")
    concrete_thickness: float = Field(..., ge=0.09, le=0.28, description="Concrete thickness in meters")
    steel_thickness: str = Field(..., description="Steel thickness variant (e.g., '1.00mm')")
    canvas_width: Optional[int] = Field(800, ge=400, le=2000, description="Canvas width for SVG generation")
    canvas_height: Optional[int] = Field(600, ge=300, le=1500, description="Canvas height for SVG generation")

class GeometryData(BaseModel):
    steel_profile: Dict[str, Any]
    concrete_section: Dict[str, Any]
    combined_system: Dict[str, Any]

class PropertiesData(BaseModel):
    slab_thickness_m: float
    concrete_volume_m3_m2: float
    theoretical_floor_weight_N_m2: float
    fire_resistance: Dict[str, Any]
    acoustic_performance: Dict[str, Any]
    mechanical_performance: Dict[str, Any]

class CorrugatedSystemResponse(BaseModel):
    geometry: GeometryData
    properties: PropertiesData
    profile_info: Dict[str, Any]

@app.get("/")
async def root():
    """API root endpoint."""
    return {"message": "Floor Composer API", "version": "1.0.0"}

@app.get("/api/profiles")
async def get_available_profiles():
    """Get list of available steel profiles."""
    db = load_steel_deck_database()
    profiles = []
    
    for profile_key, profile_data in db["steel_profiles"].items():
        thickness_variants = list(profile_data["profile_characteristics"]["thickness_variants"].keys())
        composite_data = db["composite_decks"][profile_key]
        thickness_range = {
            "min": min([float(k[:-1]) for k in composite_data["slab_thickness_variants"].keys()]),
            "max": max([float(k[:-1]) for k in composite_data["slab_thickness_variants"].keys()])
        }
        
        profiles.append({
            "key": profile_key,
            "name": profile_data["name"],
            "description": profile_data["description"],
            "steel_thickness_variants": thickness_variants,
            "concrete_thickness_range": thickness_range,
            "spans_range": {
                "min": min(composite_data["mechanical_performance"]["spans_m"]),
                "max": max(composite_data["mechanical_performance"]["spans_m"])
            }
        })
    
    return {"profiles": profiles}

def generate_corrugated_geometry(profile_data: Dict[str, Any], concrete_thickness: float, 
                                steel_thickness: str, canvas_width: int, canvas_height: int) -> GeometryData:
    """Generate corrugated system geometry from profile data."""
    
    # Extract geometry parameters
    geometry = profile_data["geometry"]
    total_width = geometry["profile_width_m"]
    profile_height = geometry["profile_height_m"] 
    wave_width = geometry["rib_spacing_m"]
    bottom_width = geometry["rib_width_m"]
    top_width = geometry["top_width_m"]
    
    # Generate steel profile (corrugated shape only)
    steel_curve = create_wave_profile(
        total_width=total_width,
        wave_width=wave_width,
        bottom_width=bottom_width,
        top_width=top_width,
        height=profile_height,
        name=f"{profile_data['name']} Steel Profile",
        material="metal_sheet"
    )
    
    # Generate composite section (corrugated + concrete)
    composite_curve = create_closed_wave_profile(
        total_width=total_width,
        wave_width=wave_width,
        bottom_width=bottom_width,
        top_width=top_width,
        height=profile_height,
        depth=concrete_thickness,
        name=f"{profile_data['name']} Composite Section",
        material="concrete"
    )
    
    # Create combined system with both curves
    combined_curves = [steel_curve, composite_curve]
    combined_system = create_curve_array(combined_curves, f"{profile_data['name']} System")
    
    # Convert to web format
    steel_web = curve_to_web_dict(steel_curve, canvas_width=canvas_width, canvas_height=canvas_height)
    composite_web = curve_to_web_dict(composite_curve, canvas_width=canvas_width, canvas_height=canvas_height)
    combined_web = curve_array_to_web_dict(combined_system, canvas_width=canvas_width, canvas_height=canvas_height)
    
    return GeometryData(
        steel_profile=steel_web,
        concrete_section=composite_web,
        combined_system=combined_web
    )

def get_properties_data(composite_data: Dict[str, Any], concrete_thickness: float, 
                       steel_data: Dict[str, Any], steel_thickness: str) -> PropertiesData:
    """Get performance properties for the specified thickness."""
    
    # Find closest thickness variant
    thickness_key = f"{concrete_thickness:.2f}m"
    available_thicknesses = list(composite_data["slab_thickness_variants"].keys())
    
    # If exact match not found, find closest
    if thickness_key not in available_thicknesses:
        thickness_values = [float(k[:-1]) for k in available_thicknesses]
        closest_thickness = min(thickness_values, key=lambda x: abs(x - concrete_thickness))
        thickness_key = f"{closest_thickness:.2f}m"
    
    if thickness_key not in composite_data["slab_thickness_variants"]:
        raise HTTPException(status_code=400, detail=f"No data available for thickness {concrete_thickness}m")
    
    variant_data = composite_data["slab_thickness_variants"][thickness_key]
    
    return PropertiesData(
        slab_thickness_m=variant_data["slab_thickness_m"],
        concrete_volume_m3_m2=variant_data["concrete_volume_m3_m2"],
        theoretical_floor_weight_N_m2=variant_data["theoretical_floor_weight_N_m2"],
        fire_resistance=variant_data["fire_resistance"],
        acoustic_performance=variant_data["acoustic_performance"],
        mechanical_performance=variant_data["mechanical_performance"]
    )

@app.post("/api/corrugated-system", response_model=CorrugatedSystemResponse)
async def generate_corrugated_system(request: CorrugatedSystemRequest):
    """Generate corrugated system geometry and properties."""
    
    db = load_steel_deck_database()
    
    # Validate profile
    if request.profile not in db["steel_profiles"]:
        available_profiles = list(db["steel_profiles"].keys())
        raise HTTPException(
            status_code=400, 
            detail=f"Profile '{request.profile}' not found. Available: {available_profiles}"
        )
    
    steel_profile_data = db["steel_profiles"][request.profile]
    composite_data = db["composite_decks"][request.profile]
    
    # Validate steel thickness
    available_steel_thicknesses = list(steel_profile_data["profile_characteristics"]["thickness_variants"].keys())
    if request.steel_thickness not in available_steel_thicknesses:
        raise HTTPException(
            status_code=400,
            detail=f"Steel thickness '{request.steel_thickness}' not available for {request.profile}. Available: {available_steel_thicknesses}"
        )
    
    # Validate concrete thickness range
    available_concrete_thicknesses = [float(k[:-1]) for k in composite_data["slab_thickness_variants"].keys()]
    min_thickness, max_thickness = min(available_concrete_thicknesses), max(available_concrete_thicknesses)
    
    if not (min_thickness <= request.concrete_thickness <= max_thickness):
        raise HTTPException(
            status_code=400,
            detail=f"Concrete thickness {request.concrete_thickness}m out of range [{min_thickness}-{max_thickness}m] for {request.profile}"
        )
    
    # Generate geometry
    geometry = generate_corrugated_geometry(
        steel_profile_data, 
        request.concrete_thickness,
        request.steel_thickness,
        request.canvas_width,
        request.canvas_height
    )
    
    # Get properties
    properties = get_properties_data(
        composite_data, 
        request.concrete_thickness, 
        steel_profile_data,
        request.steel_thickness
    )
    
    # Profile info
    steel_thickness_data = steel_profile_data["profile_characteristics"]["thickness_variants"][request.steel_thickness]
    profile_info = {
        "name": steel_profile_data["name"],
        "description": steel_profile_data["description"],
        "manufacturer": steel_profile_data["manufacturer"],
        "geometry": steel_profile_data["geometry"],
        "steel_properties": {
            "thickness": request.steel_thickness,
            **steel_thickness_data
        }
    }
    
    return CorrugatedSystemResponse(
        geometry=geometry,
        properties=properties,
        profile_info=profile_info
    )

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    try:
        db = load_steel_deck_database()
        profile_count = len(db.get("steel_profiles", {}))
        return {
            "status": "healthy",
            "database_loaded": True,
            "profile_count": profile_count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database_loaded": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)