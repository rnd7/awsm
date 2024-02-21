export default class Binding {
    constructor(target) {
        this._bound = new Map()
        this._target = target
    }

    bound(fn) {
        if (!this._bound.has(fn)) {
            this._bound.set(fn, fn.bind(this._target))
        }
        return this._bound.get(fn)
    }

    destroy() {
        this._bound.clear()
        this._bound = null
        this._target = null
    }
}