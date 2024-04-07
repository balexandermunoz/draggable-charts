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


def draggable_line_chart(data: dict[dict[str: float]], options: dict[str: any] = None, key: str = None):
    """
    This component displays a line chart with interactive capabilities. The chart's title, data, and line colors can be customized.

    Parameters
    ----------
    data : dict[dict[str: float]]
        The data to display in the chart. It can be df.to_dict() with only numbers.
    options : dict[str: any], optional
        A dictionary of options for the chart. It can include the following keys:
        - 'title': The title of the chart.
        - 'colors': A list of colors for the lines in the chart. Each color should be a string in a format accepted by CSS, such as a hex color code. The order of the colors corresponds to the order of the datasets.
        - 'x_label': The label for the x-axis.
        - 'y_label': The label for the y-axis.
        If not provided, default options will be used.
    key : str, optional
        An optional string to use as the unique key for the widget. If this is None, and the component's arguments are changed, the component will be re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    dict[dict[str: float]]
        The data of the chart after user interaction. The format is the same as the input format.
    """
    component_value = _draggable_line_chart(
        data=data, options=options, key=key, default=data)

    return component_value
