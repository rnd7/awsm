
import RotaryCombo from "../elements/rotary-combo.js"
import WebComponent from "../dom/web-component.js"
import SignalProcessor from "../events/signal-processor.js"
import Configuration from "../model/configuration.js"
import { KEYBOARD_FREQUENCY } from "../elements/rotary-combo-driver/keyboard-frequency.js"
import { TRANSPOSE } from "../elements/rotary-combo-driver/transpose.js"
import { KEYBOARD_DIVISIONS } from "../elements/rotary-combo-driver/keyboard-divisions.js"
import { POW_4 } from "../elements/rotary-scale/pow-4.js"

export default class KeyboardSectionSettingsModal extends WebComponent {

    static VALUE_CHANGE_EVENT = "value-change"
    static style = 'components/keyboard-section-settings-modal.css'
   
    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._frequencyRotaryCombo = RotaryCombo.create()
        this._frequencyRotaryCombo.label = "Base"
        this._frequencyRotaryCombo.scale = POW_4
        this._frequencyRotaryCombo.driver = KEYBOARD_FREQUENCY
        this._frequencyRotaryCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onFrequencyComboChange), false)
        this._containerEl.append(this._frequencyRotaryCombo)

        this._keysRotaryCombo = RotaryCombo.create()
        this._keysRotaryCombo.label = "Keys"
        this._keysRotaryCombo.driver = KEYBOARD_DIVISIONS
        this._keysRotaryCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onKeysComboChange), false)
        this._containerEl.append(this._keysRotaryCombo)

        this._divisionsRotaryCombo = RotaryCombo.create()
        this._divisionsRotaryCombo.label = "Divisions"
        this._divisionsRotaryCombo.driver = KEYBOARD_DIVISIONS
        this._divisionsRotaryCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onDivisionsComboChange), false)
        this._containerEl.append(this._divisionsRotaryCombo)
        
        this._init()
    }

    async _init() {
        await this.fetchStyle(KeyboardSectionSettingsModal.style)
        this.shadowRoot.append(this._containerEl)
        this.render()
    }
    
    set configuration(value) {
        if (this._configuration === value) return
        this._removeConfigurationListeners()
        this._configuration = value
        this._addConfigurationListeners()
        this._updateAll()
    }

    get configuration() {
        return this._configuration
    }
    
    _addConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.add(this._configuration, Configuration.KEYBOARD_DIVISIONS_CHANGE, this.bound(this._onKeyboardDivisionsChange))
        SignalProcessor.add(this._configuration, Configuration.KEYBOARD_FREQUENCY_CHANGE, this.bound(this._onKeyboardFrequencyChange))
        SignalProcessor.add(this._configuration, Configuration.KEYBOARD_KEYS_CHANGE, this.bound(this._onKeyboardKeysChange))  
    }

    _removeConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.remove(this._configuration, Configuration.KEYBOARD_DIVISIONS_CHANGE, this.bound(this._onKeyboardDivisionsChange))
        SignalProcessor.remove(this._configuration, Configuration.KEYBOARD_FREQUENCY_CHANGE, this.bound(this._onKeyboardFrequencyChange))
        SignalProcessor.remove(this._configuration, Configuration.KEYBOARD_KEYS_CHANGE, this.bound(this._onKeyboardKeysChange))
    }

    _onKeyboardKeysChange(e, t) {
        this._keysRotaryCombo.value = this._configuration.keyboardKeys
    }

    _onKeyboardDivisionsChange(e, t) {
        this._divisionsRotaryCombo.value = this._configuration.keyboardDivisions
    }

    _onKeyboardFrequencyChange(e, t) {
        this._frequencyRotaryCombo.value = this._configuration.keyboardFrequency
    }

    _updateAll() {
        this._onKeyboardKeysChange()
        this._onKeyboardDivisionsChange()
        this._onKeyboardFrequencyChange()
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

    destroy() {
        this._removeConfigurationListeners()

        this._frequencyRotaryCombo.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onFrequencyComboChange), false)
        this._frequencyRotaryCombo.destroy()
        
        this._keysRotaryCombo.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onKeysComboChange), false)
        this._keysRotaryCombo.destroy()

        this._divisionsRotaryCombo.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onDivisionsComboChange), false)
        this._divisionsRotaryCombo.destroy()

        this._containerEl.remove()
        super.destroy()
    }
}