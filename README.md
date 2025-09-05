# Floor Composer

A comprehensive full-stack application for generating 2D geometric curves and profiles for floor compositions and building components. Perfect for architectural applications, structural engineering, and building information modeling (BIM).

## Features

- **Full-Stack Architecture**: Separate backend (Python/FastAPI) and frontend (React/Next.js) services
- **Pure Python Backend**: Dictionary-based data structures, JSON serializable
- **Modern React Frontend**: TypeScript, Next.js 15, Shadcn UI components, Tailwind CSS
- **Geometric Primitives**: Points, lines, arcs, polylines
- **Shape Factories**: Rectangles, trapezoids, wave profiles, floor compositions
- **Interactive Visualization**: D3.js integration with zoom, pan, hover interactions
- **Material System**: Built-in material definitions with toggle controls
- **Steel Deck Database**: ArcelorMittal corrugated steel profiles with performance data
- **Building Components**: Specialized functions for floor profiles, corrugated sheets, composite slabs
- **Live API**: FastAPI backend for dynamic corrugated system calculations
- **Geometric Precision**: Perfect alignment between steel and concrete corrugated profiles
- **Production Ready**: Containerized deployment with Render.com configuration

## Architecture

### Backend (Python/FastAPI)
- **Location**: `/backend/`
- **Main API**: `backend/api/main.py`
- **Core Library**: `backend/src/floor_composer/`
- **Database**: ArcelorMittal steel deck profiles in JSON format
- **Port**: 8000 (development), configurable in production

### Frontend (React/Next.js)
- **Location**: `/frontend/`
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4, Shadcn UI components
- **State Management**: Zustand
- **Visualization**: D3.js integration
- **Port**: 3001 (development)

## Quick Start

### Development Setup
```bash
# Install backend dependencies
poetry install --with dev

# Install frontend dependencies
cd frontend && npm install

# Start backend API server
poetry run uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000

# Start frontend development server (in another terminal)
cd frontend && npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

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

## Application Features

### Interactive Web Interface
- **Multi-page Application**: Separate pages for corrugated systems and CLT panels
- **Dynamic Calculations**: Real-time corrugated system generation via API
- **Material Controls**: Toggle switches for different material visualizations
- **Performance Data**: Engineering properties, fire resistance, acoustic performance
- **Responsive Design**: Modern UI with gray theme and professional styling

### API Endpoints
- `GET /api/profiles` - Available steel deck profiles
- `POST /api/corrugated-system` - Generate corrugated system geometry
- `GET /api/health` - Service health check

### Visualization Features
- **Interactive D3.js visualization** with zoom, pan, and hover
- **Perfect geometric alignment** between steel and concrete profiles
- **Material styling**: Steel (black outline, no fill), concrete (light grey with diagonal hatch)
- **Performance metrics**: Load tables, span calculations, volume data

## Project Structure

```
/
├── backend/                     # Python FastAPI backend
│   ├── api/                     # FastAPI application
│   │   └── main.py             # Main API server
│   ├── src/floor_composer/      # Core Python library
│   │   ├── core.py             # Geometric functions
│   │   ├── factories.py        # Shape factories
│   │   ├── materials.py        # Material definitions
│   │   ├── visualization.py    # Plotting functions
│   │   └── web_export.py       # Web format conversion
│   ├── data/                   # ArcelorMittal steel deck database
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile             # Backend container
├── frontend/                   # React/Next.js frontend
│   ├── src/
│   │   ├── app/               # Next.js app router
│   │   │   ├── corrugated/    # Corrugated systems page
│   │   │   └── clt/           # CLT panel page
│   │   ├── components/        # React components
│   │   │   └── viewer/        # D3.js visualization
│   │   ├── lib/               # Utilities and state
│   │   └── types/             # TypeScript interfaces
│   ├── public/                # Static assets
│   ├── package.json           # Node.js dependencies
│   └── Dockerfile            # Frontend container
├── examples/                  # Python usage examples
├── tests/                     # Test suite
├── pyproject.toml            # Poetry configuration
└── render.yaml              # Production deployment config
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

### Backend Development
```bash
# Install dependencies
poetry install --with dev

# Run tests with coverage
poetry run pytest

# Format code
poetry run black backend/src/ examples/ tests/

# Type checking
poetry run mypy backend/src/

# Lint code
poetry run flake8 backend/src/ tests/

# Start API server with hot reload
poetry run uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
# Install dependencies
cd frontend && npm install

# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Full Stack Development
```bash
# Terminal 1: Start backend
poetry run uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start frontend
cd frontend && npm run dev

# Access application at http://localhost:3001
# API documentation at http://localhost:8000/docs
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Deployment

The application is configured for production deployment on Render.com:

```yaml
# render.yaml
services:
  - name: floor-composer-backend
    type: web
    runtime: python
    buildCommand: cd backend && pip install -r requirements.txt
    startCommand: cd backend && gunicorn api.main:app -w 4 -k uvicorn.workers.UvicornWorker
    
  - name: floor-composer-frontend
    type: web
    runtime: node
    buildCommand: cd frontend && npm ci && npm run build
    startCommand: cd frontend && npm start
```

### Environment Variables
- **Backend**: `PYTHONPATH`, `DATABASE_PATH`
- **Frontend**: `NODE_ENV`, `NEXT_PUBLIC_API_URL`

## Changelog

### v0.3.0 (Current)
- **Full-Stack Architecture**: Separate backend and frontend services
- **FastAPI Backend**: RESTful API with ArcelorMittal steel deck database
- **Next.js 15 Frontend**: Modern React with Turbopack and TypeScript
- **Multi-page Application**: Dedicated pages for corrugated systems and CLT panels
- **Production Deployment**: Containerized services on Render.com
- **Performance Data**: Engineering calculations and material properties

### v0.2.0
- **React Web Viewer**: Modern TypeScript frontend with Next.js and D3.js
- **Perfect Geometric Alignment**: Steel and concrete corrugated profiles use identical polylines
- **Material Styling System**: Black steel outlines, concrete with diagonal hatch patterns
- **Interactive Visualization**: Zoom, pan, hover, material toggles
- **Shadcn UI Components**: Professional gray theme with responsive design

### v0.1.0
- Initial release
- Core geometric functions
- Shape factories
- Matplotlib and SVG visualization
- Floor composition utilities
- Wave profile generation