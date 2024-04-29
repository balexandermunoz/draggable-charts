import LineChart from "./LineChart/LineChart";
import ScatterChart from "./ScatterChart/ScatterChart";
import BezierChart from "./BezierChart/BezierChart";
import CubicBezierChart from "./CubicBezierChart/CubicBezierChart";

const componentsMap = {
  line_chart: LineChart,
  scatter_chart: ScatterChart,
  bezier_chart: BezierChart,
  cubic_bezier_chart: CubicBezierChart,
}

export default componentsMap
