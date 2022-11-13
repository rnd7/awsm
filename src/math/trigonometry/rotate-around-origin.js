export default function rotateAroundOrigin(origin, point, rad) {
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const dx = point.x - origin.x
    const dy = point.y - origin.y
    return {
        x: (cos * dx) + (sin * dy) + origin.x,
        y: (cos * dy) - (sin * dx) + origin.y
    }
}
  

