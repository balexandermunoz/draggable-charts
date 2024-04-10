import os
from typing import Any, Dict, Union

import pandas as pd
import streamlit.components.v1 as components

# Create a _RELEASE constant. We'll set this to False while we're developing
# the component, and True when we're ready to package and distribute it.
# (This is, of course, optional - there are innumerable ways to manage your
# release process.)
_RELEASE = False

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


def draggable_line_chart(
    data: Union[pd.DataFrame, pd.Series],
    options: Dict[str, Any] = {},
    key: str = None
) -> Union[pd.DataFrame, pd.Series]:
    """
    Displays a line chart with draggable points.

    Parameters
    ----------
    data : pd.Series, pd.DataFrame
        The data to display in the chart. Index is always X values and columns are Y values. Columns should have only numeric values. 
        Series.name is the trace name. If a DataFrame is provided, the column names are the trace names.
    options : dict[str: any], optional
        A dictionary of options for the chart. It can include the following keys:
        - 'title': The title of the chart.
        - 'colors': A list of colors for the chart traces. Each color must be a hexadecimal color code. The order of the colors corresponds to the order of the columns.
        - 'x_label': The label for the x-axis.
        - 'y_label': The label for the y-axis.
        - 'x_grid': A boolean indicating whether to display the grid for the x-axis.
        - 'y_grid': A boolean indicating whether to display the grid for the y-axis.
        - 'legend': A boolean indicating whether to display the legend. If not provided, the legend will be displayed by default.
        - 'legend_position': The position of the legend. It can be 'top', 'left', 'bottom', or 'right'.
        - 'legend_align': The alignment of the legend. It can be 'start', 'center', or 'end'.
        If not provided, default options will be used.
    key : str, optional
        An optional string to use as the unique key for the widget. If this is None, and the component's arguments are changed, the component will be re-mounted in the Streamlit frontend and lose its current state.

    Returns
    -------
    pd.DataFrame
        The data of the chart after user interaction. The format is the same as the input format.

    Raises
    ------
    ValueError
        If the data is not a pandas Series, DataFrame, or a dictionary, or if the DataFrame does not have only numeric columns.
    """
    if not options:
        options = {
            "x_grid": True,
            "y_grid": True
        }
    if isinstance(data, pd.Series):
        if data.name is None:
            data.name = "data"
        dict_data = {data.name: data.to_dict()}
    elif isinstance(data, pd.DataFrame):
        if not data.apply(lambda s: pd.to_numeric(s, errors='coerce').notnull().all()).all():
            raise ValueError("The DataFrame must have only numeric columns.")
        dict_data = data.to_dict()
    else:
        raise ValueError("The data must be a pandas Series or DataFrame.")
        
    new_data = _draggable_line_chart(data=dict_data, options=options, key=key, default=data)
    if isinstance(data, pd.Series):
        return pd.Series(new_data[data.name])
    elif isinstance(data, pd.DataFrame):
        return pd.DataFrame(new_data)
