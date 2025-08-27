#!/usr/bin/env python3
"""Basic usage examples for Floor Composer."""

from floor_composer import (
    create_rectangle, create_trapezoid, create_polyline, create_point,
    create_floor_profile_array, create_wave_profile, create_closed_wave_profile,
    CurveViewer, SVGCurveViewer, curve_length
)


def main():
    """Run basic usage examples."""
    print("Floor Composer - Basic Usage Examples")
    print("=" * 40)

    # Example 1: Simple rectangle
    print("\n1. Rectangle:")
    rect = create_rectangle(width=3.0, height=2.0, name="Simple Rectangle")
    print(f"   Length: {curve_length(rect):.3f}m")
    print(f"   Type: {rect['curve_type']}")
    
    # Example 2: Trapezoid  
    print("\n2. Trapezoid:")
    trap = create_trapezoid(
        bottom_width=4.0,
        top_width=2.0, 
        height=1.5,
        name="Concrete Beam Profile"
    )
    print(f"   Length: {curve_length(trap):.3f}m")
    print(f"   Elements: {len(trap['elements'])}")
    
    # Example 3: Polyline
    print("\n3. Open Polyline:")
    points = [
        create_point(0, 0),
        create_point(1, 1),
        create_point(2, 1.5),
        create_point(3, 0.5),
        create_point(4, 2)
    ]
    polyline = create_polyline(points, closed=False, name="Building Outline")
    print(f"   Length: {curve_length(polyline):.3f}m")
    print(f"   Type: {polyline['curve_type']}")
    
    # Example 4: Floor composition
    print("\n4. Floor Composition:")
    floor_layers = [
        ("Concrete Slab", 0.15),
        ("Insulation", 0.08),
        ("Screed", 0.05),
        ("Finish Floor", 0.02)
    ]
    floor_profile = create_floor_profile_array(floor_layers, width=0.3)
    print(f"   Layers: {len(floor_profile['curves'])}")
    print(f"   Materials: {[c['name'] for c in floor_profile['curves']]}")
    
    # Example 5: Wave profile (corrugated sheet)
    print("\n5. Wave Profile:")
    wave_profile = create_wave_profile(
        total_width=875,
        wave_width=175,
        bottom_width=65,
        top_width=50,
        height=44,
        name="Corrugated Sheet Profile"
    )
    print(f"   Length: {curve_length(wave_profile):.3f}m")
    print(f"   Elements: {len(wave_profile['elements'])}")
    
    # Example 6: Closed wave profile (composite slab)
    print("\n6. Composite Floor Slab:")
    closed_wave = create_closed_wave_profile(
        total_width=875,
        wave_width=175,
        bottom_width=130,
        top_width=50,
        height=44,
        depth=150,  # Total depth including concrete
        name="Composite Floor Slab"
    )
    print(f"   Length: {curve_length(closed_wave):.3f}m")
    print(f"   Type: {closed_wave['curve_type']}")
    
    # Example 7: SVG Generation
    print("\n7. SVG Generation:")
    svg_viewer = SVGCurveViewer(width=800, height=600)
    svg_content = svg_viewer.plot_curve(rect, stroke_color='#2563eb', show_points=True)
    print(f"   Generated SVG ({len(svg_content)} chars)")
    print(f"   First 100 chars: {svg_content[:100]}...")
    
    print("\n" + "=" * 40)
    print("All examples completed successfully!")


if __name__ == "__main__":
    main()