# Floor Composer

A Python library for generating 2D geometric curves and profiles for floor compositions and building components. Perfect for architectural applications, structural engineering, and building information modeling (BIM).

## Features

- **Pure Python**: Dictionary-based data structures, JSON serializable
- **Geometric Primitives**: Points, lines, arcs, polylines
- **Shape Factories**: Rectangles, trapezoids, wave profiles, floor compositions
- **Visualization**: Matplotlib and SVG output (D3.js compatible)
- **Building Components**: Specialized functions for floor profiles, corrugated sheets, composite slabs
- **Functional Design**: Immutable data structures, composable functions

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/floor-composer.git
cd floor-composer

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install in development mode
pip install -e ".[dev]"
```

## Quick Start

```python
from floor_composer import (
    create_rectangle, create_wave_profile, create_floor_profile_array,
    CurveViewer, SVGCurveViewer, curve_length
)

# Create a simple rectangle
rect = create_rectangle(width=3.0, height=2.0, name="Foundation")
print(f"Rectangle length: {curve_length(rect):.3f}m")

# Create a corrugated sheet profile
wave = create_wave_profile(
    total_width=875,    # Total width in mm
    wave_width=175,     # Wave cycle width
    bottom_width=65,    # Flat bottom width
    top_width=50,       # Flat top width
    height=44,          # Wave height
    name="Corrugated Sheet"
)

# Create a floor composition
floor_layers = [
    ("Concrete Slab", 0.15),
    ("Insulation", 0.08),
    ("Screed", 0.05),
    ("Finish Floor", 0.02)
]
floor_profile = create_floor_profile_array(floor_layers, width=0.3)

# Generate SVG for web use
svg_viewer = SVGCurveViewer()
svg_content = svg_viewer.plot_curve(rect, stroke_color='#2563eb')
```

## Examples

Run the basic usage examples:

```bash
python examples/basic_usage.py
```

## Data Structure

All curves are represented as dictionaries with this structure:

```python
{
    "name": "Curve Name",
    "curve_type": "closed",  # or "open"
    "elements": [
        {
            "type": "line",
            "start": {"x": 0, "y": 0},
            "end": {"x": 1, "y": 0}
        },
        # ... more elements
    ]
}
```

This design makes curves:
- **JSON serializable** for web applications
- **Framework agnostic** - works with any frontend
- **Database friendly** - store as JSON fields
- **Functional** - immutable and composable

## Core Functions

### Geometric Primitives
- `create_point(x, y)` - Create 2D point
- `create_line_segment(start, end)` - Line segment
- `create_arc_segment(start, end, center, clockwise)` - Arc segment
- `create_curve(elements, curve_type, name)` - Curve from elements

### Shape Factories  
- `create_rectangle(width, height, origin, name)` - Rectangle
- `create_trapezoid(bottom_width, top_width, height, origin, name)` - Trapezoid
- `create_polyline(points, closed, name)` - Polyline from points
- `create_wave_profile(...)` - Corrugated sheet profile
- `create_closed_wave_profile(...)` - Composite slab with concrete

### Building Components
- `create_floor_profile_array(layers, width)` - Multi-layer floor
- `create_trapezoidal_profile_array(profiles, spacing)` - Beam array

### Analysis
- `curve_length(curve)` - Calculate total length
- `point_distance(p1, p2)` - Distance between points
- `validate_curve(curve)` - Check continuity and closure

### Visualization
- `CurveViewer` - Matplotlib plotting
- `SVGCurveViewer` - SVG generation (D3.js compatible)

## Use Cases

### Architecture & Engineering
- Floor assembly drawings
- Structural profiles
- Building envelope details
- MEP routing layouts

### Manufacturing
- Sheet metal profiles  
- Composite panel designs
- Prefab component specs
- CNC tool paths

### Web Applications
- Interactive floor builders
- Configuration tools
- 3D visualization prep
- Technical documentation

## Development

```bash
# Run tests
pytest

# Format code
black src/ examples/ tests/

# Type checking  
mypy src/

# Lint code
flake8 src/
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Changelog

### v0.1.0
- Initial release
- Core geometric functions
- Shape factories
- Matplotlib and SVG visualization
- Floor composition utilities
- Wave profile generation