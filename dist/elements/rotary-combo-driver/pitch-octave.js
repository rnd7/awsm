import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MIN_PITCH_OCTAVE = -4
const MAX_PITCH_OCTAVE = 4
export const PITCH_OCTAVE = { 
    stringify: (x) => {
        return `${x.toFixed(2)}`
    },
    parse: (x) => {
        let float = parseFloat(/-?([0-9]*[.])?[0-9]+/.exec(x.trim()))
        if (Number.isNaN(float)) return null
        float = minmax(float, MIN_PITCH_OCTAVE, MAX_PITCH_OCTAVE)
        return float
    },
    normalize: (x) => {
        return minmax(transformScale(x, {from:{min:MIN_PITCH_OCTAVE, max:MAX_PITCH_OCTAVE}}))
    },
    denormalize: (x) => {
        return transformScale(x, {to:{min:MIN_PITCH_OCTAVE, max:MAX_PITCH_OCTAVE}})
    } 
}