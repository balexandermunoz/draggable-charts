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