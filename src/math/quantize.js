export default function quantize(value, quantize = 0, threshold = 0) {
    if (!quantize) return value
    let t = threshold * .5 + .5
    return ((t + value * quantize) | 0) / quantize
}