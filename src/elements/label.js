import WebComponent from "../dom/web-component.js"

export default class Label extends WebComponent {

    static style = 'elements/label.css'
    constructor() {
        super()


        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._text = ''
        this._init()
    }

    async _init() {
        await this.fetchStyle(Label.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
        this.render()
    }

    set text(value) {
        if (this._text === value) return
        this._text = value
        this.render()
    }

    get text() {
        return this._text
    }

    set color(value) {
        if (this._color === value) return
        this._color = value
        this.render()
    }

    get color() {
        return this._color
    }

    renderCallback() {
        if (this._color) {
            this._containerEl.style.color = this._color
        } else {
            this._containerEl.style.removeProperty('color')
        }
        this._containerEl.textContent = this._text
    }

    destroy() {
        this._containerEl.remove()
        this._containerEl = null
        super.destroy()
    }
}
