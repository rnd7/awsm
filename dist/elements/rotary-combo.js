import WebComponent from "../dom/web-component.js"
import Label from "./label.js"
import NumericInput from "./numeric-input.js"
import { UNIT_VALUE } from "./rotary-combo-driver/unit-value.js"
import Rotary from "./rotary.js"

export default class RotaryCombo extends WebComponent {
    static VALUE_CHANGE_EVENT = "value-change"
    static style = 'elements/rotary-combo.css'


    constructor() {
        super()

        this._value = 0
        this._step = 0

        this._driver = UNIT_VALUE

        this.appendStyle(RotaryCombo.style)

        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._rotary = Rotary.create()
        this._containerEl.append(this._rotary)
        this._rotary.addEventListener(Rotary.VALUE_CHANGE_EVENT, this.bound(this._onRotaryChange))

        this._panelEl = document.createElement('div')
        this._panelEl.classList.add("panel")

        this._labelEl = Label.create()
        this._labelEl.classList.add("label")
        this._panelEl.append(this._labelEl)

        this._input = NumericInput.create()
        this._panelEl.append(this._input)
        this._input.addEventListener(NumericInput.VALUE_CHANGE_EVENT, this.bound(this._onInputChange))

        this._containerEl.append(this._panelEl)

        this._init()
    }

    async _init() {
        await this.fetchStyle(RotaryCombo.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
        this.render()
    }

    _changeValue(value) {
        if (this._step) value = Math.round(value * (1 / this._step)) * this._step
        if (this._value == value) return
        this.value = value
        this.dispatchEvent(
            new CustomEvent(
                RotaryCombo.VALUE_CHANGE_EVENT,
                {
                    bubbles: false,
                    cancelable: false,
                    composed: true
                }
            )
        )
    }

    set driver(value) {
        if (this._driver === value) return
        this._driver = value
        this.render()
    }

    get driver() {
        return this._driver
    }

    set scale(value) {
        this._rotary.scale = value
    }

    get scale() {
        return this._rotary.scale
    }

    set continuous(value) {
        this._rotary.continuous = value
    }

    get continuous() {
        return this._rotary.continuous
    }

    set label(value) {
        if (this._label === value) return
        this._label = value
        this._labelEl.text = this._label
    }

    get label() {
        return this._labelEl.text
    }

    set labelColor(value) {
        this._labelEl.color = value
    }

    get labelColor() {
        return this._labelEl.color
    }

    get normalizedValue() {
        return this._driver.normalize(this._value)
    }

    set normalizedValue(value) {
        this._value = this._driver.denormalize(value)
        this.render()
    }

    set value(value) {
        if (value === this._value) return
        this._value = value
        this._input.value = this._driver.stringify(this._value)
        this._rotary.value = this.normalizedValue
    }

    get value() {
        return this._value
    }

    set step(value) {
        if (this._step === value) return
        this._step = value
    }

    get step() {
        return this._step
    }

    _onRotaryChange(e) {
        this._changeValue(this._driver.denormalize(e.target.value))
    }

    _onInputChange(e) {
        const parsed = this._driver.parse(e.target.value)
        if (parsed !== null) {
            this._changeValue(parsed)
        }
    }

    renderCallback() {
        this._input.value = this._driver.stringify(this._value)
        this._rotary.value = this.normalizedValue
    }

    destroy() {
        this._rotary.removeEventListener(Rotary.VALUE_CHANGE_EVENT, this.bound(this._onRotaryChange))
        this._rotary.destroy()
        this._input.removeEventListener(NumericInput.VALUE_CHANGE_EVENT, this.bound(this._onInputChange))
        this._input.destroy()
        this._input = null
        this._labelEl.destroy()
        this._labelEl = null
        this._containerEl.remove()
        this._containerEl = null
        this._driver = null
        super.destroy()
    }
}