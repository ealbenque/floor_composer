#!/usr/bin/env python3
"""Create default curves.json for the web viewer."""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from floor_composer.factories import create_rectangle, create_trapezoid
from floor_composer.materials import CONCRETE, STEEL, INSULATION
from floor_composer.core import create_curve_array
from floor_composer.web_export import create_web_export_package


def create_default_example():
    """Create a simple default example."""
    
    # Simple building section
    foundation = create_rectangle(
        width=4.0, 
        height=0.5, 
        name="Foundation",
        material=CONCRETE
    )
    
    slab = create_rectangle(
        width=4.0,
        height=0.15,
        origin={"x": 0, "y": 0.5},
        name="Floor Slab",
        material=CONCRETE
    )
    
    insulation = create_rectangle(
        width=4.0,
        height=0.1,
        origin={"x": 0, "y": 0.65},
        name="Insulation",
        material=INSULATION
    )
    
    beam = create_trapezoid(
        bottom_width=0.3,
        top_width=0.2,
        height=0.4,
        origin={"x": 1.85, "y": 0.75},
        name="Steel Beam",
        material=STEEL
    )
    
    # Create default curve array
    default_curves = create_curve_array([
        foundation,
        slab,
        insulation,
        beam
    ], name="Default Floor Section")
    
    return default_curves


def main():
    print("🔧 Creating default curves.json...")
    
    default_data = create_default_example()
    
    # Export as default curves.json
    files = create_web_export_package(
        default_data,
        output_dir="web/data", 
        base_name="curves",  # Creates curves.json
        canvas_width=800,
        canvas_height=600
    )
    
    print("✅ Default curves.json created successfully!")
    print(f"   File: {files['curves']}")


if __name__ == "__main__":
    main()