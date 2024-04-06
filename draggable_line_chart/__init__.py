import os
import streamlit.components.v1 as components

# Create a _RELEASE constant. We'll set this to False while we're developing
# the component, and True when we're ready to package and distribute it.
# (This is, of course, optional - there are innumerable ways to manage your
# release process.)
_RELEASE = True

# Declare a Streamlit component. `declare_component` returns a function
# that is used to create instances of the component. We're naming this
# function "_draggable_line_chart", with an underscore prefix, because we don't want
# to expose it directly to users. Instead, we will create a custom wrapper
# function, below, that will serve as our component's public API.

# It's worth noting that this call to `declare_component` is the
# *only thing* you need to do to create the binding between Streamlit and
# your component frontend. Everything else we do in this file is simply a
# best practice.

if not _RELEASE:
    _draggable_line_chart = components.declare_component(
        "draggable_line_chart",
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _draggable_line_chart = components.declare_component(
        "draggable_line_chart", path=build_dir)


# Create a wrapper function for the component. This is an optional
# best practice - we could simply expose the component function returned by
# `declare_component` and call it done. The wrapper allows us to customize
# our component's API: we can pre-process its input args, post-process its
# output value, and add a docstring for users.
def draggable_line_chart(title: str, data: dict[dict[str: float]], colors: list[str]=None, key=None):
    """
    This component displays a line chart with interactive capabilities. The chart's title, data, and line colors can be customized.

    Parameters
    ----------
    title : str
        The title of the chart.
    data : dict[dict[str: float]]
        The data to display in the chart. It can be df.to_dict() with only numbers.
    colors : list[str], optional
        A list of colors for the lines in the chart. Each color should be a string in a format accepted by CSS, such as a hex color code. The order of the colors corresponds to the order of the datasets. If not provided, default colors will be used.
    key : str, optional
        An optional string to use as the unique key for the widget. If this is None, and the component's arguments are changed, the component will be re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    dict[dict[str: float]]
        The data of the chart after user interaction. The format is the same as the input format.
    """
    component_value = _draggable_line_chart(
        title=title, data=data, colors=colors, key=key, default=data)

    return component_value
