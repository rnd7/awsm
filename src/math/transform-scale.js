export default function transformScale(value, {from = {min: 0, max:1}, to = {min: 0, max:1}}){
    const fromRange = from.max-from.min
    const toRange = to.max-to.min
    return (value-from.min) / fromRange * toRange + to.min
}