from typing import Literal

import numpy as np

DEFAULT_OPTIONS = {
    "x_grid": True,
    "y_grid": True,
    "tension": 0.3,
    "line": False,
    "fixed_lines": [],
    "colors": [
        "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#3B3EAC", "#0099C6",
        "#DD4477", "#66AA00", "#B82E2E", "#316395", "#994499", "#22AA99", "#AAAA11",
        "#6633CC", "#E67300", "#8B0707", "#329262", "#5574A6", "#651067"
    ]
}


def set_options(data: dict, options: dict) -> dict:
    if not options:
        options = DEFAULT_OPTIONS.copy()
    options['x_type'] = _get_scale_type(data, 'x')
    options['y_type'] = _get_scale_type(data, 'y')
    options['colors'] = options.get('colors', DEFAULT_OPTIONS['colors'])
    return options


def include_colors(data: dict, options: dict) -> dict:
    for i, (trace_name, trace_data) in enumerate(data.items()):
        trace_data['color'] = options['colors'][i % len(options['colors'])]
    return data


def _get_scale_type(data: dict, axis: Literal['x', 'y']) -> Literal['linear', 'category']:
    for trace_data in data.values():
        if not all(isinstance(val, (int, float, np.number)) for val in trace_data[axis]):
            return 'category'
    return 'linear'

