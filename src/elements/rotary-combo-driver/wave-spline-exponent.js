import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MAX_EXPONENT = 100
const MIN_EXPONENT = 0.5
export const WAVE_SPLINE_EXPONENT = {
    stringify: (x) => {
        return `${x.toFixed(2)}`
    },
    parse: (x) => {
        let float = parseFloat(x.trim())
        if (Number.isNaN(float)) return null
        float = minmax(float, MIN_EXPONENT, MAX_EXPONENT)
        return float
    },
    normalize: (x) => {
        return minmax(transformScale(x, { from: { min: MIN_EXPONENT, max: MAX_EXPONENT } }))
    },
    denormalize: (x) => {
        return transformScale(x, { to: { min: MIN_EXPONENT, max: MAX_EXPONENT } })
    }
}
