import os
from typing import Any, Dict, Union

import numpy as np
import pandas as pd
import streamlit.components.v1 as components

_RELEASE = True

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
        - 'tension': The tension of the lines. 0 gives straight lines, 0.5 gives smooth lines. Default is 0.3.
        - 'fill_gaps': A Boolean that indicates whether NaN values are filled in the lines. If False, lines will be broken at NaN values. Default is False.
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
            "y_grid": True,
            "tension": 0.3
        }
    if isinstance(data, pd.Series):
        if not data.name:
            data.name = "data"
        dict_data = {data.name: data.replace({np.nan: None}).to_dict()}
    elif isinstance(data, pd.DataFrame):
        non_numeric_columns = data.select_dtypes(exclude='number').columns
        if len(non_numeric_columns) > 0:
            raise ValueError(
                f"The DataFrame contains non-numeric columns: {list(non_numeric_columns)}"
            )
        dict_data = data.replace({np.nan: None}).to_dict()
    else:
        raise ValueError("The data must be a pandas Series or DataFrame.")

    new_data = _draggable_line_chart(
        data=dict_data, options=options, key=key, default=data)
    if isinstance(data, pd.Series) and isinstance(new_data, pd.Series):
        return pd.Series(new_data)
    elif isinstance(data, pd.Series):
        new_series = pd.Series(new_data[data.name])
        new_series.name = data.name
        return new_series
    elif isinstance(data, pd.DataFrame):
        return pd.DataFrame(new_data)
