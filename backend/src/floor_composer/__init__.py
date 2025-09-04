"""Floor Composer - 2D Geometric Curve Generator for Building Profiles."""

__version__ = "0.1.0"

# Core geometric functions
from .core import (
    create_point,
    create_line_segment,
    create_arc_segment,
    create_curve,
    create_curve_array,
    point_distance,
    curve_length,
    curve_array_length,
    validate_curve,
)

# Curve factories
from .factories import (
    create_rectangle,
    create_trapezoid,
    create_polyline,
    create_line,
    create_floor_profile_array,
    create_trapezoidal_profile_array,
    create_wave_profile,
    create_closed_wave_profile,
)

# Visualization (optional - requires matplotlib)
try:
    from .visualization import CurveViewer, SVGCurveViewer
except ImportError:
    # Visualization components unavailable - OK for API-only deployment
    CurveViewer = None
    SVGCurveViewer = None

# Utilities
from .utils import (
    get_closed_curves,
    get_open_curves,
    add_curve_to_array,
    curve_to_dict,
    curve_array_to_dict,
    curve_to_json,
    curve_array_to_json,
    extract_svg_path_data,
    get_curve_bounds,
)

__all__ = [
    # Core
    "create_point",
    "create_line_segment", 
    "create_arc_segment",
    "create_curve",
    "create_curve_array",
    "point_distance",
    "curve_length",
    "curve_array_length",
    "validate_curve",
    
    # Factories
    "create_rectangle",
    "create_trapezoid",
    "create_polyline",
    "create_line",
    "create_floor_profile_array",
    "create_trapezoidal_profile_array",
    "create_wave_profile",
    "create_closed_wave_profile",
    
    # Visualization (optional)
    "CurveViewer",
    "SVGCurveViewer",
    
    # Utils
    "get_closed_curves",
    "get_open_curves",
    "add_curve_to_array",
    "curve_to_dict",
    "curve_array_to_dict", 
    "curve_to_json",
    "curve_array_to_json",
    "extract_svg_path_data",
    "get_curve_bounds",
]