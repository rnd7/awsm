import { TAU } from "../constants.js"

export default function calculateAngle(ax, ay, bx, by) {
    let angle = Math.atan2(by - ay, bx - ax)
    if ( angle < 0 ) angle += TAU
    return angle
}