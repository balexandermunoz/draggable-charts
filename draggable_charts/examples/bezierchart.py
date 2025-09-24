import streamlit as st

from draggable_charts import bezier_chart

st.header("Bezier")
data = {
    "trace 1": {"x": [2000.5, 2001, 2002, 2003, 2004], "y": [1, -8, 10, 16, -25]},
    "trace 2": {"x": [2000.5, 2001, 2002, 2003, 2004], "y": [1, 8, 27, 64, 125]},
}
new_data = bezier_chart(
    data,
    t=0.5,
    options={
        "x_type": "time",
        "fixed_lines": ["trace 2"],
        "colors": ['blue', 'red']
    }
)
new_data
