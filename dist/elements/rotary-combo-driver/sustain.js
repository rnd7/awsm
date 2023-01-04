import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MIN_SUSTAIN = 0
const MAX_SUSTAIN = 60
const INF_VALUE = MAX_SUSTAIN + 1
export const SUSTAIN = {
    stringify: (x) => {
        if (x == Number.MAX_SAFE_INTEGER) return `Inf`
        return `${x.toFixed(2)}s`
    },
    parse: (x) => {
        let float = parseFloat(/([0-9]*[.])?[0-9]+/.exec(x.trim()))
        if (Number.isNaN(float)) return null
        if (float == 0) return INF_VALUE
        float = minmax(float, MIN_SUSTAIN, MAX_SUSTAIN)
        return float
    },
    normalize: (x) => {
        const val = (x == Number.MAX_SAFE_INTEGER) ? INF_VALUE : x
        return minmax(transformScale(val, { from: { min: MIN_SUSTAIN, max: INF_VALUE } }))
    },
    denormalize: (x) => {
        const val = transformScale(x, { to: { min: MIN_SUSTAIN, max: INF_VALUE } })
        return (val == INF_VALUE) ? Number.MAX_SAFE_INTEGER : val
    }
}