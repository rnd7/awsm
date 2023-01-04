import { fromFraction, toFraction } from "../../math/fraction.js"
import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MIN_NOTE = 1 / 64
const MAX_NOTE = 1
export const NOTE = {
    stringify: (x) => {
        if (x < MIN_NOTE) return `< ${toFraction(MIN_NOTE)}`
        if (x > MAX_NOTE) return `> ${toFraction(MAX_NOTE)}`
        const fraction = toFraction(x)
        if (fromFraction(fraction) != x) return `≈ ${fraction}`
        return `${fraction}`
    },
    parse: (x) => {
        let float = fromFraction(x.trim())
        if (Number.isNaN(float)) return null
        float = minmax(float, MIN_NOTE, MAX_NOTE)
        return float
    },
    normalize: (x) => {
        return minmax(transformScale(x, { from: { min: MIN_NOTE, max: MAX_NOTE } }))
    },
    denormalize: (x) => {
        return transformScale(x, { to: { min: MIN_NOTE, max: MAX_NOTE } })
    }
}
