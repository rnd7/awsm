import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MIN_AMPLITUDE = 0
const MAX_AMPLITUDE = 1
export const AMPLITUDE = {
    stringify: (x) => {
        return `${(x * 2 - 1).toFixed(2)}`
    },
    parse: (x) => {
        let float = parseFloat(/-?([0-9]*[.])?[0-9]+/.exec(x.trim()))
        if (Number.isNaN(float)) return null
        float = minmax(float, MIN_AMPLITUDE, MAX_AMPLITUDE)
        return float
    },
    normalize: (x) => {
        return minmax(transformScale(x, { from: { min: MIN_AMPLITUDE, max: MAX_AMPLITUDE } }))
    },
    denormalize: (x) => {
        return transformScale(x, { to: { min: MIN_AMPLITUDE, max: MAX_AMPLITUDE } })
    }
}
