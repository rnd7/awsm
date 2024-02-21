export const POW_4 = {
    normalize: (x) => {
        return Math.pow(x, 4)
    },
    denormalize: (x) => {
        return Math.pow(x, .25)
    }
}