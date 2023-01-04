import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

const MIN_MEASURES = 1
const MAX_MEASURES = 16
export const MEASURES = {
    stringify: (x) => {
        if (x < MIN_MEASURES) return `< ${MIN_MEASURES}`
        if (x > MAX_MEASURES) return `> ${MAX_MEASURES}`
        if (Math.round(x) != x) return `≈ ${Math.round(x)}`
        return `${Math.round(x)}`
    },
    parse: (x) => {
        let int = parseInt(/[0-9]{1,2}/.exec(x.trim()))
        if (Number.isNaN(int)) return null
        int = minmax(int, MIN_MEASURES, MAX_MEASURES)
        return int
    },
    normalize: (x) => {
        return minmax(transformScale(x, { from: { min: MIN_MEASURES, max: MAX_MEASURES } }))
    },
    denormalize: (x) => {
        return Math.round(transformScale(x, { to: { min: MIN_MEASURES, max: MAX_MEASURES } }))
    }
}
