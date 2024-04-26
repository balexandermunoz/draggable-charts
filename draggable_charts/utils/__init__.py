import inspect

from .component_func import component
from .callback import register


def get_func_name():
    return inspect.stack()[1][3]
