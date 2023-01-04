export default class RandomNameService {
    static _list = []

    static async load(file = 'assets/names.json') {
        const data = await fetch(file).then((response) => (response.json()))
        RandomNameService._list = data
    }

    static getName(words = 2) {
        const len = RandomNameService._list.length
        if (!len) return ""
        let arr = []
        while (arr.length < words) {
            arr.push(RandomNameService._list[len * Math.random() | 0])
        }
        return arr.join(" ")
    }
}