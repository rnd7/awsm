import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MIN_ENVELOPE = 0.01
const MAX_ENVELOPE = 10
export const ENVELOPE = { 
    stringify: (x) => {
        return `${x.toFixed(2)}s`
    },
    parse: (x) => {
        let float = parseFloat(/([0-9]*[.])?[0-9]+/.exec(x.trim()))
        if (Number.isNaN(float)) return null
        float = minmax(float, MIN_ENVELOPE, MAX_ENVELOPE)
        return float
    },
    normalize: (x) => {
        return minmax(transformScale(x, {from:{min:MIN_ENVELOPE, max:MAX_ENVELOPE}}))
    },
    denormalize: (x) => {
        return transformScale(x, {to:{min:MIN_ENVELOPE, max: MAX_ENVELOPE}})
    } 
}