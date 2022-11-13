import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MIN_KEYBOARD_DIVISIONS = 1
const MAX_KEYBOARD_DIVISIONS = 60
export const KEYBOARD_DIVISIONS = { 
    stringify: (x) => {
        return `${Math.round(x)}`
    },
    parse: (x) => {
        let int = parseInt(/[0-9]{1,3}/.exec(x.trim()))
        if (Number.isNaN(int)) return null
        int = minmax(int, MIN_KEYBOARD_DIVISIONS, MAX_KEYBOARD_DIVISIONS)
        return int
    },
    normalize: (x) => {
        return minmax(transformScale(x, {from:{min:MIN_KEYBOARD_DIVISIONS, max:MAX_KEYBOARD_DIVISIONS}}))
    },
    denormalize: (x) => {
        return Math.round(transformScale(x, {to:{min:MIN_KEYBOARD_DIVISIONS, max:MAX_KEYBOARD_DIVISIONS}}))
    }
}