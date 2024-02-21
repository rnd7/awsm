import wrapValue from "../wrap-value.js"
import interpolateExponential from "../numerical/interpolate-exponetial.js"

export default function exponentialSplineSolver(nodes, x, e = null) {
    const len = nodes.length
    if (!len) return 0
    if (len == 1) return nodes[0].y
    const wrappedTime = wrapValue(x)
    let left
    let right
    for (let i = 0; i < len; i++) {
        let node = nodes[i]
        if (node.x > wrappedTime) {
            right = node
            left = nodes[(i - 1 + len) % len]
            break
        }
    }
    if (!right) {
        right = nodes[0]
        left = nodes[len - 1]
    }
    if (left.x == right.x) return (left.y + right.y) / 2
    if (e === null) e = left.e
    const interval = wrapValue(right.x - left.x)
    const dist = wrapValue(wrappedTime - left.x)
    const q = dist / interval
    return interpolateExponential(left, right, e, q)
}