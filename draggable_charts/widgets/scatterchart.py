from typing import Any, Callable

from ..utils import component, get_func_name, register
from ..utils.options import set_options
from ..utils.data_validation import validate_scatter_data

def scatter_chart(
    data: dict,
    options: dict = None,
    on_change: Callable = None,
    args: tuple[Any, ...] = None,
    kwargs: dict[str, Any] = None,
    key: str = None
) -> dict:
    register(key, on_change, args, kwargs)
    data, options = set_options(data, options)
    validate_scatter_data(data, options)
    return component(id=get_func_name(), kw=locals(), default=data, key=key)
