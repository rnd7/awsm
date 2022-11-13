export default function polarToCartesian(x, y, radius, degrees) {
    let radians = (degrees-90) * Math.PI / 180.0
    return {
      x: x + (radius * Math.cos(radians)),
      y: y + (radius * Math.sin(radians))
    }
}