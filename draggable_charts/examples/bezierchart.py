import streamlit as st

from draggable_charts import bezier_chart

st.header("Bezier")
data = {
    "trace 1": {"x": [1, 2, 3, 4, 5], "y": [1, -8, 10, 16, -25]},
    "trace 2": {"x": [1, 2, 3, 4, 5], "y": [1, 8, 27, 64, 125]},
}
new_data = bezier_chart(
    data,
    t=0.5,
    options={
        "fixed_lines": ["trace 2"],
        "colors": ['blue', 'red']
    }
)
new_data
