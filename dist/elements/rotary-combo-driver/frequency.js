import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MAX_REQUENCY = 20000
const MIN_FREQUENCY = 0.01
export const FREQUENCY = { 
    stringify: (x) => {
        if (x<MIN_FREQUENCY) return `< ${MIN_FREQUENCY}`
        if (x>MAX_REQUENCY) return `> ${MAX_REQUENCY}`
        return `${x.toFixed(2)}Hz`
    },
    parse: (x) => {
        let float = parseFloat(/([0-9]*[.])?[0-9]+/.exec(x.trim()))
        if (Number.isNaN(float)) return null
        float = minmax(float, MIN_FREQUENCY, MAX_REQUENCY)
        return float
    },
    normalize: (x) => {
        return minmax(transformScale(x, {from:{min:MIN_FREQUENCY, max:MAX_REQUENCY}}))
    },
    denormalize: (x) => {
        return transformScale(x, {to:{min:MIN_FREQUENCY, max: MAX_REQUENCY}})
    } 
}