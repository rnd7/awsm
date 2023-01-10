import WebComponent from "../dom/web-component.js"

export default class Button extends WebComponent {

    static TRIGGER_EVENT = "trigger"
    static style = 'elements/button.css'

    constructor() {
        super()

        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._buttonEl = document.createElement('button')
        this._buttonEl.addEventListener("pointerdown", this.bound(this._onPointerDown))
        this._buttonEl.addEventListener("pointerup", this.bound(this._onPointerUp))
        this._containerEl.append(this._buttonEl)
        this._init()
    }

    async _init() {
        await this.fetchStyle(Button.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
        this.render()
    }

    set label(value) {
        if (this._label === value) return
        this._label = value
        this.render()
    }

    get label() {
        return this._label
    }

    get value() {
        return this._label
    }

    _onPointerDown(e) {
        this._down = true
    }

    _onPointerUp(e) {
        if (this._down) this.dispatchEvent(
            new CustomEvent(Button.TRIGGER_EVENT, {
                bubbles: true,
                cancelable: false,
                composed: true
            })
        )
        this._down = false
    }

    renderCallback() {
        this._buttonEl.textContent = this._label
    }

    destroy() {
        this._buttonEl.removeEventListener("pointerdown", this.bound(this._onPointerDown))
        this._buttonEl.removeEventListener("pointerup", this.bound(this._onPointerUp))
        this._buttonEl.remove()
        this._buttonEl = null
        this._label = null
        this._containerEl.remove()
        super.destroy()
    }
}
