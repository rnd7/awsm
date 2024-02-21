import WebComponent from "../dom/web-component.js"
import RotaryCombo from "../elements/rotary-combo.js"
import SignalProcessor from "../events/signal-processor.js"
import Select from "../elements/select.js"
import WaveSpline from "../model/wave-spline.js"
import Configuration from "../model/configuration.js"
import { EXPONENTIAL_NODE_SPLINE, EXPONENTIAL_SPLINE, STEP } from "../model/wave-spline-type.js"
import { WAVE_SPLINE_EXPONENT } from "../elements/rotary-combo-driver/wave-spline-exponent.js"
import { POW_4 } from "../elements/rotary-scale/pow-4.js"

const SPLINE_TYPES = [
    {
        value: EXPONENTIAL_SPLINE,
        label: "Spline"
    },
    {
        value: EXPONENTIAL_NODE_SPLINE,
        label: "Nodes"
    },
    {
        value: STEP,
        label: "Step"
    },
]

export default class WaveSplineSettings extends WebComponent {
    static style = 'components/wave-spline-settings.css'
    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._typeSelect = Select.create()
        this._typeSelect.label = "Type"
        this._typeSelect.options = SPLINE_TYPES
        this._typeSelect.addEventListener(Select.VALUE_CHANGE_EVENT, this.bound(this._onTypeSelectChange))
        this._containerEl.append(this._typeSelect)

        this._eCombo = RotaryCombo.create()
        this._eCombo.driver = WAVE_SPLINE_EXPONENT
        this._eCombo.scale = POW_4
        this._eCombo.label = "Exponent"
        this._eCombo.step = .01
        this._eCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onEComboChange))
        this._eCombo.classList.add("hidden")
        this._containerEl.append(this._eCombo)

        this._phaseCombo = RotaryCombo.create()
        this._phaseCombo.label = "Phase"
        this._phaseCombo.continuous = true
        this._phaseCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onPhaseComboChange))
        this._containerEl.append(this._phaseCombo)

        this._init()
    }

    async _init() {
        await this.fetchStyle(WaveSplineSettings.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
    }

    set configuration(value) {
        if (this._configuration === value) return
        this._removeConfigurationListeners()
        this._configuration = value
        this._addConfigurationListeners()
        this._updateActiveGenerator()
    }

    get configuration() {
        return this._configuration
    }

    _addConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.add(this._configuration, Configuration.ACTIVE_GENERATOR_CHANGE, this.bound(this._onActiveGeneratorChange))
    }

    _removeConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.remove(this._configuration, Configuration.ACTIVE_GENERATOR_CHANGE, this.bound(this._onActiveGeneratorChange))
    }

    _onActiveGeneratorChange(e, t) {
        this._updateActiveGenerator()
    }

    _updateActiveGenerator() {
        if (!this._configuration.activeGenerator) this.waveSpline = null
        else this.waveSpline = this._configuration.activeGenerator.waveSpline
    }

    set waveSpline(value) {
        if (this._waveSpline === value) return
        this._removeWaveSplineListeners()
        this._waveSpline = value
        this._addWaveSplineListeners()
        this._updateType()
        this._updateE()
        this._updatePhase()
    }

    get waveSpline() {
        return this._waveSpline
    }

    _addWaveSplineListeners() {
        if (!this._waveSpline) return
        SignalProcessor.add(this._waveSpline, WaveSpline.TYPE_CHANGE, this.bound(this._onWaveSplineTypeChange))
        SignalProcessor.add(this._waveSpline, WaveSpline.E_CHANGE, this.bound(this._onWaveSplineEChange))
        SignalProcessor.add(this._waveSpline, WaveSpline.PHASE_CHANGE, this.bound(this._onWaveSplinePhaseChange))
    }

    _removeWaveSplineListeners() {
        if (!this._waveSpline) return
        SignalProcessor.remove(this._waveSpline, WaveSpline.TYPE_CHANGE, this.bound(this._onWaveSplineTypeChange))
        SignalProcessor.remove(this._waveSpline, WaveSpline.E_CHANGE, this.bound(this._onWaveSplineEChange))
        SignalProcessor.remove(this._waveSpline, WaveSpline.PHASE_CHANGE, this.bound(this._onWaveSplinePhaseChange))
    }

    _onWaveSplineTypeChange(e, t) {
        this._updateType()
    }

    _updateType() {
        if (!this._waveSpline) return
        this._typeSelect.value = this._waveSpline.type
        this.render()
    }

    _onWaveSplineEChange(e, t) {
        this._updateE()
    }

    _updateE() {
        if (!this._waveSpline) return
        this._eCombo.value = this._waveSpline.e
    }

    _onWaveSplinePhaseChange(e, t) {
        this._updatePhase()
    }

    _updatePhase() {
        if (!this._waveSpline) return
        this._phaseCombo.value = this._waveSpline.phase
    }

    _onTypeSelectChange(e) {
        if (!this._waveSpline) return
        this._waveSpline.type = this._typeSelect.value
    }

    _onEComboChange(e) {
        if (!this._waveSpline) return
        this._waveSpline.e = this._eCombo.value
    }

    _onPhaseComboChange(e) {
        if (!this._waveSpline) return
        this._waveSpline.phase = this._phaseCombo.value
    }

    _updateAll() {
        this._updateType()
        this._updateE()
        this._updatePhase()
    }

    renderCallback() {
        if (this._waveSpline && this._waveSpline.type === EXPONENTIAL_SPLINE) this._eCombo.classList.remove("hidden")
        else this._eCombo.classList.add("hidden")
    }

    destroy() {
        this._removeConfigurationListeners()
        this._removeWaveSplineListeners()

        this._typeSelect.removeEventListener(Select.VALUE_CHANGE_EVENT, this.bound(this._onTypeSelectChange))
        this._typeSelect.destroy()
        this._typeSelect = null
        this._eCombo.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onEComboChange))
        this._eCombo.destroy()
        this._eCombo = null
        this._phaseCombo.destroy()
        this._phaseCombo.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onPhaseComboChange))
        this._phaseCombo = null

        this._containerEl.remove()

        this._configuration = null
        this._waveSpline = null
        super.destroy()

    }
}