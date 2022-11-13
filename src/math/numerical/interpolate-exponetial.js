import interpolateLinear from "./interpolate-linear.js"

export default function interpolateExponential(a, b, e, x) {
    if (e == 1) return interpolateLinear(a.y, b.y, x) // is linear
    if (x < .5) return interpolateLinear(a.y, b.y, Math.pow((x * 2), e) / 2)
    return interpolateLinear(a.y, b.y, 1 - Math.pow(((1-x) * 2), e) / 2)
}