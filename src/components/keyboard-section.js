import Keyboard from "../elements/keyboard.js"
import Modal from "../elements/modal.js"
import Select from "../elements/select.js"
import WebComponent from "../dom/web-component.js"
import SignalProcessor from "../events/signal-processor.js"
import { DEFAULT_VOICE } from "../model/default-voice.js"
import Configuration from "../model/configuration.js"
import KeyboardSectionSettingsModal from "./keyboard-section-settings-modal.js"
import RotaryCombo from "../elements/rotary-combo.js"
import { TRANSPOSE } from "../elements/rotary-combo-driver/transpose.js"
import { DEAD, IDLE } from "../model/voice-state.js"
import WaveSplineView from "../model/wave-spline-view.js"
import { MONOPHON, POLYPHON } from "../model/voice-mode.js"


export default class KeyboardSection extends WebComponent {
    static style = 'components/keyboard-section.css'

    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._controlEl = document.createElement('div')
        this._controlEl.classList.add("controls")
        this._containerEl.append(this._controlEl)

        this._modeSelectElement = Select.create()
        this._modeSelectElement.label = "Mode"
        this._modeSelectElement.options = [
            {
                label: "Mono",
                value: MONOPHON
            },
            {
                label: "Poly",
                value: POLYPHON            
            }
        ]
        this._modeSelectElement.addEventListener(Select.VALUE_CHANGE_EVENT, this.bound(this._onModeSelectChange))
       
        this._controlEl.append(this._modeSelectElement)

        this._keyboard = Keyboard.create()
        this._keyboard.addEventListener(Keyboard.NOTE_ON_EVENT, this.bound(this._onKeyDown), false)
        this._containerEl.append(this._keyboard)

         
        this._settingsEl = document.createElement('div')
        this._settingsEl.classList.add("settings")
        this._containerEl.append(this._settingsEl)

        this._transposeRotaryCombo = RotaryCombo.create()
        this._transposeRotaryCombo.label = "Transpose"
        this._transposeRotaryCombo.driver = TRANSPOSE
        this._transposeRotaryCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onTransposeComboChange), false)
        this._settingsEl.append(this._transposeRotaryCombo)
        
        this._buttonEl = document.createElement('button')
        this._buttonEl.textContent = "Config"
        this._buttonEl.addEventListener("pointerup", this.bound(this._onPointerUp))
        this._settingsEl.append(this._buttonEl)

        this._modalContent = KeyboardSectionSettingsModal.create()
    
        this._modal = Modal.create()
        this._modal.reference = this._buttonEl
        this._modal.content = this._modalContent
        
        this._configuration
        this._init()
    }

    async _init() {
        await this.fetchStyle(KeyboardSection.style)
        this.shadowRoot.append(this._containerEl)
    }

    _onPointerUp(e) {
        this._modal.visible = true
    }

    _onTransposeComboChange(e) {
        this._configuration.keyboardTranspose = this._transposeRotaryCombo.value
    }

    _onKeyboardKeysChange(e, t) {
        this._keyboard.keys = this._configuration.keyboardKeys
    }

    _onKeyboardDivisionsChange(e, t) {
        this._keyboard.divisions = this._configuration.keyboardDivisions
    }

    _onKeyboardFrequencyChange(e, t) {
        this._keyboard.frequency = this._configuration.keyboardFrequency
    }

    _onKeyboardTransposeChange(e, t) {
        this._transposeRotaryCombo.value = this._configuration.keyboardTranspose
        this._keyboard.transpose = this._configuration.keyboardTranspose
    }

    _updateKeyboard() {
        this._onKeyboardKeysChange()
        this._onKeyboardFrequencyChange()
        this._onKeyboardDivisionsChange()
        this._onKeyboardTransposeChange()
    }

    _onModeSelectChange(e) {
        this._configuration.keyboardMode = this._modeSelectElement.value
    }

    _onFrequencyComboChange(e) {
        this._configuration.keyboardFrequency = this._frequencyRotaryCombo.value
    }

    _onKeysComboChange(e) {
        this._configuration.keyboardKeys = this._keysRotaryCombo.value
    }

    _onDivisionsComboChange(e) {
        this._configuration.keyboardDivisions = this._divisionsRotaryCombo.value
    }

    _onTransposeComboChange(e) {
        this._configuration.keyboardTranspose = this._transposeRotaryCombo.value
    }

    _onKeyDown(e) {
        if (!e.detail.frequency) return
        if (
            this._configuration.keyboardMode === MONOPHON
            && this._configuration.activeVoice
            && (this._configuration.activeVoice.state !== IDLE 
                && this._configuration.activeVoice.state !== DEAD
            )
        ) {
            this._configuration.activeVoice.wave.waveSplineView.frequency = e.detail.frequency
        
        } else {
            let voice = null
            if (this._configuration.activeVoice) {
                voice = this._configuration.activeVoice.toObject()
                voice.wave.waveSplineView.frequency = e.detail.frequency
            } else {
                voice = DEFAULT_VOICE
            }
            let instance = this._configuration.voices.addVoice(voice)
            this._configuration.activeVoice = instance
        }
    }

    set configuration(value) {
        if (this._configuration === value) return
        this._removeConfigurationListeners()
        this._configuration = value
        this._addConfigurationListeners()
        this._updateKeyboard()
        this._updateFrequency()
        this._modalContent.configuration = this._configuration
        this._onKeyboardModeChange()
    }

    get configuration() {
        return this._configuration
    }

    _addConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.add(this._configuration, WaveSplineView.FREQUENCY_CHANGE, this.bound(this._onFrequencyChange))
        SignalProcessor.add(this._configuration, Configuration.ACTIVE_VOICE_CHANGE, this.bound(this._onActiveVoiceChange))
        SignalProcessor.add(this._configuration, Configuration.KEYBOARD_MODE_CHANGE, this.bound(this._onKeyboardModeChange))
        SignalProcessor.add(this._configuration, Configuration.KEYBOARD_DIVISIONS_CHANGE, this.bound(this._onKeyboardDivisionsChange))
        SignalProcessor.add(this._configuration, Configuration.KEYBOARD_FREQUENCY_CHANGE, this.bound(this._onKeyboardFrequencyChange))
        SignalProcessor.add(this._configuration, Configuration.KEYBOARD_KEYS_CHANGE, this.bound(this._onKeyboardKeysChange)) 
        SignalProcessor.add(this._configuration, Configuration.KEYBOARD_TRANSPOSE_CHANGE, this.bound(this._onKeyboardTransposeChange))
    
    }
    _removeConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.remove(this._configuration, WaveSplineView.FREQUENCY_CHANGE, this.bound(this._onFrequencyChange))
        SignalProcessor.remove(this._configuration, Configuration.ACTIVE_VOICE_CHANGE, this.bound(this._onActiveVoiceChange))
        SignalProcessor.remove(this._configuration, Configuration.KEYBOARD_MODE_CHANGE, this.bound(this._onKeyboardModeChange))
        SignalProcessor.remove(this._configuration, Configuration.KEYBOARD_DIVISIONS_CHANGE, this.bound(this._onKeyboardDivisionsChange))
        SignalProcessor.remove(this._configuration, Configuration.KEYBOARD_FREQUENCY_CHANGE, this.bound(this._onKeyboardFrequencyChange))
        SignalProcessor.remove(this._configuration, Configuration.KEYBOARD_KEYS_CHANGE, this.bound(this._onKeyboardKeysChange))
        SignalProcessor.remove(this._configuration, Configuration.KEYBOARD_TRANSPOSE_CHANGE, this.bound(this._onKeyboardTransposeChange))
    }

    _onActiveVoiceChange(e,t) {
        this._updateFrequency()
    }

    _onFrequencyChange(e,t) {
        this._updateFrequency()
    }

    _updateFrequency() {
        this._keyboard.highlight = this._configuration.activeVoice.wave.waveSplineView.frequency
    }
    

    _onKeyboardModeChange(e,t) {
        this._modeSelectElement.value = this._configuration.keyboardMode
    }

    destroy() {
        this._removeConfigurationListeners()
        this._keyboard.removeEventListener(Keyboard.NOTE_ON_EVENT, this.bound(this._onKeyDown), false)
        this._keyboard.destroy()
        this._transposeRotaryCombo.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onTransposeComboChange), false)
        this._transposeRotaryCombo.destroy()
        this._modeSelectElement.removeEventListener(Select.VALUE_CHANGE_EVENT, this.bound(this._onModeSelectChange))
        this._modeSelectElement.destroy()
        this._buttonEl.removeEventListener("pointerup", this.bound(this._onPointerUp))
        this._buttonEl.remove()
        this._modalContent.destroy()
        this._modal.destroy()
        this._configuration = null
        this._containerEl.remove()
        super.destroy()
    }
}