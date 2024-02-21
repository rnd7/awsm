import Binding from "./binding.js"

export default class Bindable {

    constructor() {
        this._binding = new Binding(this)
    }

    bound(fn) {
        return this._binding.bound(fn)
    }

    destroy() {
        this._binding.destroy()
        this._binding = null
    }
}