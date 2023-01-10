import WebComponent from "../dom/web-component.js"

export default class Toggle extends WebComponent {

    static TRIGGER_EVENT = "trigger"
    static style = 'elements/toggle.css'

    constructor() {
        super()

        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._buttonEl = document.createElement('button')
        this._buttonEl.addEventListener("pointerdown", this.bound(this._onPointerDown))
        this._buttonEl.addEventListener("pointerup", this.bound(this._onPointerUp))

        this._indicatorEl = document.createElement('div')
        this._indicatorEl.classList.add("indicator")
        this._buttonEl.append(this._indicatorEl)
        this._spacerEl = document.createElement('div')
        this._spacerEl.classList.add("spacer")
        this._buttonEl.append(this._spacerEl)
        this._labelEl = document.createElement('div')
        this._labelEl.classList.add("label")
        this._buttonEl.append(this._labelEl)
        this._containerEl.append(this._buttonEl)
        this._init()
    }

    async _init() {
        await this.fetchStyle(Toggle.style)
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

    set active(value) {
        if (this._active === value) return
        this._active = value
        this.render()
    }

    get active() {
        return this._active
    }

    set blink(value) {
        if (this._blink === value) return
        this._blink = value
        this.render()
    }

    get blink() {
        return this._blink
    }

    _onPointerDown(e) {
        this._down = true
    }

    _onPointerUp(e) {
        if (this._down) this.dispatchEvent(
            new CustomEvent(Toggle.TRIGGER_EVENT, {
                bubbles: true,
                cancelable: false,
                composed: true
            })
        )
        this._down = false
    }

    renderCallback() {
        this._labelEl.textContent = this._label
        if (this._active) this._indicatorEl.classList.add("active")
        else this._indicatorEl.classList.remove("active")
        if (this._blink) this._indicatorEl.classList.add("blink")
        else this._indicatorEl.classList.remove("blink")
    }

    destroy() {
        this._buttonEl.removeEventListener("pointerdown", this.bound(this._onPointerDown))
        this._buttonEl.removeEventListener("pointerup", this.bound(this._onPointerUp))
        this._buttonEl.remove()
        this._containerEl.remove()
        this._containerEl = null
        super.destroy()
    }
}
