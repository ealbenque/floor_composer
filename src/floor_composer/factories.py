"""Curve factory functions for creating common geometric shapes."""

import numpy as np
from typing import List, Dict, Any, Tuple

from .core import (
    create_point, create_line_segment, create_curve, create_curve_array
)


def create_rectangle(width: float, height: float, origin: Dict[str, float] = None,
                    name: str = None) -> Dict[str, Any]:
    """Create a rectangular closed curve."""
    if origin is None:
        origin = create_point(0, 0)

    p1 = origin
    p2 = create_point(origin["x"] + width, origin["y"])
    p3 = create_point(origin["x"] + width, origin["y"] + height)
    p4 = create_point(origin["x"], origin["y"] + height)

    elements = [
        create_line_segment(p1, p2),
        create_line_segment(p2, p3),
        create_line_segment(p3, p4),
        create_line_segment(p4, p1)
    ]

    return create_curve(elements, "closed", name)


def create_trapezoid(bottom_width: float, top_width: float, height: float,
                    origin: Dict[str, float] = None, name: str = None) -> Dict[str, Any]:
    """Create a trapezoidal closed curve."""
    if origin is None:
        origin = create_point(0, 0)

    # Calculate offset for centering top width over bottom width
    offset = (bottom_width - top_width) / 2

    p1 = origin  # Bottom left
    p2 = create_point(origin["x"] + bottom_width, origin["y"])  # Bottom right
    p3 = create_point(origin["x"] + bottom_width - offset, origin["y"] + height)  # Top right
    p4 = create_point(origin["x"] + offset, origin["y"] + height)  # Top left

    elements = [
        create_line_segment(p1, p2),
        create_line_segment(p2, p3),
        create_line_segment(p3, p4),
        create_line_segment(p4, p1)
    ]

    return create_curve(elements, "closed", name)


def create_polyline(points: List[Dict[str, float]], closed: bool = False,
                   name: str = None) -> Dict[str, Any]:
    """Create a polyline from a list of points."""
    if len(points) < 2:
        raise ValueError("Need at least 2 points for a polyline")

    elements = []
    for i in range(len(points) - 1):
        elements.append(create_line_segment(points[i], points[i + 1]))

    # Close the curve if requested
    if closed:
        elements.append(create_line_segment(points[-1], points[0]))
        curve_type = "closed"
    else:
        curve_type = "open"

    return create_curve(elements, curve_type, name)


def create_line(start: Dict[str, float], end: Dict[str, float], name: str = None) -> Dict[str, Any]:
    """Create a simple line curve."""
    line = create_line_segment(start, end)
    return create_curve([line], "open", name)


def create_floor_profile_array(layers: List[Tuple[str, float]], width: float = 1.0) -> Dict[str, Any]:
    """Create a typical floor composition as curve array.
    
    Args:
        layers: List of (material_name, thickness) tuples
        width: Width of the profile in meters
    """
    curves = []
    current_y = 0

    for material, thickness in layers:
        rect = create_rectangle(
            width=width,
            height=thickness,
            origin=create_point(0, current_y),
            name=material
        )
        curves.append(rect)
        current_y += thickness

    return create_curve_array(curves, "Floor Profile")


def create_trapezoidal_profile_array(profiles: List[Tuple[float, float, float]],
                                   spacing: float = 0.1) -> Dict[str, Any]:
    """Create an array of trapezoidal profiles.
    
    Args:
        profiles: List of (bottom_width, top_width, height) tuples
        spacing: Horizontal spacing between profiles
    """
    curves = []
    current_x = 0

    for i, (bottom_width, top_width, height) in enumerate(profiles):
        trap = create_trapezoid(
            bottom_width=bottom_width,
            top_width=top_width,
            height=height,
            origin=create_point(current_x, 0),
            name=f"Trapezoid_{i+1}"
        )
        curves.append(trap)
        current_x += bottom_width + spacing

    return create_curve_array(curves, "Trapezoidal Profile Array")


def create_wave_profile(total_width: float, wave_width: float, bottom_width: float,
                       top_width: float, height: float, name: str = None) -> Dict[str, Any]:
    """Create a wave profile geometry like corrugated metal sheeting.
    
    Args:
        total_width: Total width of the profile (875)
        wave_width: Width of one complete wave cycle (175)
        bottom_width: Width of flat bottom section (65)
        top_width: Width of flat top section (50)
        height: Height of the wave (44)
        name: Optional profile name
    """
    if name is None:
        name = "Wave Profile"

    # Calculate derived dimensions
    side_slope_width = (wave_width - bottom_width) / 2  # Width of each sloped section
    top_offset = (bottom_width - top_width) / 2  # Horizontal offset for top section

    # Calculate number of complete waves
    num_waves = int(total_width // wave_width)
    remainder = total_width % wave_width

    # Start at the middle of the top width and go right
    start_x = -top_width / 2
    current_x = start_x

    points = []

    # Generate points for each wave
    for wave in range(num_waves):
        wave_start_x = current_x

        # Start at top left of wave
        if wave == 0:
            points.append(create_point(current_x, height))

        # Top flat section
        current_x += top_width
        points.append(create_point(current_x, height))

        # Right descending slope
        current_x += side_slope_width - top_offset
        points.append(create_point(current_x, 0))

        # Bottom flat section
        current_x += bottom_width
        points.append(create_point(current_x, 0))

        # Left ascending slope (start of next wave)
        current_x += side_slope_width - top_offset
        points.append(create_point(current_x, height))

    # Handle remainder if total_width doesn't divide evenly by wave_width
    if remainder > 0 and num_waves > 0:
        # Add partial wave
        remaining = remainder
        if remaining >= top_width:
            current_x += top_width
            points.append(create_point(current_x, height))
            remaining -= top_width

        if remaining > 0:
            # Partial slope down
            slope_progress = min(remaining / (side_slope_width - top_offset), 1.0)
            slope_x = current_x + remaining
            slope_y = height * (1 - slope_progress)
            points.append(create_point(slope_x, slope_y))

    # Create the polyline
    return create_polyline(points, closed=False, name=name)


def create_closed_wave_profile(total_width: float, wave_width: float, bottom_width: float,
                              top_width: float, height: float, depth: float = None,
                              name: str = None) -> Dict[str, Any]:
    """Create a closed wave profile with optional depth (like concrete above corrugated deck).
    
    Args:
        total_width: Total width of the profile (875)
        wave_width: Width of one complete wave cycle (175)
        bottom_width: Width of flat bottom section (65)
        top_width: Width of flat top section (50)
        height: Height of the wave (44)
        depth: Total depth including concrete above (e.g., 150 for 44mm profile + 106mm concrete)
        name: Optional profile name
    """
    if name is None:
        name = "Closed Wave Profile"

    # Get the open wave profile for the corrugated shape
    open_profile = create_wave_profile(total_width, wave_width, bottom_width,
                                     top_width, height, name + "_open")

    # Get the points from the open profile
    corrugated_points = []
    for element in open_profile["elements"]:
        if not corrugated_points:  # First element
            corrugated_points.append(element["start"])
        corrugated_points.append(element["end"])

    if not corrugated_points:
        return create_polyline([], closed=True, name=name)

    # Build the closed profile points
    points = []

    if depth is not None and depth > height:
        # Create profile with concrete depth above
        first_point = corrugated_points[0]
        last_point = corrugated_points[-1]

        # Start at top-left of concrete slab
        points.append(create_point(first_point["x"], depth))

        # Top edge of concrete slab (flat line)
        points.append(create_point(last_point["x"], depth))

        # Right edge down to corrugated profile
        points.append(create_point(last_point["x"], last_point["y"]))

        # Add corrugated profile points in reverse order (right to left)
        for point in reversed(corrugated_points):
            points.append(point)

        # Close back to start (left edge up to concrete)
        points.append(create_point(first_point["x"], first_point["y"]))

    else:
        # Original behavior - just close the corrugated profile at bottom
        points.extend(corrugated_points)

        # Add bottom closure
        last_point = points[-1]
        first_point = points[0]

        # Add point at same x as last point but at y=0
        if last_point["y"] != 0:
            points.append(create_point(last_point["x"], 0))

        # Add point at same x as first point but at y=0
        if first_point["y"] != 0:
            points.append(create_point(first_point["x"], 0))

    return create_polyline(points, closed=True, name=name)