import minmax from "../../math/minmax.js"

export const UNIT_VALUE = {
    stringify: (x) => {
        return `${x.toFixed(2)}`
    },
    parse: (x) => {
        let float = parseFloat(x.trim())
        if (Number.isNaN(float)) return null
        float = minmax(float)
        return float
    },
    normalize: (x) => {
        return minmax(x)
    },
    denormalize: (x) => {
        return x
    }
}