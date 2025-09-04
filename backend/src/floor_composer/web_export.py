"""Web export utilities for Floor Composer geometries."""

import json
import numpy as np
from typing import Dict, Any, List, Optional
from pathlib import Path

from .core import curve_length, curve_array_length
from .visualization import SVGCurveViewer


def curve_to_web_dict(curve: Dict[str, Any], bounds: Optional[Dict[str, float]] = None,
                     canvas_width: int = 800, canvas_height: int = 600) -> Dict[str, Any]:
    """Convert curve to web-ready dictionary with SVG path data and material info."""
    
    # Calculate SVG path data for D3.js
    svg_viewer = SVGCurveViewer(canvas_width, canvas_height)
    
    if bounds is None:
        bounds = svg_viewer._calculate_bounds([curve])
    
    transform = svg_viewer._create_transform(bounds)
    svg_path = svg_viewer._curve_to_svg_path(curve, transform)
    
    # Build web-ready dictionary
    web_curve = {
        "id": curve.get("name", "unnamed").replace(" ", "_").lower(),
        "name": curve.get("name", "Unnamed"),
        "curve_type": curve["curve_type"],
        "material": curve.get("material"),  # Material info from backend
        "geometry": {
            "elements": curve["elements"],
            "svg_path": svg_path,
            "length": curve_length(curve)
        }
    }
    
    return web_curve


def curve_array_to_web_dict(curve_array: Dict[str, Any], 
                           canvas_width: int = 800, canvas_height: int = 600) -> Dict[str, Any]:
    """Convert curve array to web-ready dictionary with all curves and shared bounds."""
    
    curves = curve_array["curves"]
    if not curves:
        return {
            "name": curve_array.get("name", "Empty Array"),
            "curves": [],
            "bounds": {"min_x": 0, "max_x": 1, "min_y": 0, "max_y": 1},
            "total_length": 0
        }
    
    # Calculate shared bounds for consistent scaling
    svg_viewer = SVGCurveViewer(canvas_width, canvas_height)
    bounds = svg_viewer._calculate_bounds(curves)
    
    # Convert all curves with shared bounds
    web_curves = []
    for curve in curves:
        web_curve = curve_to_web_dict(curve, bounds, canvas_width, canvas_height)
        web_curves.append(web_curve)
    
    return {
        "name": curve_array.get("name", "Curve Array"),
        "curves": web_curves,
        "bounds": bounds,
        "total_length": curve_array_length(curve_array),
        "canvas": {
            "width": canvas_width,
            "height": canvas_height
        }
    }


def export_curves_to_json(curve_array: Dict[str, Any], output_path: str,
                         canvas_width: int = 800, canvas_height: int = 600,
                         indent: int = 2) -> None:
    """Export curve array to JSON file for web visualization."""
    
    web_data = curve_array_to_web_dict(curve_array, canvas_width, canvas_height)
    
    # Ensure output directory exists
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Write JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(web_data, f, indent=indent)
    
    print(f"✅ Exported {len(web_data['curves'])} curves to {output_path}")
    print(f"   Canvas size: {canvas_width}x{canvas_height}")
    print(f"   Total length: {web_data['total_length']:.3f}m")


def create_material_palette() -> Dict[str, Dict[str, str]]:
    """Create default material visual palette for frontend."""
    
    return {
        "concrete": {
            "fill": "#6b7280",
            "stroke": "#374151",
            "pattern": "solid",
            "description": "Reinforced concrete"
        },
        "steel": {
            "fill": "#ef4444",
            "stroke": "#dc2626", 
            "pattern": "diagonal",
            "description": "Structural steel"
        },
        "insulation": {
            "fill": "#fbbf24",
            "stroke": "#f59e0b",
            "pattern": "dots",
            "description": "Thermal insulation"
        },
        "screed": {
            "fill": "#8b5cf6",
            "stroke": "#7c3aed",
            "pattern": "solid",
            "description": "Floor screed"
        },
        "finish_floor": {
            "fill": "#10b981",
            "stroke": "#059669",
            "pattern": "solid",
            "description": "Floor finish"
        },
        "timber": {
            "fill": "#d97706",
            "stroke": "#b45309",
            "pattern": "wood_grain",
            "description": "Structural timber"
        },
        "masonry": {
            "fill": "#dc2626",
            "stroke": "#b91c1c",
            "pattern": "brick",
            "description": "Brick masonry"
        },
        "membrane": {
            "fill": "#1f2937",
            "stroke": "#111827",
            "pattern": "solid",
            "description": "Waterproof membrane"
        },
        "metal_sheet": {
            "fill": "#6366f1",
            "stroke": "#4f46e5",
            "pattern": "corrugated",
            "description": "Metal sheeting"
        }
    }


def export_material_palette(output_path: str = "web/data/materials.json") -> None:
    """Export material palette to JSON file for frontend styling."""
    
    palette = create_material_palette()
    
    # Ensure output directory exists
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Write JSON file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(palette, f, indent=2)
    
    print(f"✅ Exported material palette to {output_path}")
    print(f"   {len(palette)} material definitions")


def create_web_export_package(curve_array: Dict[str, Any], 
                             output_dir: str = "web/data",
                             base_name: str = "curves",
                             canvas_width: int = 800, 
                             canvas_height: int = 600) -> Dict[str, str]:
    """Create complete web export package with curves and materials."""
    
    output_path = Path(output_dir)
    
    # Export curve data
    curves_file = output_path / f"{base_name}.json"
    export_curves_to_json(curve_array, str(curves_file), canvas_width, canvas_height)
    
    # Export material palette
    materials_file = output_path / "materials.json"
    export_material_palette(str(materials_file))
    
    return {
        "curves": str(curves_file),
        "materials": str(materials_file),
        "output_dir": str(output_path)
    }