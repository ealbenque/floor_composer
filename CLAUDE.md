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
├── utils.py                 # Utility functions
└── visualization.py         # Plotting and visualization

tests/                       # Test suite
├── __init__.py
└── test_core.py

examples/                    # Usage examples
└── basic_usage.py

polyline_generator.ipynb     # Main Jupyter notebook with full implementation
```

## Key Dependencies
- **numpy**: >=1.20.0 - Numerical computations
- **matplotlib**: >=3.5.0 - Plotting and visualization
- **jupyter**: >=1.0.0 - Interactive development
- **pytest**: >=7.0 - Testing framework
- **black**: >=22.0 - Code formatting
- **mypy**: >=1.0 - Type checking

## Notes for Claude
- All dependencies are managed through Poetry
- Use `poetry run` prefix for all Python commands
- Jupyter kernel "Floor Composer (Poetry)" is configured for notebooks
- Main implementation is in `polyline_generator.ipynb`
- Package uses functional programming with dictionary-based data structures