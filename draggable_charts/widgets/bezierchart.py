from utils import component, get_func_name
from typing import Literal
import numpy as np

DEFAULT_OPTIONS = {
    "x_grid": True,
    "y_grid": True,
    "tension": 0.3,
    "line": False,
}


def _get_scale_type(data: dict, axis: Literal['x', 'y']) -> Literal['linear', 'category']:
    for trace_data in data.values():
        if not all(isinstance(val, (int, float, np.number)) for val in trace_data[axis]):
            return 'category'
    return 'linear'


def _validate_scatter_data(data: dict, options: dict) -> None:
    # Check if data is a dictionary
    if not isinstance(data, dict):
        raise ValueError("Data must be a dictionary.")

    # If x is categorical, check if labels are specified
    if options.get('x_type') == 'category' and not options.get('x_labels'):
        raise ValueError(
            "For categorical data in X, you must specify the labels in the options.")

    # If y is categorical, check if labels are specified
    if options.get('y_type') == 'category' and not options.get('y_labels'):
        raise ValueError(
            "For categorical data in Y, you must specify the labels in the options.")

    # Check if each trace is a dictionary with 'x' and 'y' keys
    for trace_name, trace_data in data.items():
        if not isinstance(trace_data, dict) or 'x' not in trace_data or 'y' not in trace_data:
            raise ValueError(
                f"Each trace must be a dictionary with 'x' and 'y' keys. Got: {trace_data}")

        if not isinstance(trace_data['x'], list) or not isinstance(trace_data['y'], list):
            raise ValueError(
                f"Both 'x' and 'y' must be lists. Got: x: {type(trace_data['x'])} y: {type(trace_data['y'])}")

        if len(trace_data['x']) != len(trace_data['y']):
            raise ValueError(
                f"'x' and 'y' must be lists of the same length. Got: x={trace_data['x']}, y={trace_data['y']}")


def bezier_chart(
    data: dict,
    t: float = 0.5,
    options: dict = None,
    key: str = None
) -> dict:
    if not options:
        options = DEFAULT_OPTIONS.copy()
    options['x_type'] = _get_scale_type(data, 'x')
    options['y_type'] = _get_scale_type(data, 'y')
    _validate_scatter_data(data, options)
    data = add_control_points(data, t)
    return component(id=get_func_name(), kw=locals(), default=data, key=key)


def add_control_points(data: dict, t: float = 0.5) -> dict:
    for trace_data in data.values():
        if len(trace_data['x']) < 2:
            continue
        control_points = calculate_control_points(trace_data, t)
        # Add control points into data:
        for i, (x_c, y_c) in enumerate(control_points):
            trace_data['x'].insert(2 * i + 1, x_c)
            trace_data['y'].insert(2 * i + 1, y_c)
    return data


def calculate_control_points(trace_data: dict, t: float) -> list:
    control_points = []
    for i in range(len(trace_data['x']) - 1):
        x_0, y_0 = trace_data['x'][i], trace_data['y'][i]
        x_1, y_1 = trace_data['x'][i + 1], trace_data['y'][i + 1]
        if i == 0:
            x_c, y_c = calculate_first_control_point(x_0, y_0, x_1, y_1, t)
        else:
            x_c, y_c = calculate_next_control_point(x_c, y_c, x_0, y_0, x_1)
        control_points.append((x_c, y_c))
    return control_points


def calculate_first_control_point(
    x_0: float, y_0: float,
    x_1: float, y_1: float,
    t: float
) -> tuple[float, float]:
    x_c = x_0 + (x_1 - x_0) / 2
    y_c = y_0 + t * (y_1 - y_0)
    return x_c, y_c


def calculate_next_control_point(
    x_c: float, y_c: float,
    x_0: float, y_0: float,
    x_1: float
) -> tuple[float, float]:
    m = (y_0 - y_c) / (x_0 - x_c)
    b = y_0 - m * x_0
    x_cn = x_0 + (x_1 - x_0) / 2
    y_cn = m * x_cn + b
    return x_cn, y_cn
