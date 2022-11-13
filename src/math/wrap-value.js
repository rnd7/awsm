export default function wrapValue(a, n = 1) { 
    return ( a % n + n ) % n 
}