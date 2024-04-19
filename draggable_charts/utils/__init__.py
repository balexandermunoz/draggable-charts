import inspect

from .component_func import component


def get_func_name():
    return inspect.stack()[1][3]
