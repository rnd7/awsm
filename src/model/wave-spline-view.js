import SignalProcessor from "../events/signal-processor.js"
import ModelBase from "./model-base.js"

export default class WaveSplineView extends ModelBase {
    static FREQUENCY_CHANGE = Symbol("FREQUENCY_CHANGE")
    static QUANTIZE_X_CHANGE = Symbol("QUANTIZE_X_CHANGE")
    static QUANTIZE_Y_CHANGE = Symbol("QUANTIZE_Y_CHANGE")
    static QUANTIZE_X_THRESHOLD_CHANGE = Symbol("QUANTIZE_X_THRESHOLD_CHANGE")
    static QUANTIZE_Y_THRESHOLD_CHANGE = Symbol("QUANTIZE_Y_THRESHOLD_CHANGE")
    static TIME_UNIT_CHANGE = Symbol("TIME_UNIT_CHANGE")

    static TIME_UNIT_FREQUENCY = "frequency"
    static TIME_UNIT_NOTE = "note"
    static TIME_UNIT_BEAT = "beat"
    static TIME_UNIT_MEASURES = "measures"
    static TIME_UNIT_COMMON = "common"

    constructor({
        frequency = 1, // unit
        quantizeX = 0, // 0 = no quatization
        quantizeXThreshold = -1, // -1 = floor, 0 = round, 1 = ceil
        quantizeY = 0, // 0 = no quatization
        quantizeYThreshold = 0, // -1 = floor, 0 = round, 1 = ceil
        timeUnit = WaveSplineView.TIME_UNIT_FREQUENCY,
    }) {
        super(...arguments)
        this.frequency = frequency
        this.quantizeX = quantizeX
        this.quantizeXThreshold = quantizeXThreshold
        this.quantizeY = quantizeY
        this.quantizeYThreshold = quantizeYThreshold
        this.timeUnit = timeUnit
    }

    set timeUnit(value) {
        if (this._timeUnit === value) return
        this._timeUnit = value
        SignalProcessor.send(this, WaveSplineView.TIME_UNIT_CHANGE)
    }

    get timeUnit() {
        return this._timeUnit
    }

    set frequency(value) {
        if (this._frequency === value) return
        this._frequency = value
        SignalProcessor.send(this, WaveSplineView.FREQUENCY_CHANGE)
    }

    get frequency() {
        return this._frequency
    }

    set quantizeX(value) {
        if (this._quantizeX === value) return
        this._quantizeX = value
        SignalProcessor.send(this, WaveSplineView.QUANTIZE_X_CHANGE)
    }

    get quantizeX() {
        return this._quantizeX
    }

    set quantizeY(value) {
        if (this._quantizeY === value) return
        this._quantizeY = value
        SignalProcessor.send(this, WaveSplineView.QUANTIZE_Y_CHANGE)
    }

    get quantizeY() {
        return this._quantizeY
    }

    set quantizeXThreshold(value) {
        if (this._quantizeXThreshold === value) return
        this._quantizeXThreshold = value
        SignalProcessor.send(this, WaveSplineView.QUANTIZE_X_THRESHOLD_CHANGE)
    }

    get quantizeXThreshold() {
        return this._quantizeXThreshold
    }

    set quantizeYThreshold(value) {
        if (this._quantizeYThreshold === value) return
        this._quantizeYThreshold = value
        SignalProcessor.send(this, WaveSplineView.QUANTIZE_Y_THRESHOLD_CHANGE)
    }

    get quantizeYThreshold() {
        return this._quantizeYThreshold
    }

    toObject() {
        return {
            timeUnit: this.timeUnit,
            frequency: this.frequency,
            quantizeX: this.quantizeX,
            quantizeY: this.quantizeY
        }
    }

    destroy() {
        super.destroy()
    }

}