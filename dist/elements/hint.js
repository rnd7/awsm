import WebComponent from "../dom/web-component.js"

export default class Hint extends WebComponent {

    static style = 'elements/hint.css'
    constructor() {
        super()
       
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._text = ''
        this._init()
    }

    async _init() {
        await this.fetchStyle(Hint.style)
        this.shadowRoot.append(this._containerEl)
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

    renderCallback() {
        this._containerEl.textContent = this._text
    }

    destroy() {
        this._containerEl.remove()
        this._containerEl = null
        super.destroy()
    }
}
