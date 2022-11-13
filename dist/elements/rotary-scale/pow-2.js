export const POW_2 = {
    normalize: (x) => {
        return Math.pow(x,2)
    },
    denormalize: (x) => {
        return Math.pow(x,.5)
    }
}