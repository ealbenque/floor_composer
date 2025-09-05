# Floor Composer - Claude Code Configuration

## Project Overview
Full-stack application for generating 2D geometric curves and floor profiles. Features a FastAPI backend with ArcelorMittal steel deck database and a modern React/Next.js frontend. Uses Poetry for Python dependency management.

## Architecture
- **Backend**: Python/FastAPI in `/backend/` directory
- **Frontend**: React/Next.js in `/frontend/` directory
- **Database**: ArcelorMittal steel deck profiles (JSON format)
- **Deployment**: Containerized services on Render.com

## Development Setup
- **Package Manager**: Poetry (backend), npm (frontend)  
- **Python Version**: >=3.8
- **Node Version**: Latest LTS
- **Virtual Environment**: Managed by Poetry

## Common Commands

### Backend Commands (Poetry)
```bash
# Install backend dependencies
poetry install --with dev

# Add new Python dependency
poetry add package_name

# Add development dependency  
poetry add --group dev package_name

# Start FastAPI server
poetry run uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000

# Run tests with coverage
poetry run pytest

# Format Python code
poetry run black backend/src/ tests/

# Type checking
poetry run mypy backend/src/

# Lint Python code
poetry run flake8 backend/src/ tests/
```

### Frontend Commands (npm)
```bash
# Install frontend dependencies
cd frontend && npm install

# Start development server with Turbopack
cd frontend && npm run dev

# Build for production
cd frontend && npm run build

# Start production server
cd frontend && npm start

# Lint TypeScript/React code
cd frontend && npm run lint
```

### Frontend Development Guidelines
- **ALWAYS use existing components first**: Check `/frontend/src/components/` for reusable components before creating new ones
- **Component Libraries**: Prioritize Shadcn UI and Radix UI components over custom implementations
- **Existing Patterns**: Study existing components to understand naming conventions, TypeScript patterns, and styling approaches
- **File Structure**: Follow the established component organization in `/frontend/src/components/`

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
/
├── backend/                         # Python FastAPI backend
│   ├── api/
│   │   └── main.py                 # FastAPI application
│   ├── src/floor_composer/         # Core Python library
│   │   ├── __init__.py
│   │   ├── core.py                 # Core geometric functions
│   │   ├── factories.py            # Curve factory functions
│   │   ├── materials.py            # Material definitions and system
│   │   ├── utils.py                # Utility functions
│   │   ├── visualization.py        # Plotting and visualization
│   │   └── web_export.py           # Web export functionality
│   ├── data/                       # ArcelorMittal steel deck database
│   │   └── arcelor_steel_deck_database.json
│   ├── requirements.txt            # Python dependencies
│   └── Dockerfile                  # Backend container
├── frontend/                       # React/Next.js frontend
│   ├── src/
│   │   ├── app/                    # Next.js app router
│   │   │   ├── layout.tsx          # Root layout
│   │   │   ├── page.tsx            # Home page
│   │   │   ├── corrugated/         # Corrugated systems page
│   │   │   └── clt/                # CLT panel page
│   │   ├── components/             # React components
│   │   │   └── viewer/             # D3.js visualization components
│   │   ├── lib/                    # Utilities and libraries
│   │   │   ├── store.ts            # Zustand state management
│   │   │   ├── d3-integration.ts   # D3.js integration
│   │   │   └── data-loader.ts      # API data loading
│   │   └── types/                  # TypeScript type definitions
│   ├── public/                     # Static assets
│   ├── package.json                # Node.js dependencies
│   └── Dockerfile                  # Frontend container
├── tests/                          # Test suite
├── examples/                       # Python usage examples
├── pyproject.toml                  # Poetry configuration
└── render.yaml                     # Production deployment config
```

## Key Dependencies

### Backend (Python)
- **FastAPI**: >=0.104.0 - Modern web API framework
- **Uvicorn**: >=0.24.0 - ASGI server
- **Pydantic**: >=2.0.0 - Data validation
- **numpy**: >=1.20.0 - Numerical computations
- **matplotlib**: >=3.5.0 - Plotting and visualization
- **overrides**: ^7.7.0 - Method override decorators
- **pytest**: >=7.0 - Testing framework
- **black**: >=22.0 - Code formatting
- **mypy**: >=1.0 - Type checking
- **flake8**: >=5.0 - Code linting

### Frontend (Node.js)
- **Next.js**: 15.5.2 - React framework with app router
- **React**: 19.1.0 - UI library
- **TypeScript**: ^5 - Type-safe JavaScript
- **D3.js**: ^7.9.0 - Data visualization
- **Zustand**: ^5.0.8 - State management
- **Tailwind CSS**: ^4 - Utility-first CSS framework
- **Radix UI**: Various components - Accessible UI primitives
- **Shadcn UI**: Design system components
- **Framer Motion**: ^12.23.12 - Animation library

## Web Visualization System

### Architecture
- **Backend (FastAPI)**: RESTful API with ArcelorMittal steel deck database
- **Frontend (React/Next.js)**: Modern single-page application with TypeScript
- **Database**: JSON-based steel profile database with performance calculations
- **Visualization**: D3.js integration for interactive geometric rendering

### API Endpoints
- `GET /api/profiles` - Available steel deck profiles
- `POST /api/corrugated-system` - Generate corrugated system geometry  
- `GET /api/health` - Service health check
- `GET /docs` - Interactive API documentation (Swagger UI)

### Full Stack Development Setup
```bash
# Terminal 1: Start FastAPI backend
poetry run uvicorn backend.api.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start React frontend  
cd frontend && npm run dev

# Access application
# Frontend: http://localhost:3001
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Web Export Workflow
```python
from floor_composer.factories import create_rectangle, create_trapezoid, create_curve_array
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

### Frontend Application Features
- **Multi-page Application**: Home, corrugated systems, CLT panels
- **Interactive D3.js Visualization**: Zoom, pan, hover with geometric precision
- **Material System**: Toggle controls for different materials (steel, concrete)
- **Performance Data**: Engineering calculations, fire resistance, acoustic properties
- **Responsive Design**: Modern UI with Shadcn components and gray theme
- **Real-time API Integration**: Dynamic corrugated system generation

## Architecture Notes
- **Full-Stack Architecture**: Separate backend and frontend services
- **Package Managers**: Poetry (Python backend), npm (Node.js frontend)
- **Command Prefix**: Always use `poetry run` for Python commands
- **Design Pattern**: Functional programming with immutable dictionary-based data structures
- **API-First**: RESTful FastAPI backend with comprehensive OpenAPI documentation
- **Modern Frontend**: Next.js 15 with React 19, TypeScript, and Turbopack
- **State Management**: Zustand for client-side state, D3.js for visualization
- **Containerization**: Docker support for both backend and frontend services
- **Production Deployment**: Render.com with separate service configurations

## Development Workflow
- **Backend Quality**: Run `poetry run black backend/src/ tests/` for formatting
- **Backend Type Safety**: Use `poetry run mypy backend/src/` for type checking  
- **Backend Testing**: Execute `poetry run pytest` for test suite
- **Backend Linting**: Run `poetry run flake8 backend/src/ tests/` for code quality
- **Frontend Development**: Use `cd frontend && npm run dev` for development server
- **Frontend Quality**: Use `cd frontend && npm run lint` for ESLint checks
- **Full Stack**: Run both backend API (port 8000) and frontend (port 3001) simultaneously