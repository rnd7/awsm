import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

export const PERCENT = {
    stringify: (x) => {
        return `${Math.round(x)}%`
    },
    parse: (x) => {
        let int = parseInt(/[0-9]{1,3}/.exec(x.trim()))
        if (Number.isNaN(int)) return null
        int = minmax(int, 0, 100)
        return int
    },
    normalize: (x) => {
        return minmax(transformScale(x, {from:{min:0, max:100}}))
    },
    denormalize: (x) => {
        return Math.round(transformScale(x, {to:{min:0, max:100}}))
    }
}