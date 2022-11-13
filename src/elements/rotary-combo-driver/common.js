
import { fromFraction, toFraction } from "../../math/fraction.js"
import minmax from "../../math/minmax.js"
import transformScale from "../../math/transform-scale.js"

export const COMMON_VALUES = [1/64, 1/32, 1/16, 1/8, 1/4, 1/2, 1, 2, 3, 4]

function findClosest(val) {
    let bestDist = Number.POSITIVE_INFINITY
    let bestIndex = -1
    COMMON_VALUES.forEach((value, index)=>{
        let dist = Math.abs(val-value)
        if (dist < bestDist) {
            bestDist = dist
            bestIndex = index
        }
    })
    return bestIndex
}

export const COMMON = { 
    stringify: (x) => {
        if (COMMON_VALUES[x]) return `${toFraction(COMMON_VALUES[x])}`
        else return `Excentric`
    },
    parse: (x) => {
        let float = fromFraction(x.trim())
        if (Number.isNaN(float)) return 0
        let index = findClosest(float)
        return index
    },
    normalize: (x) => {
        return minmax(transformScale(x, {from:{min:0, max: COMMON_VALUES.length-1}}))
    },
    denormalize: (x) => {
        return Math.round(transformScale(x, {to:{min:0, max: COMMON_VALUES.length-1}}))
    } 
}