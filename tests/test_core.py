"""Tests for core geometric functions."""

import pytest
import numpy as np
from floor_composer.core import (
    create_point, create_line_segment, create_arc_segment, create_curve,
    point_distance, line_length, arc_radius, arc_angle, arc_length,
    element_length, curve_length, validate_curve
)


class TestBasicGeometry:
    """Test basic geometric primitives."""

    def test_create_point(self):
        """Test point creation."""
        p = create_point(1.0, 2.0)
        assert p["x"] == 1.0
        assert p["y"] == 2.0

    def test_point_distance(self):
        """Test distance calculation."""
        p1 = create_point(0, 0)
        p2 = create_point(3, 4)
        assert point_distance(p1, p2) == 5.0

    def test_create_line_segment(self):
        """Test line segment creation."""
        start = create_point(0, 0)
        end = create_point(1, 0)
        line = create_line_segment(start, end)
        
        assert line["type"] == "line"
        assert line["start"] == start
        assert line["end"] == end

    def test_line_length(self):
        """Test line length calculation."""
        line = create_line_segment(
            create_point(0, 0),
            create_point(3, 4)
        )
        assert line_length(line) == 5.0

    def test_create_arc_segment(self):
        """Test arc segment creation."""
        start = create_point(1, 0)
        end = create_point(0, 1)  
        center = create_point(0, 0)
        arc = create_arc_segment(start, end, center, clockwise=False)
        
        assert arc["type"] == "arc"
        assert arc["start"] == start
        assert arc["end"] == end
        assert arc["center"] == center
        assert arc["clockwise"] == False

    def test_arc_radius(self):
        """Test arc radius calculation."""
        arc = create_arc_segment(
            create_point(1, 0),
            create_point(0, 1),
            create_point(0, 0)
        )
        assert arc_radius(arc) == 1.0

    def test_arc_angle(self):
        """Test arc angle calculation."""
        # Quarter circle counter-clockwise
        arc = create_arc_segment(
            create_point(1, 0),
            create_point(0, 1),
            create_point(0, 0),
            clockwise=False
        )
        angle = arc_angle(arc)
        assert abs(angle - np.pi/2) < 1e-10

    def test_arc_length(self):
        """Test arc length calculation."""
        # Quarter circle with radius 1
        arc = create_arc_segment(
            create_point(1, 0),
            create_point(0, 1),
            create_point(0, 0),
            clockwise=False
        )
        length = arc_length(arc)
        expected = np.pi/2  # Quarter of circumference of unit circle
        assert abs(length - expected) < 1e-10


class TestCurveCreation:
    """Test curve creation and validation."""

    def test_create_simple_curve(self):
        """Test creating a simple curve."""
        elements = [
            create_line_segment(create_point(0, 0), create_point(1, 0)),
            create_line_segment(create_point(1, 0), create_point(1, 1))
        ]
        curve = create_curve(elements, "open", "L-Shape")
        
        assert curve["elements"] == elements
        assert curve["curve_type"] == "open"
        assert curve["name"] == "L-Shape"

    def test_curve_length_calculation(self):
        """Test curve length calculation."""
        # Create an L-shaped curve: (0,0) -> (3,0) -> (3,4)
        elements = [
            create_line_segment(create_point(0, 0), create_point(3, 0)),
            create_line_segment(create_point(3, 0), create_point(3, 4))
        ]
        curve = create_curve(elements, "open", "L-Shape")
        
        assert curve_length(curve) == 7.0  # 3 + 4

    def test_validate_continuous_curve(self):
        """Test curve continuity validation."""
        # Valid continuous curve
        elements = [
            create_line_segment(create_point(0, 0), create_point(1, 0)),
            create_line_segment(create_point(1, 0), create_point(1, 1))
        ]
        curve = create_curve(elements, "open", "Valid")
        assert validate_curve(curve) == True

    def test_validate_discontinuous_curve_raises_error(self):
        """Test that discontinuous curves raise validation errors."""
        # Invalid discontinuous curve
        elements = [
            create_line_segment(create_point(0, 0), create_point(1, 0)),
            create_line_segment(create_point(2, 0), create_point(2, 1))  # Gap!
        ]
        
        with pytest.raises(ValueError, match="Curve discontinuity"):
            create_curve(elements, "open", "Invalid")

    def test_validate_closed_curve(self):
        """Test closed curve validation."""
        # Valid closed square
        elements = [
            create_line_segment(create_point(0, 0), create_point(1, 0)),
            create_line_segment(create_point(1, 0), create_point(1, 1)),
            create_line_segment(create_point(1, 1), create_point(0, 1)),
            create_line_segment(create_point(0, 1), create_point(0, 0))
        ]
        curve = create_curve(elements, "closed", "Square")
        assert validate_curve(curve) == True

    def test_validate_unclosed_curve_raises_error(self):
        """Test that improperly closed curves raise errors."""
        # Invalid "closed" curve that doesn't close
        elements = [
            create_line_segment(create_point(0, 0), create_point(1, 0)),
            create_line_segment(create_point(1, 0), create_point(1, 1)),
            create_line_segment(create_point(1, 1), create_point(0, 1))
            # Missing closing segment!
        ]
        
        with pytest.raises(ValueError, match="not properly closed"):
            create_curve(elements, "closed", "Invalid")


class TestElementLength:
    """Test element length calculations."""

    def test_element_length_line(self):
        """Test element length for line segments."""
        line = create_line_segment(create_point(0, 0), create_point(3, 4))
        assert element_length(line) == 5.0

    def test_element_length_arc(self):
        """Test element length for arc segments."""
        arc = create_arc_segment(
            create_point(1, 0),
            create_point(0, 1),
            create_point(0, 0),
            clockwise=False
        )
        length = element_length(arc)
        expected = np.pi/2
        assert abs(length - expected) < 1e-10

    def test_element_length_unknown_type_raises_error(self):
        """Test that unknown element types raise errors."""
        invalid_element = {"type": "unknown", "data": "test"}
        
        with pytest.raises(ValueError, match="Unknown element type"):
            element_length(invalid_element)