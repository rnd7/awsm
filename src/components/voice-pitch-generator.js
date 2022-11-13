
import RotaryCombo from "../elements/rotary-combo.js"
import SignalProcessor from "../events/signal-processor.js"
import Voice from "../model/voice.js"
import { PITCH_OCTAVE } from "../elements/rotary-combo-driver/pitch-octave.js"
import VoiceGenerator from "./voice-generator.js"

export default class VoicePitchGenerator extends VoiceGenerator {

    constructor() {
        super()
        this._pitchScaleCombo = RotaryCombo.create()
        this._pitchScaleCombo.label = "Pitch octaves"
        this._pitchScaleCombo.driver = PITCH_OCTAVE
        this._pitchScaleCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onPitchScaleComboChange))
        this.content = this._pitchScaleCombo
    }

    set voice(value) {
        if (this._voice === value) return
        this._removeVoiceListeners()
        this._voice = value
        this._addVoiceListeners()
        this._onPitchGeneratorChange()
        this._updatePitchScale()
        this.render()
    }
    get voice() {
        return this._voice
    } 
    _addVoiceListeners() {
        if (!this._voice) return
        SignalProcessor.add(this._voice, Voice.PITCH_CHANGE, this.bound(this._onPitchGeneratorChange))
        SignalProcessor.add(this._voice, Voice.PITCH_SCALE_CHANGE, this.bound(this._onPitchScaleChange))
    }
    _removeVoiceListeners() {
        if (!this._voice) return
        SignalProcessor.remove(this._voice, Voice.PITCH_CHANGE, this.bound(this._onPitchGeneratorChange))
        SignalProcessor.remove(this._voice, Voice.PITCH_SCALE_CHANGE, this.bound(this._onPitchScaleChange))
    }
    _onPitchGeneratorChange(e, t) {
        this.generator = this._voice.pitch
    }

    _onPitchScaleChange() {
        this._updatePitchScale()
    }

    _onPitchScaleComboChange(e) {
        this._voice.pitchScale = this._pitchScaleCombo.value
    }

    _updatePitchScale() {
        this._pitchScaleCombo.value = this._voice.pitchScale
    }

    renderCallback() {
        super.renderCallback()
        if (this._generator) {
            this._pitchScaleCombo.classList.remove("hidden")
        } else {
            this._pitchScaleCombo.classList.add("hidden")
        }
    }

    destroy() {
        this._removeVoiceListeners()
        this.content = null
        this._pitchScaleCombo.destroy()
        super.destroy()
    }
}
