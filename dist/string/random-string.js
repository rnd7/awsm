export default function randomString(
    length = 16,
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
) {
    for (var s=''; s.length < length; s += charset.charAt(Math.random()*charset.length|0));
    return s;
}