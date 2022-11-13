export default function stepSplineSolver(nodes, x) {
    const len = nodes.length
    if (!len) return 0
    if (len == 1) return nodes[0].y
    const wrappedTime = x % 1
    for (let i=0; i<len; i++) {
        let node = nodes[i]
        if (node.x > wrappedTime) {
            return nodes[(i-1+len)%len].y
        }
    }
    return nodes[len-1].y
}