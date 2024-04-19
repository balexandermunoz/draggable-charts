import os

import streamlit as st
import streamlit.components.v1 as components

from draggable_charts import _RELEASE

if not _RELEASE:
    _component_func = components.declare_component(
        "draggable-chart",
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func = components.declare_component(
        "draggable-chart", path=build_dir)


def convert_session_value(id, value, kv: dict, return_index: bool):
    if value is not None:
        list_value = value if isinstance(value, list) else [value]
        if len(list_value) == 0:
            return
        if kv is not None:
            # index list
            r = [k for k, v in kv.items() if (
                k if return_index else v) in list_value]
            if len(r) == 0:
                raise ValueError(f'{value} is invalid in {id} component !')
            return r if isinstance(value, list) else r[0]
        else:
            return value


def component(id, kw, default=None, key=None):
    return _component_func(id=id, kw=kw, default=default, key=key)
