import WebComponent from "../dom/web-component.js"

export default class Logo extends WebComponent {

    static style = 'components/logo.css'

    constructor() {
        super()
        
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')
        
        this._nameEl = document.createElement('div')
        this._nameEl.classList.add('name')
        this._nameEl.textContent = 'AWSM'
        this._containerEl.append(this._nameEl)
        this._init()
    }

    async _init() {
        await this.fetchStyle(Logo.style)
        this.shadowRoot.append(this._containerEl)
        this.render()
    }

    destroy() {
        this._containerEl.remove()
        super.destroy()
    }
}
