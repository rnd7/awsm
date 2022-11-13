export default function camelToKebab(str) {
    if (!str) return null
    if (str === str.toUpperCase()) return str.toLowerCase()
    return str.split(/(?=[A-Z])/).join('-').toLowerCase()
}