export default function debounce(callback, wait=300, first=true) {
    let timeout
    return (...args) => {
        const context = this
        if (!timeout && first) callback.apply(context, args)
        else clearTimeout(timeout)
        timeout = setTimeout(() => {
            callback.apply(context, args)
            timeout = null
        } , wait)
    }
}
