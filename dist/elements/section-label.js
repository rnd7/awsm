import WebComponent from "../dom/web-component.js"

export default class SectionLabel extends WebComponent {

    static style = 'elements/section-label.css'

    constructor() {
        super()

        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._labelEl = document.createElement('div')
        this._labelEl.classList.add('label')
        this._containerEl.append(this._labelEl)
        this._init()
    }

    async _init() {
        await this.fetchStyle(SectionLabel.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
        this.render()
    }

    set text(value) {
        if (value === this._text) return
        this._text = value
        this.render()
    }

    get text() {
        return this._text
    }

    renderCallback() {
        this._labelEl.textContent = this._text
    }

    destroy() {
        this._labelEl.remove()
        this._labelEl = null
        this._containerEl.remove()
        this._containerEl = null
        super.destroy()
    }
}
