# Floor Composer - Claude Code Configuration

## Project Overview
2D geometric curve generator for floor profiles and building components. Uses Poetry for dependency management with a functional programming approach based on dictionaries.

## Development Setup
- **Package Manager**: Poetry
- **Python Version**: >=3.8
- **Virtual Environment**: Managed by Poetry

## Common Commands

### Poetry Commands
```bash
# Install dependencies
poetry install --with dev

# Add new dependency
poetry add package_name

# Add development dependency  
poetry add --group dev package_name

# Run commands in Poetry environment
poetry run python script.py
poetry run jupyter notebook

# Activate Poetry shell
poetry shell

# Show environment info
poetry env info
```

### Testing & Quality
```bash
# Run tests with coverage
poetry run pytest

# Run type checking
poetry run mypy src/

# Format code
poetry run black src/ tests/

# Lint code
poetry run flake8 src/ tests/
```

### Jupyter
```bash
# Start Jupyter Notebook with Poetry environment
poetry run jupyter notebook

# Start Jupyter Lab with Poetry environment  
poetry run jupyter lab

# Install/update Jupyter kernel for this project
poetry run python -m ipykernel install --user --name floor-composer --display-name "Floor Composer (Poetry)"
```

## Project Structure
```
src/floor_composer/          # Main package
├── __init__.py
├── core.py                  # Core geometric functions
├── factories.py             # Curve factory functions
├── materials.py             # Material definitions and system
├── utils.py                 # Utility functions
├── visualization.py         # Plotting and visualization
└── web_export.py            # Web export functionality

tests/                       # Test suite
├── __init__.py
└── test_core.py

examples/                    # Usage examples
├── basic_usage.py
├── create_default_data.py   # Generate default web data
└── web_demo.py              # Generate full demo examples

polyline_generator.ipynb     # Main Jupyter notebook with full implementation
```

## Key Dependencies
- **numpy**: >=1.20.0 - Numerical computations
- **matplotlib**: >=3.5.0 - Plotting and visualization
- **overrides**: ^7.7.0 - Method override decorators
- **jupyter**: >=1.0.0 - Interactive development
- **pytest**: >=7.0 - Testing framework
- **black**: >=22.0 - Code formatting
- **mypy**: >=1.0 - Type checking
- **flake8**: >=5.0 - Code linting

## Web Visualization System

### Architecture
- **Backend (Python)**: Generates raw geometry + assigns materials to curves
- **Frontend (React + D3.js)**: Modern React app with Shadcn UI components, gray theme, TypeScript

### Quick Start Web Viewer
```bash
# Generate example data
poetry run python examples/web_demo.py

# Start React development server  
cd web && npm run dev

# Open browser to:
# http://localhost:3001 (React app with example dropdown)
```

### Web Export Workflow
```python
from floor_composer.factories import create_rectangle
from floor_composer.materials import CONCRETE, STEEL  
from floor_composer.web_export import create_web_export_package

# Create geometry with materials
foundation = create_rectangle(5.0, 0.8, material=CONCRETE)
beam = create_trapezoid(0.3, 0.4, material=STEEL)
building = create_curve_array([foundation, beam])

# Export for web visualization
create_web_export_package(building, "web/data", "my_building")
```

### Material System
- Materials defined in `src/floor_composer/materials.py`
- Default materials: concrete, steel, insulation, screed, finish_floor, timber, masonry, membrane, metal_sheet
- React frontend with TypeScript interfaces, Zustand state management
- Shadcn UI components with gray theme, material toggle switches
- **Styling**: Steel profiles (black outline, no fill), concrete (light grey with diagonal hatch pattern)
- **Geometric Alignment**: Steel and concrete corrugated profiles use identical polylines for perfect alignment

### Web Directory Structure
```
web/                        # React + Next.js application
├── src/
│   ├── app/               # Next.js app router
│   ├── components/        # React components (Header, Viewer, Controls)
│   ├── lib/               # D3.js integration, state management, data loading
│   └── types/             # TypeScript interfaces
├── public/data/           # Generated curve + material JSON files
├── package.json           # Node.js dependencies
└── README.md             # React app documentation
```

## Notes for Claude
- All dependencies are managed through Poetry
- Use `poetry run` prefix for all Python commands
- Jupyter kernel "Floor Composer (Poetry)" is configured for notebooks
- Main implementation is in `polyline_generator.ipynb`
- Package uses functional programming with dictionary-based data structures
- **UPDATED**: Modern React frontend with TypeScript, Shadcn UI, gray theme
- **UPDATED**: Web system: Python backend generates JSON, React frontend visualizes with D3.js
- **UPDATED**: Single-page application with dropdown example selection and responsive design