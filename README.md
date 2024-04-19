# st-draggable-line-chart

Streamlit component that displays a line chart with draggable points. Users can click and drag points on the chart to adjust their values. The updated data of the chart is returned.

## Installation instructions

```sh
pip install draggable-line-chart
```


## Usage

- `data` (`pd.Series`, `pd.DataFrame`): The data to display in the chart. Index is always X values and columns are Y values. Columns should have only numeric values. Series.name is the trace name. If a DataFrame is provided, the column names are the trace names.

- `options` (`dict[str: any]`, optional): A dictionary of options for the chart. It can include the following keys:
  - `'title'`: The title of the chart.
  - `'colors'`: A list of colors for the chart traces. Each color must be a hexadecimal color code. The order of the colors corresponds to the order of the columns.
  - `'x_label'`: Text in x-axis.
  - `'y_label'`: Text in y-axis.
  - `'x_grid'`: A boolean indicating whether to display the grid for the x-axis.
  - `'y_grid'`: A boolean indicating whether to display the grid for the y-axis.
  - `'legend'`: A boolean indicating whether to display the legend. If not provided, the legend will be displayed by default.
  - `'legend_position'`: The position of the legend. It can be `'top'`, `'left'`, `'bottom'`, or `'right'`.
  - `'legend_align'`: The alignment of the legend. It can be `'start'`, `'center'`, or `'end'`.
  If not provided, default options will be used.
  - `'tension'`: The tension of the lines. 0 gives straight lines, 0.5 gives smooth lines. Default is 0.3.
  - `'fill_gaps'`: A Boolean that indicates whether NaN values are filled in the lines. If False, lines will be broken at NaN values. Default is False.
  - `'fixed_lines'`: List of column names that cannot be dragged. Default is an empty list.

- `key` (`str`, optional): An optional string to use as the unique key for the widget. If this is None, and the component's arguments are changed, the component will be re-mounted in the Streamlit frontend and lose its current state.

#### Returns

- `new_data` (`pd.Series`, `pd.DataFrame`): The data of the chart after user interaction. The format is the same as the input format.

#### Raises

- `ValueError`: If the data is not a pandas Series or DataFrame or if the DataFrame does not have only numeric columns.

## Example

```python

```