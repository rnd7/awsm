import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MIN_TRANSPOSE = -4
const MAX_TRANSPOSE = 4
export const TRANSPOSE = { 
    stringify: (x) => {
        return `${Math.round(x)}`
    },
    parse: (x) => {
        let int = parseInt(/-?[0-9]{1}/.exec(x.trim()))
        if (Number.isNaN(int)) return null
        int = minmax(int, MIN_TRANSPOSE, MAX_TRANSPOSE)
        return int
    },
    normalize: (x) => {
        return minmax(transformScale(x, {from:{min:MIN_TRANSPOSE, max:MAX_TRANSPOSE}}))
    },
    denormalize: (x) => {
        return Math.round(transformScale(x, {to:{min:MIN_TRANSPOSE, max:MAX_TRANSPOSE}}))
    } 
}