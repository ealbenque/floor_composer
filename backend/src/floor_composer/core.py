"""Core geometric functions for 2D curve generation."""

import numpy as np
from typing import List, Dict, Any, Union, Optional

from .materials import Material, get_material


def create_point(x: float, y: float) -> Dict[str, float]:
    """Create a 2D point in meters."""
    return {"x": x, "y": y}


def create_line_segment(start: Dict[str, float], end: Dict[str, float]) -> Dict[str, Any]:
    """Create a line segment."""
    return {
        "type": "line",
        "start": start,
        "end": end
    }


def create_arc_segment(start: Dict[str, float], end: Dict[str, float],
                      center: Dict[str, float], clockwise: bool = True) -> Dict[str, Any]:
    """Create an arc segment."""
    return {
        "type": "arc",
        "start": start,
        "end": end,
        "center": center,
        "clockwise": clockwise
    }


def create_curve(elements: List[Dict[str, Any]], curve_type: str, name: str = None, 
                 material: Union[str, Material] = None) -> Dict[str, Any]:
    """Create a curve from elements.
    
    Args:
        elements: List of line/arc segments
        curve_type: "open" or "closed"
        name: Optional curve name
        material: Material instance or material name string
    """
    # Handle material conversion
    if isinstance(material, str):
        material = get_material(material)
    
    curve = {
        "elements": elements,
        "curve_type": curve_type,
        "name": name,
        "material": material.to_dict() if material else None
    }

    # Validate curve continuity
    validate_curve(curve)
    return curve


def create_curve_array(curves: List[Dict[str, Any]], name: str = None) -> Dict[str, Any]:
    """Create an array of curves."""
    return {
        "curves": curves,
        "name": name
    }


def point_distance(p1: Dict[str, float], p2: Dict[str, float]) -> float:
    """Calculate distance between two points."""
    dx = p2["x"] - p1["x"]
    dy = p2["y"] - p1["y"]
    return np.sqrt(dx**2 + dy**2)


def line_length(line: Dict[str, Any]) -> float:
    """Calculate line segment length."""
    return point_distance(line["start"], line["end"])


def arc_radius(arc: Dict[str, Any]) -> float:
    """Calculate arc radius."""
    return point_distance(arc["start"], arc["center"])


def arc_angle(arc: Dict[str, Any]) -> float:
    """Calculate arc angle in radians."""
    center = arc["center"]
    start_angle = np.arctan2(arc["start"]["y"] - center["y"], arc["start"]["x"] - center["x"])
    end_angle = np.arctan2(arc["end"]["y"] - center["y"], arc["end"]["x"] - center["x"])

    angle = end_angle - start_angle
    if arc["clockwise"] and angle > 0:
        angle -= 2 * np.pi
    elif not arc["clockwise"] and angle < 0:
        angle += 2 * np.pi

    return abs(angle)


def arc_length(arc: Dict[str, Any]) -> float:
    """Calculate arc length."""
    return arc_radius(arc) * arc_angle(arc)


def element_length(element: Dict[str, Any]) -> float:
    """Calculate length of any element (line or arc)."""
    if element["type"] == "line":
        return line_length(element)
    elif element["type"] == "arc":
        return arc_length(element)
    else:
        raise ValueError(f"Unknown element type: {element['type']}")


def curve_length(curve: Dict[str, Any]) -> float:
    """Calculate total curve length."""
    return sum(element_length(elem) for elem in curve["elements"])


def curve_array_length(curve_array: Dict[str, Any]) -> float:
    """Calculate total length of all curves in array."""
    return sum(curve_length(curve) for curve in curve_array["curves"])


def validate_curve(curve: Dict[str, Any], tolerance: float = 1e-6) -> bool:
    """Validate curve continuity and closure."""
    elements = curve["elements"]

    if len(elements) > 1:
        for i in range(len(elements) - 1):
            current_end = elements[i]["end"]
            next_start = elements[i + 1]["start"]
            if point_distance(current_end, next_start) > tolerance:
                raise ValueError(f"Curve discontinuity between element {i} and {i+1}")

    # Check closure for closed curves
    if curve["curve_type"] == "closed" and len(elements) > 0:
        first_start = elements[0]["start"]
        last_end = elements[-1]["end"]
        if point_distance(first_start, last_end) > tolerance:
            raise ValueError("Closed curve is not properly closed")

    return True