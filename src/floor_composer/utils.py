"""Utility functions for curve manipulation and serialization."""

import json
from typing import List, Dict, Any

from .core import curve_length, curve_array_length
from .visualization import SVGCurveViewer


def get_closed_curves(curve_array: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Get only closed curves from array."""
    return [curve for curve in curve_array["curves"] if curve["curve_type"] == "closed"]


def get_open_curves(curve_array: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Get only open curves from array."""
    return [curve for curve in curve_array["curves"] if curve["curve_type"] == "open"]


def add_curve_to_array(curve_array: Dict[str, Any], curve: Dict[str, Any]) -> None:
    """Add a curve to an existing curve array."""
    curve_array["curves"].append(curve)


def curve_to_dict(curve: Dict[str, Any]) -> Dict[str, Any]:
    """Convert curve to dictionary with calculated properties."""
    return {
        "name": curve.get("name"),
        "curve_type": curve["curve_type"],
        "elements": curve["elements"],
        "total_length": curve_length(curve)
    }


def curve_array_to_dict(curve_array: Dict[str, Any]) -> Dict[str, Any]:
    """Convert curve array to dictionary with calculated properties."""
    return {
        "name": curve_array.get("name"),
        "curve_count": len(curve_array["curves"]),
        "total_length": curve_array_length(curve_array),
        "curves": [curve_to_dict(curve) for curve in curve_array["curves"]]
    }


def curve_to_json(curve: Dict[str, Any]) -> str:
    """Export curve as JSON."""
    return json.dumps(curve_to_dict(curve), indent=2)


def curve_array_to_json(curve_array: Dict[str, Any]) -> str:
    """Export curve array as JSON."""
    return json.dumps(curve_array_to_dict(curve_array), indent=2)


def extract_svg_path_data(curve: Dict[str, Any], bounds: dict = None,
                         canvas_width: int = 800, canvas_height: int = 600) -> str:
    """Extract SVG path data string for D3.js use."""
    svg_viewer = SVGCurveViewer(canvas_width, canvas_height)

    if bounds is None:
        bounds = svg_viewer._calculate_bounds([curve])

    transform = svg_viewer._create_transform(bounds)
    return svg_viewer._curve_to_svg_path(curve, transform)


def get_curve_bounds(curves: List[Dict[str, Any]]) -> dict:
    """Get bounding box for a list of curves."""
    svg_viewer = SVGCurveViewer()
    return svg_viewer._calculate_bounds(curves)