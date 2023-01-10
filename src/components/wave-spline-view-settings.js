import WebComponent from "../dom/web-component.js"
import WaveSplineView from "../model/wave-spline-view.js"
import RotaryCombo from "../elements/rotary-combo.js"
import SignalProcessor from "../events/signal-processor.js"
import Configuration from "../model/configuration.js"
import Select from "../elements/select.js"
import noteFrequencyConversion from "../music/note-frequency-conversion.js"
import { FREQUENCY } from "../elements/rotary-combo-driver/frequency.js"
import { QUANTIZATION } from "../elements/rotary-combo-driver/quantization.js"
import { NOTE } from "../elements/rotary-combo-driver/note.js"
import { MEASURES } from "../elements/rotary-combo-driver/measures.js"
import { COMMON, COMMON_VALUES } from "../elements/rotary-combo-driver/common.js"
import { POW_4 } from "../elements/rotary-scale/pow-4.js"
import { LINEAR } from "../elements/rotary-scale/linear.js"
import { BIPOLAR } from "../elements/rotary-combo-driver/bipolar.js"

const TIME_UNITS = [
    {
        value: WaveSplineView.TIME_UNIT_FREQUENCY,
        label: "Frequency"
    },
    {
        value: WaveSplineView.TIME_UNIT_COMMON,
        label: "Common"
    },
    {
        value: WaveSplineView.TIME_UNIT_NOTE,
        label: "Note"
    },
    {
        value: WaveSplineView.TIME_UNIT_MEASURES,
        label: "Measures"
    },
]

export default class WaveSplineViewSettings extends WebComponent {
    static style = 'components/wave-spline-view-settings.css'
    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._timeUnitSelect = Select.create()
        this._timeUnitSelect.label = "Time unit"
        this._timeUnitSelect.options = TIME_UNITS
        this._timeUnitSelect.addEventListener(Select.VALUE_CHANGE_EVENT, this.bound(this._onTimeUnitSelectChange))
        this._containerEl.append(this._timeUnitSelect)


        this._frequencyControl = RotaryCombo.create()
        this._frequencyControl.driver = FREQUENCY
        this._frequencyControl.scale = POW_4
        this._frequencyControl.label = "Frequency"
        this._frequencyControl.step = .01
        this._frequencyControl.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onFrequencyControlChange))
        this._containerEl.append(this._frequencyControl)

        this._quantizeXControl = RotaryCombo.create()
        this._quantizeXControl.driver = QUANTIZATION
        this._quantizeXControl.label = "Time Grid"
        this._quantizeXControl.scale = POW_4
        this._quantizeXControl.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onQuantizeXControlChange))
        this._containerEl.append(this._quantizeXControl)

        this._quantizeXThresholdControl = RotaryCombo.create()
        this._quantizeXThresholdControl.driver = BIPOLAR
        this._quantizeXThresholdControl.label = "Time offset"
        this._quantizeXThresholdControl.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onQuantizeXThresholdControlChange))
        this._containerEl.append(this._quantizeXThresholdControl)

        this._quantizeYControl = RotaryCombo.create()
        this._quantizeYControl.driver = QUANTIZATION
        this._quantizeYControl.label = "Value Grid"
        this._quantizeYControl.scale = POW_4
        this._quantizeYControl.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onQuantizeYControlChange))
        this._containerEl.append(this._quantizeYControl)

        this._configuration = null
        this._init()

    }

    async _init() {
        await this.fetchStyle(WaveSplineViewSettings.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
    }

    set configuration(value) {
        if (this._configuration === value) return
        this._removeConfigurationListeners()
        this._configuration = value
        this._addConfigurationListeners()
        this._updateActiveGenerator()
        this._updateAll()
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
        this.activeGenerator = this._configuration.activeGenerator
    }

    set activeGenerator(value) {
        if (this._activeGenerator === value) return
        this._removeActiveGeneratorListeners()
        this._activeGenerator = value
        this._addActiveGeneratorListeners()
        this._updateAll()
    }

    get activeGenerator() {
        return this._activeGenerator
    }

    _addActiveGeneratorListeners() {
        if (!this._activeGenerator) return
        SignalProcessor.add(this._activeGenerator, WaveSplineView.FREQUENCY_CHANGE, this.bound(this._onWaveSplineViewSettingsChange))
        SignalProcessor.add(this._activeGenerator, WaveSplineView.QUANTIZE_X_CHANGE, this.bound(this._onWaveSplineViewSettingsChange))
        SignalProcessor.add(this._activeGenerator, WaveSplineView.QUANTIZE_Y_CHANGE, this.bound(this._onWaveSplineViewSettingsChange))
        SignalProcessor.add(this._activeGenerator, WaveSplineView.TIME_UNIT_CHANGE, this.bound(this._onWaveSplineViewSettingsChange))
    }
    _removeActiveGeneratorListeners() {
        if (!this._activeGenerator) return
        SignalProcessor.remove(this._activeGenerator, WaveSplineView.FREQUENCY_CHANGE, this.bound(this._onWaveSplineViewSettingsChange))
        SignalProcessor.remove(this._activeGenerator, WaveSplineView.QUANTIZE_X_CHANGE, this.bound(this._onWaveSplineViewSettingsChange))
        SignalProcessor.remove(this._activeGenerator, WaveSplineView.QUANTIZE_Y_CHANGE, this.bound(this._onWaveSplineViewSettingsChange))
        SignalProcessor.remove(this._activeGenerator, WaveSplineView.TIME_UNIT_CHANGE, this.bound(this._onWaveSplineViewSettingsChange))
    }

    _onWaveSplineViewSettingsChange(e, t) {
        this._updateAll()
    }

    _onQuantizeTimeUnitChange(e, t) {
        if (!this._configuration.activeGenerator) return
        this._timeUnitSelect.value = this._configuration.activeGenerator.waveSplineView.timeUnit
        if (this._configuration.activeGenerator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_FREQUENCY) {
            this._frequencyControl.driver = FREQUENCY
            this._frequencyControl.step = .01
            this._frequencyControl.scale = POW_4
            this._frequencyControl.label = "Frequency"
        } else if (this._configuration.activeGenerator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_NOTE) {
            this._frequencyControl.driver = NOTE
            this._frequencyControl.step = 1 / 64
            this._frequencyControl.scale = LINEAR
            this._frequencyControl.label = "Note"
        } else if (this._configuration.activeGenerator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_MEASURES) {
            this._frequencyControl.driver = MEASURES
            this._frequencyControl.step = 1
            this._frequencyControl.scale = LINEAR
            this._frequencyControl.label = "Measures"
        } else if (this._configuration.activeGenerator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_COMMON) {
            this._frequencyControl.driver = COMMON
            this._frequencyControl.step = 1
            this._frequencyControl.scale = LINEAR
            this._frequencyControl.label = "Common"
        }
    }

    _onQuantizeXChange(e, t) {
        if (!this._configuration.activeGenerator) return
        this._quantizeXControl.value = this._configuration.activeGenerator.waveSplineView.quantizeX
        if (this._configuration.activeGenerator.waveSplineView.quantizeX == 0) {
            this._quantizeXThresholdControl.classList.add("hidden")
        } else {
            this._quantizeXThresholdControl.classList.remove("hidden")
        }
    }

    _onQuantizeXThresholdChange(e, t) {
        if (!this._configuration.activeGenerator) return
        this._quantizeXThresholdControl.value = this._configuration.activeGenerator.waveSplineView.quantizeXThreshold
    }

    _onQuantizeYChange(e, t) {
        if (!this._configuration.activeGenerator) return
        this._quantizeYControl.value = this._configuration.activeGenerator.waveSplineView.quantizeY

    }

    _onFrequencyChange(e, t) {
        if (!this._configuration.activeGenerator) return
        if (this._configuration.activeGenerator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_FREQUENCY) {
            this._frequencyControl.value = this._configuration.activeGenerator.waveSplineView.frequency
        } else if (this._configuration.activeGenerator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_NOTE) {
            this._frequencyControl.value = noteFrequencyConversion(this._configuration.activeGenerator.waveSplineView.frequency, this._configuration.masterTempo)
        } else if (this._configuration.activeGenerator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_MEASURES) {
            this._frequencyControl.value = noteFrequencyConversion(this._configuration.activeGenerator.waveSplineView.frequency, this._configuration.masterTempo)
        } else if (this._configuration.activeGenerator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_COMMON) {
            const noteval = noteFrequencyConversion(this._configuration.activeGenerator.waveSplineView.frequency, this._configuration.masterTempo)
            let commonIndex = COMMON_VALUES.findIndex((value) => {
                return Math.round(value * 1e3) === Math.round(noteval * 1e3)
            })
            if (commonIndex == -1 && noteval > COMMON_VALUES[COMMON_VALUES.length - 1]) commonIndex = COMMON_VALUES.length
            this._frequencyControl.value = commonIndex
        }
    }

    _onTimeUnitSelectChange(e) {
        this._configuration.activeGenerator.waveSplineView.timeUnit = this._timeUnitSelect.value
    }

    _onFrequencyControlChange(e) {
        if (!this._configuration.activeGenerator) return
        if (this._configuration.activeGenerator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_FREQUENCY) {
            this._configuration.activeGenerator.waveSplineView.frequency = this._frequencyControl.value
        } else if (this._configuration.activeGenerator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_NOTE) {
            this._configuration.activeGenerator.waveSplineView.frequency = noteFrequencyConversion(this._frequencyControl.value, this._configuration.masterTempo)
        } else if (this._configuration.activeGenerator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_MEASURES) {
            this._configuration.activeGenerator.waveSplineView.frequency = noteFrequencyConversion(this._frequencyControl.value, this._configuration.masterTempo)
        } else if (this._configuration.activeGenerator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_COMMON) {
            this._configuration.activeGenerator.waveSplineView.frequency = noteFrequencyConversion(COMMON_VALUES[this._frequencyControl.value], this._configuration.masterTempo)
        }
    }

    _onQuantizeXControlChange(e) {
        if (!this._configuration.activeGenerator) return
        this._configuration.activeGenerator.waveSplineView.quantizeX = this._quantizeXControl.value
    }

    _onQuantizeXThresholdControlChange(e) {
        if (!this._configuration.activeGenerator) return
        this._configuration.activeGenerator.waveSplineView.quantizeXThreshold = this._quantizeXThresholdControl.value
    }

    _onQuantizeYControlChange(e) {
        if (!this._configuration.activeGenerator) return
        this._configuration.activeGenerator.waveSplineView.quantizeY = this._quantizeYControl.value
    }

    _updateAll() {
        if (!this._configuration) return
        this._onQuantizeTimeUnitChange()
        this._onFrequencyChange()
        this._onQuantizeYChange()
        this._onQuantizeXChange()
        this._onQuantizeXThresholdChange()
    }

    destroy() {
        this._removeConfigurationListeners()
        this._removeActiveGeneratorListeners()
        this._timeUnitSelect.removeEventListener(Select.VALUE_CHANGE_EVENT, this.bound(this._onQuantizeYControlChange))
        this._timeUnitSelect.destroy()
        this._timeUnitSelect = null
        this._frequencyControl.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onFrequencyControlChange))
        this._frequencyControl.destroy()
        this._frequencyControl = null
        this._quantizeXControl.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onQuantizeXControlChange))
        this._quantizeXControl.destroy()
        this._quantizeXControl = null
        this._quantizeXThresholdControl.destroy()
        this._quantizeXThresholdControl.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onQuantizeXThresholdControlChange))
        this._quantizeXThresholdControl = null
        this._quantizeYControl.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onQuantizeYControlChange))
        this._quantizeYControl.destroy()
        this._quantizeYControl = null
        this._configuration = null
        this._containerEl.remove()
        super.destroy()

    }
}