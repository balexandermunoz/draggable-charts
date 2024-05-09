# draggable-charts

Streamlit component that displays a interactive charts with draggable points. Users can click and drag points on the chart to adjust their values. The updated data of the chart is returned.

## Installation instructions

```sh
pip install draggable-charts
```


## Usage

## Line Chart:
Displays a line chart with draggable points in one axis.
- `data` (`pd.Series`, `pd.DataFrame`): The data to display in the chart. Index is always X values and columns are Y values. Columns should have only numeric values. Series.name is the trace name. If a DataFrame is provided, the column names are the trace names.

- `options` (`dict[str: any]`, optional): A dictionary of options for the chart. See [Options](#options) for more details.

- `on_change` (`Callable`, optional): A callback function that is called with the new data of the chart after user interaction.

- `args` (`tuple`, optional): The arguments to pass to the callback function.

- `kwargs` (`dict`, optional): The keyword arguments to pass to the callback function.

- `key` (`str`, optional): An optional string to use as the unique key for the widget. If this is None, and the component's arguments are changed, the component will be re-mounted in the Streamlit frontend and lose its current state.

#### Returns

- `new_data` (`pd.Series`, `pd.DataFrame`): The data of the chart after user interaction. The format is the same as the input format.


## Scatter Chart:
Displays a scatter chart with draggable points. Axes can be categorical or numerical.
- `data` (`dict`): The data to display in the chart. Control points will be added in between. It has the form 
`{"trace 1": {"x": [1,2,3], "y": [1, 4, 9]},
    "trace 2": ...
    }`
- `options` (`dict`): A dictionary of options for the chart.

- `on_change` (`Callable`, optional): A callback function that is called with the new data of the chart after user interaction.

- `args` (`tuple`, optional): The arguments to pass to the callback function.

- `kwargs` (`dict`, optional): The keyword arguments to pass to the callback function.

- `key` (`str`, optional): An optional string to use as the unique key for the widget. If this is None, and the component's arguments are changed, the component will be re-mounted in the Streamlit frontend and lose its current state.

#### Returns

- `new_data` (`dict[str, dict]`): The data of the chart after user interaction. The format is the same as the input format.


## Bezier Chart:
Displays a quadratic Bezier chart with draggable points to adjust the curvature with one control point per each two data points.
- `data` (`dict`): The data to display in the chart. It has the form 
`{"trace 1": {"x": [1,2,3], "y": [1, 4, 9]},
    "trace 2": ...
    }`
- `options` (`dict`): A dictionary of options for the chart.

- `on_change` (`Callable`, optional): A callback function that is called with the new data of the chart after user interaction.

- `args` (`tuple`, optional): The arguments to pass to the callback function.

- `kwargs` (`dict`, optional): The keyword arguments to pass to the callback function.

- `key` (`str`, optional): An optional string to use as the unique key for the widget. If this is None, and the component's arguments are changed, the component will be re-mounted in the Streamlit frontend and lose its current state.

#### Returns

- `new_data` (`dict[str, dict]`): The data of the interpolated Bezier curve after user interaction. The format is the same as the input format.

## Cuadratic Bezier Chart:
Displays a cubic Bezier chart with draggable points to adjust the curvature with two control point per each two data points. The movement between control points is attached to create a smooth interaction.
- `data` (`dict`): The data to display in the chart. It has the form 
`{"trace 1": {"x": [1,2,3], "y": [1, 4, 9]},
    "trace 2": ...
    }`
- `options` (`dict`): A dictionary of options for the chart.

- `on_change` (`Callable`, optional): A callback function that is called with the new data of the chart after user interaction.

- `args` (`tuple`, optional): The arguments to pass to the callback function.

- `kwargs` (`dict`, optional): The keyword arguments to pass to the callback function.

- `key` (`str`, optional): An optional string to use as the unique key for the widget. If this is None, and the component's arguments are changed, the component will be re-mounted in the Streamlit frontend and lose its current state.

#### Returns

- `new_data` (`dict[str, dict]`): The data of the interpolated Bezier curve after user interaction. The format is the same as the input format.



## Options:
All options are sent in the same dictionary `options`. There are common options that applies to the canvas, and specific options applied to traces. Canvas options are:

### Canvas options:
  - `'title'`: The title of the chart.
  - `'x_label'`: Text in x-axis.
  - `'y_label'`: Text in y-axis.
  - `'x_grid'`: A boolean indicating whether to display the grid for the x-axis.
  - `'y_grid'`: A boolean indicating whether to display the grid for the y-axis.
  - `'legend'`: A boolean indicating whether to display the legend. If not provided, the legend will be displayed by default.
  - `'legend_position'`: The position of the legend. It can be `'top'`, `'left'`, `'bottom'`, or `'right'`.
  - `'legend_align'`: The alignment of the legend. It can be `'start'`, `'center'`, or `'end'`.
  If not provided, default options will be used.
  - `'labels'`: Default {}. Dictionary with a map from original labels to custom labels.
  - `'x_format'`: Default None. A printf-style format string controlling how the canvas should display X numeric ticks. Check: https://d3js.org/d3-format#locale_format
  - `'y_format'`: Default `".2~s"`. A printf-style format string controlling how the canvas should display Y numeric ticks.

  ### Chart options:
  - `'show_line`: Boolean that indicates whether to display the line connecting the points on the graph.
  - `'colors'`: A list of colors for the chart traces. Each color must be a hexadecimal color code. The order of the colors corresponds to the order of the columns.
  - `'tension'`: The tension of the lines. 0 gives straight lines, 0.5 gives smooth lines. Default is 0.3.
  - `'fill_gaps'`: A Boolean that indicates whether NaN values are filled in the lines. If False, lines will be broken at NaN values. Default is False.
  - `'fixed_lines'`: List of column names that cannot be dragged. Default is an empty list.
  - `'border_dash'`: Default [(0,0)]. A list of tuples with length and spacing of dashes per every trace. It will repeat if more traces than tuples are provided.
  - `'point_radius'`: Default [3]. The radius of the point shape per trace. If set to 0, the point is not rendered. 


## Example

```python
import streamlit as st

from draggable_charts import scatter_chart

st.subheader("Scatter")
x_cat = ["A", "B", "C", "D", "E"]
scatter_data = {
    "trace 1": {"x": x_cat, "y": [1, 4, 9, 16, 25]},
    "trace 2": {"x": x_cat, "y": [1, 8, 27, 64, 125]},
    "trace 3": {"x": x_cat, "y": [1, 16, 81, 256, 625]},
}
new_scatter_data = scatter_chart(
    data=scatter_data,
    options={"x_labels": x_cat, "show_line": True,
             "tension": 0, "fixed_lines": ["trace 1"]}
)
new_scatter_data

```