import { TAU } from "../constants.js"
import wrapValue from "../wrap-value.js"

export default function calculateAngleDelta(a, b) {
    let da = wrapValue((a - b), TAU)
    let db = wrapValue((b - a), TAU)
    return da < db ? -da : db
}