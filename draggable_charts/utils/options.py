import inspect
from typing import Literal

import numpy as np

DEFAULT_OPTIONS = {
    "x_grid": True,
    "y_grid": True,
    "tension": 0.3,
    "show_line": True,
    "fixed_lines": [],
    "colors": [
        "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#3B3EAC", "#0099C6",
        "#DD4477", "#66AA00", "#B82E2E", "#316395", "#994499", "#22AA99", "#AAAA11",
        "#6633CC", "#E67300", "#8B0707", "#329262", "#5574A6", "#651067"
    ],
    "border_dash": [(0, 0)],
    "point_radius": [3],
    "fill_gaps": False,
    "labels": {},
    "x_format": ".2~s",
    "y_format": ".2~s",
}


def set_options(data: dict, options: dict) -> dict:
    caller_name = inspect.stack()[1].function
    if not options:
        options = DEFAULT_OPTIONS.copy()
    options['x_type'] = _get_scale_type(data, 'x', caller_name)
    options['y_type'] = _get_scale_type(data, 'y', caller_name)

    options['tension'] = options.get('tension', DEFAULT_OPTIONS['tension'])
    options['show_line'] = options.get('show_line', DEFAULT_OPTIONS['show_line'])
    options['fixed_lines'] = options.get('fixed_lines', DEFAULT_OPTIONS['fixed_lines'])

    options['colors'] = options.get('colors', DEFAULT_OPTIONS['colors'])
    options['border_dash'] = options.get('border_dash', DEFAULT_OPTIONS['border_dash'])
    options['point_radius'] = options.get('point_radius', DEFAULT_OPTIONS['point_radius'])
    options['fill_gaps'] = options.get('fill_gaps', DEFAULT_OPTIONS['fill_gaps'])
    options['labels'] = options.get('labels', DEFAULT_OPTIONS['labels'])

    options['x_format'] = options.get('x_format', DEFAULT_OPTIONS['x_format'])
    options['y_format'] = options.get('y_format', DEFAULT_OPTIONS['y_format'])

    data = include_colors(data, options)
    data = include_border_dash(data, options)
    data = include_point_radius(data, options)
    return data, options


def include_colors(data: dict, options: dict) -> dict:
    for i, trace_data in enumerate(data.values()):
        trace_data['color'] = options['colors'][i % len(options['colors'])]
    return data


def include_border_dash(data: dict, options: dict) -> dict:
    for i, trace_data in enumerate(data.values()):
        trace_data['border_dash'] = options['border_dash'][i % len(options['border_dash'])]
    return data


def include_point_radius(data: dict, options: dict) -> dict:
    for i, trace_data in enumerate(data.values()):
        trace_data['point_radius'] = options['point_radius'][i % len(options['point_radius'])]
    return data


def _get_scale_type(data: dict, axis: Literal['x', 'y'], caller: str) -> Literal['linear', 'category']:
    if caller == 'line_chart':
        for trace_data in data.values():
            data = trace_data['data']
            if axis == 'x':
                if not all(val is None or isinstance(val, (int, float, np.number)) for val in data.keys()):
                    return 'category'
            else:
                if not all(val is None or isinstance(val, (int, float, np.number)) for val in data.values()):
                    return 'category'
        return 'linear'
    
    for trace_data in data.values():
        if not all(isinstance(val, (int, float, np.number)) for val in trace_data[axis]):
            return 'category'
    return 'linear'
