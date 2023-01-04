export default function instantiate(value, Cls, nil = true) {
    if (value instanceof Cls) return value
    if (value !== null && typeof value === "object") return new Cls(value)
    if (nil) return new Cls({})
    return null
}