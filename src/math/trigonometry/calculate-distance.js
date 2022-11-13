export default function calculateDistance(ax, ay, bx = 0, by = 0) {
    const dx = ax - bx
    const dy = ay - by 
    return Math.sqrt(dx * dx + dy * dy)
}