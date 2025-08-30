"""Material system for Floor Composer geometries."""

from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class Material:
    """Material definition with properties for visualization and engineering."""
    
    name: str
    category: str
    density: Optional[float] = None  # kg/m³
    description: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert material to dictionary for JSON export."""
        return {
            "name": self.name,
            "category": self.category,
            "density": self.density,
            "description": self.description
        }


# Standard building materials
CONCRETE = Material(
    name="concrete",
    category="structural",
    density=2400.0,
    description="Reinforced concrete"
)

STEEL = Material(
    name="steel",
    category="structural", 
    density=7850.0,
    description="Structural steel"
)

INSULATION = Material(
    name="insulation",
    category="thermal",
    density=30.0,
    description="Thermal insulation"
)

SCREED = Material(
    name="screed",
    category="finish",
    density=2000.0,
    description="Floor screed"
)

FINISH_FLOOR = Material(
    name="finish_floor",
    category="finish",
    density=800.0,
    description="Floor finish material"
)

TIMBER = Material(
    name="timber",
    category="structural",
    density=600.0,
    description="Structural timber"
)

MASONRY = Material(
    name="masonry",
    category="structural",
    density=1800.0,
    description="Brick or block masonry"
)

MEMBRANE = Material(
    name="membrane",
    category="waterproofing",
    density=50.0,
    description="Waterproof membrane"
)

METAL_SHEET = Material(
    name="metal_sheet",
    category="cladding",
    density=7850.0,
    description="Corrugated metal sheeting"
)


# Material registry for easy lookup
MATERIALS = {
    "concrete": CONCRETE,
    "steel": STEEL,
    "insulation": INSULATION,
    "screed": SCREED,
    "finish_floor": FINISH_FLOOR,
    "timber": TIMBER,
    "masonry": MASONRY,
    "membrane": MEMBRANE,
    "metal_sheet": METAL_SHEET,
}


def get_material(name: str) -> Material:
    """Get material by name, return default if not found."""
    return MATERIALS.get(name.lower(), CONCRETE)


def list_materials() -> Dict[str, Material]:
    """Get all available materials."""
    return MATERIALS.copy()


def get_materials_by_category(category: str) -> Dict[str, Material]:
    """Get materials filtered by category."""
    return {
        name: material 
        for name, material in MATERIALS.items() 
        if material.category == category
    }