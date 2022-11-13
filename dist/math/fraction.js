// pow: 6 = 1/2^6 = 1/64
export function toFraction(val, pow = 6) {
    let denom = Math.pow(2,pow)
    const sign = val < 0?'-':''
    val = Math.abs(val)
    const stp = 1/denom
    const int = Math.floor(val)
    let num = Math.round((val-int)/stp)
    if (int == val || num == 0) return `${sign}${int}`
    while(num > 0 && num%2==0) {
        num /= 2
        denom /= 2
    }
    if (int != 0) return `${sign}${int} ${num}/${denom}`
    else return `${sign}${num}/${denom}`
}

export function fromFraction(str) {
    const match = /([0-9]+)(\/([0-9]+))?/.exec(str)
    let val = 1
    if (match.length) {
        const num = parseInt(match[1])
        const denom = parseInt(match[3])
        if (!Number.isNaN(num)) val = num
        if (!Number.isNaN(denom) && denom > 0) val /= denom
    }
    return val
}