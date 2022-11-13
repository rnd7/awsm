import WebComponent from "../dom/web-component.js"

export default class NumericInput extends WebComponent {

    static VALUE_CHANGE_EVENT = "value-change"

    static style = 'elements/numeric-input.css'

    constructor() {
        super()
        this._value = ''
       
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')
        
        this._inputEl = document.createElement('input')
        this._inputEl.addEventListener("change", this.bound(this._onInputChange))
        this._containerEl.append(this._inputEl)
        this._init()

    }

    async _init() {
        await this.fetchStyle(NumericInput.style)
        this.shadowRoot.append(this._containerEl)
        this.render()
    }

    _changeValue(value) {
        this._value = value
        this.dispatchEvent(
            new CustomEvent(
                NumericInput.VALUE_CHANGE_EVENT, 
                {
                    bubbles: true,
                    cancelable: false,
                    composed: true
                }
            )
        )
        this.render()
    }

    set value(value) {
        if (this._value === value) return
        this._value = value
        this.render()
    }
    get value() {
        return this._value
    }

    _onInputChange() {
        this._changeValue(this._inputEl.value)
    }

    renderCallback() {
        this._inputEl.value = this._value
       
    }
    destroy() {
        this._containerEl.remove()
        this._inputEl.removeEventListener("change", this.bound(this._onInputChange))
        this._inputEl.remove()
        this._inputEl = null
        this._containerEl.remove()
        this._containerEl = null
        super.destroy()
    }
}
