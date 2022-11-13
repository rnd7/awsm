import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MIN_TEMPO = 1
const MAX_TEMPO = 250
export const TEMPO = { 
    stringify: (x) => {
        return `${Math.round(x)}bpm`
    },
    parse: (x) => {
        let int = parseInt(/-?[0-9]{1,3}/.exec(x.trim()))
        if (Number.isNaN(int)) return null
        int = minmax(int, MIN_TEMPO, MAX_TEMPO)
        return int
    },
    normalize: (x) => {
        return minmax(transformScale(x, {from:{min:MIN_TEMPO, max:MAX_TEMPO}}))
    },
    denormalize: (x) => {
        return Math.round(transformScale(x, {to:{min:MIN_TEMPO, max:MAX_TEMPO}}))
    } 
}