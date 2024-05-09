from typing import Any, Callable, Dict, Union

import numpy as np
import pandas as pd

from ..utils import component, get_func_name, register
from ..utils.data_validation import validate_line_data
from ..utils.options import set_options


def line_chart(
    data: Union[pd.DataFrame, pd.Series],
    options: Dict[str, Any] = {},
    on_change: Callable = None,
    args: tuple[Any, ...] = None,
    kwargs: dict[str, Any] = None,
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
        A dictionary of options for the chart.
    on_change : Callable, optional
        A callback function that is called with the new data of the chart after user interaction.
    args : tuple, optional
        The arguments to pass to the callback function.
    kwargs : dict, optional
        The keyword arguments to pass to the callback function.
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
    register(key, on_change, args, kwargs)
    validate_line_data(data)
    dict_data = transform_data(data)
    dict_data, options = set_options(dict_data, options)
    new_data = component(
        id=get_func_name(),
        kw={"data": dict_data, "options": options},
        default=data,
        key=key
    )
    new_df = postprocess_data(data, new_data)
    return new_df


def transform_data(data) -> dict:
    if isinstance(data, pd.Series):
        if not data.name:
            data.name = "data"
        dict_data = {data.name: data.replace({np.nan: None}).to_dict()}
    elif isinstance(data, pd.DataFrame):
        dict_data = data.replace({np.nan: None}).to_dict()
    dict_data = {key: {"data": val} for key, val in dict_data.items()}
    return dict_data


def postprocess_data(data, new_data) -> pd.DataFrame:
    if not isinstance(new_data, pd.Series) and "data" in new_data[list(new_data.keys())[0]]:
        new_data = {key: val["data"] for key, val in new_data.items()}
    if isinstance(data, pd.Series) and isinstance(new_data, pd.Series):
        return pd.Series(new_data)
    elif isinstance(data, pd.Series):
        new_series = pd.Series(new_data[data.name])
        new_series.name = data.name
        return new_series
    elif isinstance(data, pd.DataFrame):
        return pd.DataFrame(new_data)
