from typing import Any, Callable

from bezier_interpolation import quadratic_interpolation

from ..utils import component, get_func_name, register
from ..utils.data_validation import validate_bezier_data
from ..utils.options import set_options


def bezier_chart(
    data: dict,
    t: float = 0.5,
    options: dict = None,
    on_change: Callable = None,
    args: tuple[Any, ...] = None,
    kwargs: dict[str, Any] = None,
    key: str = None
) -> dict:
    register(key, on_change, args, kwargs)
    validate_bezier_data(data, options)
    data = add_control_points(data, options, t)
    data, options = set_options(data, options)
    default_data = {k: v for k, v in data.items() if k not in options["fixed_lines"]}
    return component(id=get_func_name(), kw=locals(), default=default_data, key=key)


def add_control_points(data: dict, options: dict, t: float) -> dict:
    for trace_name, trace_data in data.items():
        if trace_name in options["fixed_lines"]:
            continue
        
        points = list(zip(trace_data['x'], trace_data['y']))
        new_points = quadratic_interpolation(points, t)
        trace_data['x'], trace_data['y'] = zip(*new_points)
    return data
