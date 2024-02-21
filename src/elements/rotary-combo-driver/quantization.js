import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MIN_QUANTIZATION = 1
const MAX_QUANTIZATION = 2520
const INF_VALUE = MAX_QUANTIZATION + 1
export const QUANTIZATION = {
    stringify: (x) => {
        x = Math.ceil(x)
        if (x == 0) return `Inf`
        return `${x}`
    },
    parse: (x) => {
        let int = parseInt(/[0-9]{1,4}/.exec(x.trim()))
        if (Number.isNaN(int)) return null
        if (int == 0) return INF_VALUE
        else return minmax(int, MIN_QUANTIZATION, MAX_QUANTIZATION)
    },
    normalize: (x) => {
        const val = (x == 0) ? INF_VALUE : x
        return minmax(transformScale(val, { from: { min: MIN_QUANTIZATION, max: INF_VALUE } }))
    },
    denormalize: (x) => {
        const val = Math.round(transformScale(x, { to: { min: MIN_QUANTIZATION, max: INF_VALUE } }))
        return (val == INF_VALUE) ? 0 : val
    }
}