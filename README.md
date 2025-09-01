# Floor Composer

A Python library for generating 2D geometric curves and profiles for floor compositions and building components. Perfect for architectural applications, structural engineering, and building information modeling (BIM).

## Features

- **Pure Python**: Dictionary-based data structures, JSON serializable
- **Geometric Primitives**: Points, lines, arcs, polylines
- **Shape Factories**: Rectangles, trapezoids, wave profiles, floor compositions
- **Visualization**: Matplotlib and SVG output (D3.js compatible)
- **Material System**: Built-in material definitions with web visualization support
- **Web Export**: Generate JSON data for interactive D3.js web visualizations
- **Building Components**: Specialized functions for floor profiles, corrugated sheets, composite slabs
- **React Web Viewer**: Modern TypeScript frontend with interactive D3.js visualization
- **Geometric Precision**: Perfect alignment between steel and concrete corrugated profiles
- **Functional Design**: Immutable data structures, composable functions

## Installation

```bash
# Install dependencies using Poetry
poetry install --with dev

# Activate Poetry shell
poetry shell

# Or run commands directly with Poetry
poetry run python examples/basic_usage.py
```

## Quick Start

```python
from floor_composer.factories import (
    create_rectangle, create_wave_profile, create_floor_profile_array
)
from floor_composer.visualization import CurveViewer, SVGCurveViewer
from floor_composer.core import curve_length

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

## Web Visualization

The system supports both **static data generation** and **live API backend**:

### Option 1: Static Data (Recommended for basic use)
```bash
# 1. Generate example data (creates JSON files in web/public/data/)
poetry run python examples/web_demo.py

# 2. Start the React development server
cd web && npm run dev

# 3. Open browser to: http://localhost:3001
```

### Option 2: FastAPI Backend (For corrugated system calculator)
```bash
# 1. Start the FastAPI server (runs on port 8000)
poetry run uvicorn src.api_server:app --reload

# 2. Start the React development server
cd web && npm run dev

# 3. Open browser to: http://localhost:3001
```

**Architecture**: 
- **Static**: Python generates JSON files → React loads them with D3.js
- **Live API**: FastAPI backend serves corrugated system calculations → React makes HTTP requests

Features:
- **Interactive D3.js visualization** with zoom, pan, and hover
- **Material controls** with toggle switches for each material type
- **Example dropdown** with building sections, corrugated systems, and floor profiles
- **Perfect geometric alignment** between steel and concrete profiles
- **Material styling**: Steel (black outline, no fill), concrete (light grey with diagonal hatch)

## Examples

Run the usage examples:

```bash
# Basic usage examples
poetry run python examples/basic_usage.py

# Generate web demo data
poetry run python examples/web_demo.py

# Create default web data
poetry run python examples/create_default_data.py
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

### Materials & Web Export
- `materials.py` - Material definitions (concrete, steel, timber, etc.)
- `web_export.py` - Export geometry with materials for web visualization

### Visualization
- `CurveViewer` - Matplotlib plotting
- `SVGCurveViewer` - SVG generation (D3.js compatible)

## Use Cases

### Architecture & Engineering
- Floor assembly drawings
- Structural profiles

### Manufacturing
- Sheet metal profiles  
- Composite panel designs
- Prefab component specs

### Web Applications
- Interactive floor builders
- Configuration tools
- 3D visualization prep
- Technical documentation

## Development

```bash
# Run tests with coverage
poetry run pytest

# Format code
poetry run black src/ examples/ tests/

# Type checking
poetry run mypy src/

# Lint code
poetry run flake8 src/ tests/

# Start Jupyter notebook
poetry run jupyter notebook
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

### v0.2.0
- **React Web Viewer**: Modern TypeScript frontend with Next.js and D3.js
- **Perfect Geometric Alignment**: Steel and concrete corrugated profiles use identical polylines
- **Material Styling System**: Black steel outlines, concrete with diagonal hatch patterns
- **Interactive Visualization**: Zoom, pan, hover, material toggles
- **Shadcn UI Components**: Professional gray theme with responsive design
- **Fixed Corrugated System**: Trapezoidal steel profile now matches concrete bottom exactly

### v0.1.0
- Initial release
- Core geometric functions
- Shape factories
- Matplotlib and SVG visualization
- Floor composition utilities
- Wave profile generation