import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MIN_VALUE = -1
const MAX_VALUE = 1
export const BIPOLAR = { 
    stringify: (x) => {
        return `${x.toFixed(2)}`
    },
    parse: (x) => {
        let float = parseFloat(/-?([0-9]*[.])?[0-9]+/.exec(x.trim()))
        if (Number.isNaN(float)) return null
        float = minmax(float, MIN_VALUE, MAX_VALUE)
        return float
    },
    normalize: (x) => {
        return minmax(transformScale(x, {from:{min:MIN_VALUE, max:MAX_VALUE}}))
    },
    denormalize: (x) => {
        return transformScale(x, {to:{min:MIN_VALUE, max:MAX_VALUE}})
    } 
}
