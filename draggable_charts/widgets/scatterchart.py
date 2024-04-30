from typing import Any, Callable, Literal

import numpy as np

from ..utils import component, get_func_name, register
from ..utils.options import DEFAULT_OPTIONS


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
        raise ValueError("For categorical data in X, you must specify the labels in the options.")

    # If y is categorical, check if labels are specified
    if options.get('y_type') == 'category' and not options.get('y_labels'):
        raise ValueError("For categorical data in Y, you must specify the labels in the options.")

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


def scatter_chart(
    data: dict,
    options: dict = None,
    on_change: Callable = None,
    args: tuple[Any, ...] = None,
    kwargs: dict[str, Any] = None,
    key: str = None
) -> dict:
    register(key, on_change, args, kwargs)
    if not options:
        options = DEFAULT_OPTIONS.copy()
    options['x_type'] = _get_scale_type(data, 'x')
    options['y_type'] = _get_scale_type(data, 'y')
    _validate_scatter_data(data, options)
    return component(id=get_func_name(), kw=locals(), default=data, key=key)
