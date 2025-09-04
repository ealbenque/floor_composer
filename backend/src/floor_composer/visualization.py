"""Visualization classes for displaying curves using Matplotlib and SVG."""

import numpy as np
import matplotlib.pyplot as plt
from typing import List, Dict, Any, Tuple

from .core import curve_length, curve_array_length, arc_radius, arc_angle


class CurveViewer:
    """Matplotlib-based curve viewer."""

    def __init__(self, figure_size: Tuple[float, float] = (10, 8)):
        """Initialize viewer with figure size."""
        self.figure_size = figure_size

    def plot_curve(self, curve: Dict[str, Any], color: str = 'blue', linewidth: float = 2.0,
                   show_points: bool = False):
        """Plot a single curve."""
        fig, ax = plt.subplots(figsize=self.figure_size)
        self._draw_curve(ax, curve, color, linewidth, show_points)

        ax.set_aspect('equal')
        ax.grid(True, alpha=0.3)
        ax.set_xlabel('X (meters)')
        ax.set_ylabel('Y (meters)')

        title = f"Curve: {curve.get('name', 'Unnamed')} ({curve['curve_type']})"
        title += f"\nLength: {curve_length(curve):.3f}m"
        ax.set_title(title)

        plt.tight_layout()
        plt.show()

    def plot_curve_array(self, curve_array: Dict[str, Any], colors: List[str] = None):
        """Plot an array of curves."""
        fig, ax = plt.subplots(figsize=self.figure_size)

        if colors is None:
            colors = plt.cm.tab10(np.linspace(0, 1, len(curve_array["curves"])))

        for i, curve in enumerate(curve_array["curves"]):
            color = colors[i % len(colors)]
            self._draw_curve(ax, curve, color, 2.0, False, label=curve.get("name", f"Curve {i+1}"))

        ax.set_aspect('equal')
        ax.grid(True, alpha=0.3)
        ax.set_xlabel('X (meters)')
        ax.set_ylabel('Y (meters)')
        ax.legend()

        title = f"Curve Array: {curve_array.get('name', 'Unnamed')}"
        title += f"\nTotal Length: {curve_array_length(curve_array):.3f}m"
        ax.set_title(title)

        plt.tight_layout()
        plt.show()

    def _draw_curve(self, ax, curve: Dict[str, Any], color: str, linewidth: float,
                   show_points: bool, label: str = None):
        """Internal method to draw a curve on given axes."""
        x_coords = []
        y_coords = []

        for element in curve["elements"]:
            if element["type"] == "line":
                # Add line segment points
                if not x_coords:  # First element
                    x_coords.extend([element["start"]["x"], element["end"]["x"]])
                    y_coords.extend([element["start"]["y"], element["end"]["y"]])
                else:
                    x_coords.append(element["end"]["x"])
                    y_coords.append(element["end"]["y"])

            elif element["type"] == "arc":
                # Tessellate arc for display
                n_points = max(10, int(arc_angle(element) * 20))

                center = element["center"]
                start_angle = np.arctan2(element["start"]["y"] - center["y"],
                                       element["start"]["x"] - center["x"])
                end_angle = np.arctan2(element["end"]["y"] - center["y"],
                                     element["end"]["x"] - center["x"])

                if element["clockwise"]:
                    if end_angle > start_angle:
                        end_angle -= 2 * np.pi
                    angles = np.linspace(start_angle, end_angle, n_points)
                else:
                    if end_angle < start_angle:
                        end_angle += 2 * np.pi
                    angles = np.linspace(start_angle, end_angle, n_points)

                radius = arc_radius(element)
                arc_x = center["x"] + radius * np.cos(angles)
                arc_y = center["y"] + radius * np.sin(angles)

                if not x_coords:  # First element
                    x_coords.extend(arc_x.tolist())
                    y_coords.extend(arc_y.tolist())
                else:
                    x_coords.extend(arc_x[1:].tolist())
                    y_coords.extend(arc_y[1:].tolist())

        # Plot the curve
        ax.plot(x_coords, y_coords, color=color, linewidth=linewidth, label=label)

        # Show control points if requested
        if show_points:
            all_points = []
            for element in curve["elements"]:
                all_points.extend([element["start"], element["end"]])
                if element["type"] == "arc":
                    all_points.append(element["center"])

            unique_points = []
            for point in all_points:
                from .core import point_distance
                if not any(point_distance(point, up) < 1e-6 for up in unique_points):
                    unique_points.append(point)

            for point in unique_points:
                ax.plot(point["x"], point["y"], 'ro', markersize=4)


class SVGCurveViewer:
    """SVG-based viewer that mirrors D3.js output more closely."""

    def __init__(self, width: int = 800, height: int = 600, margin: int = 50):
        """Initialize SVG viewer."""
        self.width = width
        self.height = height
        self.margin = margin
        self.view_width = width - 2 * margin
        self.view_height = height - 2 * margin

    def plot_curve(self, curve: Dict[str, Any], stroke_color: str = '#2563eb',
                   stroke_width: float = 2.0, show_points: bool = False) -> str:
        """Generate SVG for a single curve."""
        bounds = self._calculate_bounds([curve])
        transform = self._create_transform(bounds)

        svg_paths = self._curve_to_svg_path(curve, transform)

        svg = self._create_svg_header()
        svg += f'  <g stroke="{stroke_color}" stroke-width="{stroke_width}" fill="none">\n'
        svg += f'    <path d="{svg_paths}" />\n'

        if show_points:
            svg += self._add_control_points(curve, transform, '#ef4444')

        svg += '  </g>\n'
        svg += self._add_grid(bounds, transform)

        name = curve.get('name', 'Curve')
        title = f"{name} ({curve['curve_type']}) - {curve_length(curve):.3f}m"
        svg += self._add_title(title)
        svg += '</svg>'

        return svg

    def plot_curve_array(self, curve_array: Dict[str, Any], colors: List[str] = None) -> str:
        """Generate SVG for an array of curves."""
        if colors is None:
            colors = ['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#c2410c']

        bounds = self._calculate_bounds(curve_array["curves"])
        transform = self._create_transform(bounds)

        svg = self._create_svg_header()

        # Add each curve with different colors
        for i, curve in enumerate(curve_array["curves"]):
            color = colors[i % len(colors)]
            svg_path = self._curve_to_svg_path(curve, transform)
            svg += f'  <g stroke="{color}" stroke-width="2" fill="none">\n'
            svg += f'    <path d="{svg_path}" />\n'
            svg += '  </g>\n'

        svg += self._add_grid(bounds, transform)
        svg += self._add_legend(curve_array["curves"], colors)

        name = curve_array.get('name', 'Curve Array')
        title = f"{name} - Total: {curve_array_length(curve_array):.3f}m"
        svg += self._add_title(title)
        svg += '</svg>'

        return svg

    def display_in_jupyter(self, svg_content: str):
        """Display SVG in Jupyter notebook."""
        try:
            from IPython.display import SVG, display
            display(SVG(svg_content))
        except ImportError:
            print("IPython not available. SVG content generated but not displayed.")

    def _curve_to_svg_path(self, curve: Dict[str, Any], transform) -> str:
        """Convert curve to SVG path string (D3.js compatible)."""
        path_commands = []

        for i, element in enumerate(curve["elements"]):
            if element["type"] == "line":
                start_x, start_y = transform(element["start"]["x"], element["start"]["y"])
                end_x, end_y = transform(element["end"]["x"], element["end"]["y"])

                if i == 0:
                    path_commands.append(f"M {start_x:.2f} {start_y:.2f}")
                path_commands.append(f"L {end_x:.2f} {end_y:.2f}")

            elif element["type"] == "arc":
                start_x, start_y = transform(element["start"]["x"], element["start"]["y"])
                end_x, end_y = transform(element["end"]["x"], element["end"]["y"])

                if i == 0:
                    path_commands.append(f"M {start_x:.2f} {start_y:.2f}")

                # Calculate radius in transformed space
                radius = arc_radius(element) * transform.scale

                # SVG arc flags
                large_arc_flag = 1 if arc_angle(element) > np.pi else 0
                sweep_flag = 0 if element["clockwise"] else 1

                path_commands.append(f"A {radius:.2f} {radius:.2f} 0 {large_arc_flag} {sweep_flag} {end_x:.2f} {end_y:.2f}")

        # Close path if it's a closed curve
        if curve["curve_type"] == "closed":
            path_commands.append("Z")

        return " ".join(path_commands)

    def _calculate_bounds(self, curves: List[Dict[str, Any]]) -> dict:
        """Calculate bounding box for curves."""
        from .core import create_point
        
        all_points = []

        for curve in curves:
            for element in curve["elements"]:
                all_points.extend([element["start"], element["end"]])
                if element["type"] == "arc":
                    # Add arc extremes for better bounds
                    center = element["center"]
                    radius = arc_radius(element)
                    all_points.extend([
                        create_point(center["x"] - radius, center["y"]),
                        create_point(center["x"] + radius, center["y"]),
                        create_point(center["x"], center["y"] - radius),
                        create_point(center["x"], center["y"] + radius)
                    ])

        if not all_points:
            return {"min_x": 0, "max_x": 1, "min_y": 0, "max_y": 1}

        xs = [p["x"] for p in all_points]
        ys = [p["y"] for p in all_points]

        return {
            "min_x": min(xs),
            "max_x": max(xs),
            "min_y": min(ys),
            "max_y": max(ys)
        }

    def _create_transform(self, bounds: dict):
        """Create coordinate transform function."""
        data_width = bounds["max_x"] - bounds["min_x"]
        data_height = bounds["max_y"] - bounds["min_y"]

        if data_width == 0:
            data_width = 1
        if data_height == 0:
            data_height = 1

        # Add 10% padding
        padding = 0.1
        data_width *= (1 + padding)
        data_height *= (1 + padding)

        scale_x = self.view_width / data_width
        scale_y = self.view_height / data_height
        scale = min(scale_x, scale_y)

        # Center the content
        center_x = (bounds["min_x"] + bounds["max_x"]) / 2
        center_y = (bounds["min_y"] + bounds["max_y"]) / 2

        offset_x = self.width / 2 - center_x * scale
        offset_y = self.height / 2 + center_y * scale

        def transform(x, y):
            svg_x = x * scale + offset_x
            svg_y = -y * scale + offset_y  # Flip Y axis
            return svg_x, svg_y

        transform.scale = scale
        return transform

    def _create_svg_header(self) -> str:
        """Create SVG header."""
        return f'<svg width="{self.width}" height="{self.height}" xmlns="http://www.w3.org/2000/svg">\n'

    def _add_control_points(self, curve: Dict[str, Any], transform, color: str = '#ef4444') -> str:
        """Add control points to SVG."""
        svg = f'  <g fill="{color}">\n'

        points_added = set()
        for element in curve["elements"]:
            for point in [element["start"], element["end"]]:
                point_key = (point["x"], point["y"])
                if point_key not in points_added:
                    x, y = transform(point["x"], point["y"])
                    svg += f'    <circle cx="{x:.1f}" cy="{y:.1f}" r="3" />\n'
                    points_added.add(point_key)

            if element["type"] == "arc":
                center = element["center"]
                center_key = (center["x"], center["y"])
                if center_key not in points_added:
                    x, y = transform(center["x"], center["y"])
                    svg += f'    <circle cx="{x:.1f}" cy="{y:.1f}" r="2" fill="#fbbf24" />\n'
                    points_added.add(center_key)

        svg += '  </g>\n'
        return svg

    def _add_grid(self, bounds: dict, transform) -> str:
        """Add grid to SVG."""
        svg = '  <g stroke="#e5e7eb" stroke-width="0.5" opacity="0.5">\n'

        # Calculate grid spacing
        data_width = bounds["max_x"] - bounds["min_x"]
        data_height = bounds["max_y"] - bounds["min_y"]

        grid_step = max(data_width, data_height) / 10

        # Round to nice numbers
        magnitude = 10 ** np.floor(np.log10(grid_step))
        nice_step = magnitude * np.ceil(grid_step / magnitude)

        # Vertical grid lines
        start_x = np.floor(bounds["min_x"] / nice_step) * nice_step
        x = start_x
        while x <= bounds["max_x"]:
            x1, y1 = transform(x, bounds["min_y"])
            x2, y2 = transform(x, bounds["max_y"])
            svg += f'    <line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" />\n'
            x += nice_step

        # Horizontal grid lines
        start_y = np.floor(bounds["min_y"] / nice_step) * nice_step
        y = start_y
        while y <= bounds["max_y"]:
            x1, y1 = transform(bounds["min_x"], y)
            x2, y2 = transform(bounds["max_x"], y)
            svg += f'    <line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" />\n'
            y += nice_step

        svg += '  </g>\n'
        return svg

    def _add_legend(self, curves: List[Dict[str, Any]], colors: List[str]) -> str:
        """Add legend to SVG."""
        svg = '  <g>\n'

        legend_x = 20
        legend_y = 30

        for i, curve in enumerate(curves[:6]):
            color = colors[i % len(colors)]
            y_pos = legend_y + i * 20

            # Color indicator
            svg += f'    <rect x="{legend_x}" y="{y_pos-8}" width="15" height="3" fill="{color}" />\n'

            # Label
            label = curve.get("name", f"Curve {i+1}")
            svg += f'    <text x="{legend_x + 25}" y="{y_pos}" font-family="Arial, sans-serif" font-size="12" fill="#374151">{label}</text>\n'

        svg += '  </g>\n'
        return svg

    def _add_title(self, title: str) -> str:
        """Add title to SVG."""
        return f'  <text x="{self.width//2}" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="#111827">{title}</text>\n'