from utils import component, get_func_name

DEFAULT_OPTIONS = {
    "x_grid": True,
    "y_grid": True,
    "tension": 0.3
}


def scatter_chart(data: dict, options:dict = None, key:str=None) -> dict:
    if not options:
        options = DEFAULT_OPTIONS.copy()
    return component(id=get_func_name(), kw=locals(), default=data, key=key)
