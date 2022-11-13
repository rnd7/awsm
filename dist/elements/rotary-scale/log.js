export const LOG = {
    normalize: (x) => {
        return Math.log10(x*9+1)
    },
    denormalize: (x) => {
        return (Math.pow(10, x) - 1 )/9
    }
}