import WebComponent from "../dom/web-component.js"

export default class SelectOption extends WebComponent {

    static style = 'elements/select-option.css'

    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')
        this._buttonEl = document.createElement('button')
        this._containerEl.append(this._buttonEl)
        this._init()
    }

    async _init() {
        await this.fetchStyle(SelectOption.style)
        this.shadowRoot.append(this._containerEl)
        this.render()
    }

    set value(value) {
        if (value === this._value) return
        this._value = value
    }
    get value() {
        return this._value
    }

    set label(value) {
        if (value === this._label) return
        this._label = value
        this.render()
    }
    get label(){
        return this._label
    }

    set active(value) {
        if (value === this._active) return
        this._active = value
        this.render()
    }
    get active(){
        return this._active
    }

    renderCallback() {
        if (this._active) this._buttonEl.classList.add("active")
        else this._buttonEl.classList.remove("active")
        this._buttonEl.textContent = this._label || ''
    }

    destroy() {
        this._containerEl.remove()
        super.destroy()
    }
}