import { withStreamlitConnection } from "streamlit-component-lib"

import React from "react"
import ReactDOM from "react-dom"
import componentsMap from "./components"

const SelectComponent = (props) => {
  const id = props.args["id"]
  const kw = props.args["kw"]
  const Component = componentsMap[id]
  if (Component === undefined) {
    throw new Error(`Component with id ${id} is not defined in componentsMap.`)
  } else {
    return <Component args={{ ...kw }} theme={props.theme} />
  }
}

const StreamlitComponent = withStreamlitConnection(SelectComponent)

ReactDOM.render(
  <React.StrictMode>
    <StreamlitComponent />
  </React.StrictMode>,
  document.getElementById("root")
)
