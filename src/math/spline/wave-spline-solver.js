import { EXPONENTIAL_NODE_SPLINE, EXPONENTIAL_SPLINE, STEP } from "../../model/wave-spline-type.js"
import wrapValue from "../wrap-value.js"
import exponentialSplineSolver from "./exponential-spline-solver.js"
import stepSplineSolver from "./step-spline-solver.js"
export default function waveSplineSolver(waveSpline, x, phase = 0) {
    x = wrapValue(x - phase)
    if (waveSpline.type === EXPONENTIAL_SPLINE) {
        return exponentialSplineSolver(waveSpline.nodes, x, waveSpline.e)
    } else if (waveSpline.type === EXPONENTIAL_NODE_SPLINE) {
        return exponentialSplineSolver(waveSpline.nodes, x)
    } else if (waveSpline.type === STEP) {
        return stepSplineSolver(waveSpline.nodes, x)
    }
    return 0
}