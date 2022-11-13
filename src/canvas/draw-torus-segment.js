import { TAU } from "../math/constants.js"

export default function drawTorusSegment(ctx, x, y, outer, inner, start, end) {
    start = start || 0
    end = end || TAU
    ctx.beginPath()
    ctx.arc(x, y, outer, start , end, false)
    ctx.arc(x, y, inner, end, start, true)
    ctx.closePath()
}