import SignalProcessor from "../events/signal-processor.js"
import ModelBase from "./model-base.js"


export default class WaveSplineNode extends ModelBase {
    static X_CHANGE = Symbol("X_CHANGE")
    static Y_CHANGE = Symbol("Y_CHANGE")
    static E_CHANGE = Symbol("E_CHANGE")

    constructor({ x = 0, y = 0, e = 1 }) {
        super(...arguments)
        this.x = x
        this.y = y
        this.e = e
    }

    get x() {
        return this._x
    }

    set x(value) {
        this._x = (value + 1) % 1
        SignalProcessor.send(this, WaveSplineNode.X_CHANGE)
    }

    get y() {
        return this._y
    }

    set y(value) {
        this._y = Math.max(0, Math.min(1, value))
        SignalProcessor.send(this, WaveSplineNode.Y_CHANGE)
    }

    get e() {
        return this._e
    }

    set e(value) {
        this._e = Math.max(Number.MIN_VALUE, value)
        SignalProcessor.send(this, WaveSplineNode.E_CHANGE)
    }

    toObject() {
        return {
            x: this.x,
            y: this.y,
            e: this.e
        }
    }

    destroy() {
        super.destroy()
    }
}
