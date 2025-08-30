#!/usr/bin/env python3
"""
Complete workflow demo for Floor Composer web visualization.
Shows how to create geometries with materials and export for web viewing.
"""

import sys
import os
from pathlib import Path

# Add src to path so we can import floor_composer
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from floor_composer.factories import (
    create_rectangle, create_trapezoid, create_floor_profile_array,
    create_wave_profile, create_closed_wave_profile
)
from floor_composer.materials import CONCRETE, STEEL, INSULATION, SCREED, FINISH_FLOOR, METAL_SHEET
from floor_composer.core import create_curve_array
from floor_composer.web_export import create_web_export_package


def create_sample_building_section():
    """Create a sample building section with various materials."""
    
    print("🏗️  Creating building section with materials...")
    
    # Foundation
    foundation = create_rectangle(
        width=6.0, 
        height=0.8, 
        name="Foundation",
        material=CONCRETE
    )
    
    # Floor slab  
    floor_slab = create_rectangle(
        width=6.0,
        height=0.15,
        origin={"x": 0, "y": 0.8},
        name="Floor Slab",
        material=CONCRETE
    )
    
    # Steel beam
    steel_beam = create_trapezoid(
        bottom_width=0.3,
        top_width=0.2,
        height=0.4,
        origin={"x": 2.85, "y": 0.95},
        name="Steel Beam",
        material=STEEL
    )
    
    # Insulation layer
    insulation = create_rectangle(
        width=6.0,
        height=0.1,
        origin={"x": 0, "y": 0.95},
        name="Insulation Layer",
        material=INSULATION
    )
    
    # Screed layer
    screed = create_rectangle(
        width=6.0,
        height=0.05,
        origin={"x": 0, "y": 1.05},
        name="Screed Layer",
        material=SCREED
    )
    
    # Finish floor
    finish = create_rectangle(
        width=6.0,
        height=0.02,
        origin={"x": 0, "y": 1.1},
        name="Finish Floor",
        material=FINISH_FLOOR
    )
    
    # Create curve array
    building_section = create_curve_array([
        foundation,
        floor_slab, 
        steel_beam,
        insulation,
        screed,
        finish
    ], name="Building Section")
    
    return building_section


def create_corrugated_floor_system():
    """Create corrugated metal floor system."""
    
    print("🌊 Creating corrugated floor system...")
    
    # Corrugated deck profile
    corrugated_deck = create_wave_profile(
        total_width=875,
        wave_width=175,
        bottom_width=65,
        top_width=50,
        height=44,
        name="Corrugated Metal Deck",
        material=METAL_SHEET
    )
    
    # Composite slab (closed profile with concrete above)
    composite_slab = create_closed_wave_profile(
        total_width=875,
        wave_width=175,
        bottom_width=130,
        top_width=50,
        height=44,
        depth=150,  # Total depth including concrete
        name="Composite Floor Slab",
        material=CONCRETE
    )
    
    # Create array
    floor_system = create_curve_array([
        composite_slab,
        corrugated_deck
    ], name="Corrugated Floor System")
    
    return floor_system


def create_layered_floor_profile():
    """Create typical floor composition."""
    
    print("📚 Creating layered floor profile...")
    
    # Define layers with materials
    layers = [
        ("concrete", 0.15),      # Concrete slab
        ("insulation", 0.08),    # Insulation
        ("screed", 0.05),        # Screed
        ("finish_floor", 0.02),  # Finish floor
    ]
    
    floor_profile = create_floor_profile_array(layers, width=0.3)
    
    return floor_profile


def export_all_examples():
    """Export all examples for web viewing."""
    
    print("\n" + "="*60)
    print("🚀 Floor Composer Web Export Demo")
    print("="*60)
    
    # Create examples
    examples = {
        "building_section": create_sample_building_section(),
        "corrugated_system": create_corrugated_floor_system(), 
        "floor_profile": create_layered_floor_profile()
    }
    
    # Export each example
    export_files = {}
    
    for name, curve_array in examples.items():
        print(f"\n📦 Exporting {name}...")
        
        files = create_web_export_package(
            curve_array,
            output_dir="web/data",
            base_name=name,
            canvas_width=1000,
            canvas_height=700
        )
        
        export_files[name] = files
        print(f"   ✅ Exported to {files['output_dir']}")
    
    return export_files


def create_index_page(export_files):
    """Create an index page with links to all examples."""
    
    index_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Floor Composer - Examples</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 800px; 
            margin: 2rem auto; 
            padding: 0 2rem;
            line-height: 1.6;
        }
        h1 { color: #2563eb; text-align: center; }
        .example { 
            background: #f8f9fa; 
            padding: 1.5rem; 
            margin: 1.5rem 0; 
            border-radius: 0.5rem;
            border: 1px solid #e5e7eb;
        }
        .example h3 { color: #1f2937; margin-bottom: 0.5rem; }
        .example p { color: #6b7280; margin-bottom: 1rem; }
        .btn { 
            background: #2563eb; 
            color: white; 
            padding: 0.75rem 1.5rem; 
            text-decoration: none; 
            border-radius: 0.375rem; 
            display: inline-block;
            margin-right: 1rem;
        }
        .btn:hover { background: #1d4ed8; }
        .tech-note {
            background: #e0f2fe;
            padding: 1rem;
            border-radius: 0.375rem;
            border-left: 4px solid #0891b2;
            margin: 2rem 0;
        }
    </style>
</head>
<body>
    <h1>🏗️ Floor Composer Examples</h1>
    
    <div class="tech-note">
        <strong>How it works:</strong> Python generates raw geometry + assigns materials, 
        D3.js handles interactive visualization with customizable styles, patterns, and hatches.
    </div>
    
    <div class="example">
        <h3>🏢 Building Section</h3>
        <p>Multi-material building section with foundation, slab, beam, insulation, and finishes.</p>
        <a href="index.html?data=data/building_section.json" class="btn">View Example</a>
    </div>
    
    <div class="example">
        <h3>🌊 Corrugated Floor System</h3>
        <p>Corrugated metal deck with composite concrete slab - complex wave profiles.</p>
        <a href="index.html?data=data/corrugated_system.json" class="btn">View Example</a>
    </div>
    
    <div class="example">
        <h3>📚 Floor Profile</h3>
        <p>Typical layered floor composition showing material stratification.</p>
        <a href="index.html?data=data/floor_profile.json" class="btn">View Example</a>
    </div>
    
    <div class="tech-note">
        <strong>Features:</strong>
        <ul>
            <li>✅ Material-based styling (colors, patterns, hatches)</li>
            <li>✅ Interactive zoom, pan, and hover tooltips</li>
            <li>✅ Show/hide materials with sidebar controls</li>
            <li>✅ D3.js SVG rendering with Python-generated path data</li>
        </ul>
    </div>
    
    <hr style="margin: 2rem 0;">
    <p style="text-align: center; color: #6b7280;">
        <small>Generated with Floor Composer - Python backend, D3.js frontend</small>
    </p>
</body>
</html>"""
    
    with open("web/examples.html", "w") as f:
        f.write(index_html)
    
    print("📄 Created examples index page: web/examples.html")


def main():
    """Main demo function."""
    
    try:
        # Export all examples
        export_files = export_all_examples()
        
        # Create examples index page
        create_index_page(export_files)
        
        # Also create default curves.json if it doesn't exist
        curves_file = Path("web/data/curves.json")
        if not curves_file.exists():
            print("\n🔧 Creating default curves.json...")
            from create_default_data import create_default_example
            default_data = create_default_example()
            create_web_export_package(default_data, "web/data", "curves", 800, 600)
        
        print("\n" + "="*60)
        print("✅ Demo completed successfully!")
        print("="*60)
        print("\n🚀 Next steps:")
        print("1. Start the development server:")
        print("   cd web && python serve.py")
        print("\n2. View examples in your browser:")
        print("   • http://localhost:8000/examples.html")
        print("   • http://localhost:8000/ (main viewer)")
        print("\n3. Customize materials and styles in the browser!")
        
        # Show what was created
        print(f"\n📁 Files created in web/data/:")
        for name, files in export_files.items():
            print(f"   • {name}.json")
        print("   • materials.json")
        print("   • curves.json (default)")
        
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    sys.exit(main())