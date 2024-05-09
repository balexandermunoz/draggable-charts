import pandas as pd


def validate_scatter_data(data: dict, options: dict) -> None:
    # Check if data is a dictionary
    if not isinstance(data, dict):
        raise ValueError("Data must be a dictionary.")

    # If x is categorical, check if labels are specified
    if options.get('x_type') == 'category' and not options.get('x_labels'):
        raise ValueError("For categorical data in X, you must specify the labels in the options.")

    # If y is categorical, check if labels are specified
    if options.get('y_type') == 'category' and not options.get('y_labels'):
        raise ValueError("For categorical data in Y, you must specify the labels in the options.")

    # Check if each trace is a dictionary with 'x' and 'y' keys
    for trace_name, trace_data in data.items():
        if not isinstance(trace_data, dict) or 'x' not in trace_data or 'y' not in trace_data:
            raise ValueError(
                f"Each trace must be a dictionary with 'x' and 'y' keys. Got: {trace_data}")

        if not isinstance(trace_data['x'], list) or not isinstance(trace_data['y'], list):
            raise ValueError(
                f"Both 'x' and 'y' must be lists. Got: x: {type(trace_data['x'])} y: {type(trace_data['y'])}")

        if len(trace_data['x']) != len(trace_data['y']):
            raise ValueError(
                f"'x' and 'y' must be lists of the same length. Got: x={trace_data['x']}, y={trace_data['y']}")


def validate_bezier_data(data: dict, options: dict) -> None:
    if options.get('x_type') == 'category' or options.get('y_type') == 'category':
        raise ValueError("Bezier charts do not support categorical data.")

    validate_scatter_data(data, options)


def validate_line_data(data: dict) -> None:
    if isinstance(data, pd.Series):
        return
    elif isinstance(data, pd.DataFrame):
        non_numeric_columns = data.select_dtypes(exclude='number').columns
        if len(non_numeric_columns) > 0:
            raise ValueError(
                f"The DataFrame contains non-numeric columns: {list(non_numeric_columns)}. "
                "Expected a DataFrame with only numeric columns."
            )
    else:
        raise ValueError(
            f"Invalid data type: {type(data).__name__}. "
            "Expected a pandas Series or DataFrame."
        )
