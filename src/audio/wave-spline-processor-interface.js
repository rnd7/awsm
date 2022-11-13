import SignalProcessor from "../events/signal-processor.js"
import { DESTROY, WAVE_SPLINE_DATA } from "./wave-spline-processor-message.js"
import Bindable from "../data/bindable.js"
import Generator from "../model/generator.js"
import WaveSplineView from "../model/wave-spline-view.js"
import WaveSpline from "../model/wave-spline.js"
import WaveSplineNode from "../model/wave-spline-node.js"

export default class WaveSplineProcessorInterface extends Bindable {
    constructor(audioContext, generator) {
        super()
        
        this._audioContext = audioContext

        this._waveSplineProcessor = new AudioWorkletNode(this._audioContext, 'wave-spline-processor')

        this._frequencyParam = this._waveSplineProcessor.parameters.get('frequency')
        this._gainParam = this._waveSplineProcessor.parameters.get('gain')
        this._timeParam = this._waveSplineProcessor.parameters.get('time')
        this._pitchParam = this._waveSplineProcessor.parameters.get('pitch')
        this._pitchScaleParam = this._waveSplineProcessor.parameters.get('pitchScale')
        this._quantizeTimeParam = this._waveSplineProcessor.parameters.get('quantizeTime')
        this._quantizeTimeThresholdParam = this._waveSplineProcessor.parameters.get('quantizeTimeThreshold')
        this._quantizeValueParam = this._waveSplineProcessor.parameters.get('quantizeValue')
        
        this.generator = generator
        
    }

    set generator(value) {
        if (this._generator === value) return
        this._removeGeneratorListeners()
        this._generator = value
        this._addGeneratorListeners()
        this._updateWaveSpline()
        this._updateWaveSplineView()
    }

    get generator() {
        return this._generator
    }

    _addGeneratorListeners() {
        if (!this._generator) return
        SignalProcessor.add(this._generator, Generator.WAVESPLINE_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.add(this._generator, Generator.WAVESPLINEVIEW_CHANGE, this.bound(this._onWaveSplineViewChange))
        SignalProcessor.add(this._generator, WaveSplineView.FREQUENCY_CHANGE, this.bound(this._onFrequencyChange))
        SignalProcessor.add(this._generator, WaveSplineView.QUANTIZE_X_CHANGE, this.bound(this._onQuantizeXChange))
        SignalProcessor.add(this._generator, WaveSplineView.QUANTIZE_X_THRESHOLD_CHANGE, this.bound(this._onQuantizeXThresholdChange))
        SignalProcessor.add(this._generator, WaveSplineView.QUANTIZE_Y_CHANGE, this.bound(this._onQuantizeYChange))
        SignalProcessor.add(this._generator, WaveSpline.NODES_CHANGE, this.bound(this._onWaveSplineNodesChange))
        SignalProcessor.add(this._generator, WaveSpline.PHASE_CHANGE, this.bound(this._onWaveSplinePhaseChange))
        SignalProcessor.add(this._generator, WaveSpline.TYPE_CHANGE, this.bound(this._onWaveSplineTypeChange))
        SignalProcessor.add(this._generator, WaveSpline.E_CHANGE, this.bound(this._onWaveSplineEChange))
        SignalProcessor.add(this._generator, WaveSplineNode.E_CHANGE, this.bound(this._onWaveSplineNodeChange))
        SignalProcessor.add(this._generator, WaveSplineNode.X_CHANGE, this.bound(this._onWaveSplineNodeChange))
        SignalProcessor.add(this._generator, WaveSplineNode.Y_CHANGE, this.bound(this._onWaveSplineNodeChange))
    }

    _removeGeneratorListeners() {
        if (!this._generator) return
        SignalProcessor.remove(this._generator, Generator.WAVESPLINE_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.remove(this._generator, Generator.WAVESPLINEVIEW_CHANGE, this.bound(this._onWaveSplineViewChange))
        SignalProcessor.remove(this._generator, WaveSplineView.FREQUENCY_CHANGE, this.bound(this._onFrequencyChange))
        SignalProcessor.remove(this._generator, WaveSplineView.QUANTIZE_X_CHANGE, this.bound(this._onQuantizeXChange))
        SignalProcessor.remove(this._generator, WaveSplineView.QUANTIZE_X_THRESHOLD_CHANGE, this.bound(this._onQuantizeXThresholdChange))
        SignalProcessor.remove(this._generator, WaveSplineView.QUANTIZE_Y_CHANGE, this.bound(this._onQuantizeYChange))
        SignalProcessor.remove(this._generator, WaveSpline.NODES_CHANGE, this.bound(this._onWaveSplineNodesChange))
        SignalProcessor.remove(this._generator, WaveSpline.PHASE_CHANGE, this.bound(this._onWaveSplinePhaseChange))
        SignalProcessor.remove(this._generator, WaveSpline.TYPE_CHANGE, this.bound(this._onWaveSplineTypeChange))
        SignalProcessor.remove(this._generator, WaveSpline.E_CHANGE, this.bound(this._onWaveSplineEChange))
        SignalProcessor.remove(this._generator, WaveSplineNode.E_CHANGE, this.bound(this._onWaveSplineNodeChange))
        SignalProcessor.remove(this._generator, WaveSplineNode.X_CHANGE, this.bound(this._onWaveSplineNodeChange))
        SignalProcessor.remove(this._generator, WaveSplineNode.Y_CHANGE, this.bound(this._onWaveSplineNodeChange))
    }

    _onWaveSplineChange() {
        this._updateWaveSpline()
    }

    _onWaveSplineNodeChange() {
        this._updateWaveSpline()
    }

    _onWaveSplineViewChange() {
        this._updateWaveSplineView()
    }

    _onQuantizeXChange() {
        this._updateQuantizeX()
    }

    _onQuantizeXThresholdChange() {
        this._updateQuantizeXThreshold()
    }

    _onQuantizeYChange() {
        this._updateQuantizeY()
    }
    
    _onFrequencyChange() {
        this._updateFrequency()
    }
    
    _onWaveSplineNodesChange() {
        this._updateWaveSplineDataset()
    }

    _onWaveSplinePhaseChange() {
        this._updateWaveSplineDataset()
    }

    _onWaveSplineTypeChange() {
        this._updateWaveSplineDataset()
    }

    _onWaveSplineEChange() {
        this._updateWaveSplineDataset()
    }

    _updateWaveSpline() {
        this._updateWaveSplineDataset()
    }

    _updateWaveSplineDataset() {
        this._waveSplineProcessor.port.postMessage({
            type: WAVE_SPLINE_DATA,
            waveSpline: this._generator.waveSpline.toObject()
        })
    }

    _updateFrequency() {
        this._frequencyParam.setValueAtTime(this._generator.waveSplineView.frequency, this._audioContext.currentTime)
    }

    _updateQuantizeX() {
        this._quantizeTimeParam.setValueAtTime(this._generator.waveSplineView.quantizeX, this._audioContext.currentTime)
    }

    _updateQuantizeXThreshold() {
        this._quantizeTimeThresholdParam.setValueAtTime(this._generator.waveSplineView.quantizeXThreshold, this._audioContext.currentTime)
    }

    _updateQuantizeY() {
        this._quantizeValueParam.setValueAtTime(this._generator.waveSplineView.quantizeY, this._audioContext.currentTime)
    }
        
    _updateWaveSplineView() {
        this._updateFrequency()
        this._updateQuantizeX()
        this._updateQuantizeXThreshold()
        this._updateQuantizeY()
    }
     
    get gainInput() {
        return this._gainParam
    }

    get timeInput() {
        return this._timeParam
    }

    get pitchInput() {
        return this._pitchParam
    }

    connect() {
        // ie. audioContext.destination
        return this._waveSplineProcessor.connect(...arguments)
    }
    disconnect() {
        return this._waveSplineProcessor.disconnect(...arguments)
        
    }

    destroy() { 
        this._removeGeneratorListeners()
        
        this._frequencyParam.cancelScheduledValues(this._audioContext.currentTime)
        this._gainParam.cancelScheduledValues(this._audioContext.currentTime)
        this._pitchParam.cancelScheduledValues(this._audioContext.currentTime)
        this._pitchScaleParam.cancelScheduledValues(this._audioContext.currentTime)
        this._quantizeTimeParam.cancelScheduledValues(this._audioContext.currentTime)
        this._quantizeValueParam.cancelScheduledValues(this._audioContext.currentTime)

        this._waveSplineProcessor.port.postMessage({
            type: DESTROY
        })
        this._waveSplineProcessor.port.close()
        this._waveSplineProcessor.disconnect()
        this._waveSplineProcessor = null
        
        this._audioContext = null
        this._generator = null
        this._frequencyParam = null
        this._gainParam = null
        this._pitchParam = null
        this._pitchScaleParam = null
        this._quantizeTimeParam = null
        this._quantizeValueParam = null


        super.destroy()
    }

}