import SignalProcessor from "../events/signal-processor.js"
import instantiate from "./instantiate.js"
import ModelBase from "./model-base.js"
import WaveSplineView from "./wave-spline-view.js"
import WaveSpline from "./wave-spline.js"

export default class Generator extends ModelBase {

    static WAVESPLINE_CHANGE = Symbol("WAVESPLINE_CHANGE")
    static WAVESPLINEVIEW_CHANGE = Symbol("WAVESPLINEVIEW_CHANGE")

    constructor({
        waveSpline = null,
        waveSplineView = null
    }) {
        super(...arguments)
        this.waveSpline = waveSpline
        this.waveSplineView = waveSplineView
    }


    set waveSpline(value) {
        if (value === this._waveSpline) return
        this._removeWaveSplineListeners()
        this._waveSpline = instantiate(value, WaveSpline, true)
        this._addWaveSplineListeners()
        SignalProcessor.send(this, Generator.WAVESPLINE_CHANGE)
    }

    get waveSpline() {
        return this._waveSpline
    }

    _addWaveSplineListeners() {
        if (!this._waveSpline) return
        SignalProcessor.add(this._waveSpline, SignalProcessor.WILDCARD, this.bound(this._onWaveSplineChange))
    }

    _removeWaveSplineListeners() {
        if (!this._waveSpline) return
        SignalProcessor.remove(this._waveSpline, SignalProcessor.WILDCARD, this.bound(this._onWaveSplineChange))
    }

    _onWaveSplineChange(e, t) {
        SignalProcessor.send(this, e)
    }

    set waveSplineView(value) {
        if (value === this._waveSplineView) return
        this._removeWaveSplineViewListeners()
        this._waveSplineView = instantiate(value, WaveSplineView, true)
        this._addWaveSplineViewListeners()
        SignalProcessor.send(this, Generator.WAVESPLINEVIEW_CHANGE)
    }

    get waveSplineView() {
        return this._waveSplineView
    }

    _addWaveSplineViewListeners() {
        if (!this._waveSplineView) return
        SignalProcessor.add(this._waveSplineView, SignalProcessor.WILDCARD, this.bound(this._onWaveSplineViewChange))
    }

    _removeWaveSplineViewListeners() {
        if (!this._waveSplineView) return
        SignalProcessor.remove(this._waveSplineView, SignalProcessor.WILDCARD, this.bound(this._onWaveSplineViewChange))
    }

    _onWaveSplineViewChange(e, t) {
        SignalProcessor.send(this, e)
    }


    toObject() {
        const obj = {}
        if (this._waveSpline) obj.waveSpline = this._waveSpline.toObject()
        if (this._waveSplineView) obj.waveSplineView = this._waveSplineView.toObject()
        return obj
    }

    destroy() {
        super.destroy()
    }
}