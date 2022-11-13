import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MAX_KEYBOARD_FREQUENCY = 20000
const MIN_KEYBOARD_FREQUENCY = 1
export const KEYBOARD_FREQUENCY = { 
    stringify: (x) => {
        return `${x.toFixed(2)}Hz`
    },
    parse: (x) => {
        let float = parseFloat(/([0-9]*[.])?[0-9]+/.exec(x.trim()))
        if (Number.isNaN(float)) return null
        float = minmax(float, MIN_KEYBOARD_FREQUENCY, MAX_KEYBOARD_FREQUENCY)
        return float
    },
    normalize: (x) => {
        return minmax(transformScale(x, {from:{min:MIN_KEYBOARD_FREQUENCY, max:MAX_KEYBOARD_FREQUENCY}}))
    },
    denormalize: (x) => {
        return transformScale(x, {to:{min:MIN_KEYBOARD_FREQUENCY, max:MAX_KEYBOARD_FREQUENCY}})
    } 
}