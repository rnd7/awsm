import WebComponent from "../dom/web-component.js"

export default class KeyboardKey extends WebComponent {
    
    static TRIGGER_EVENT = "trigger"

    static style = 'elements/keyboard-key.css'

    constructor() {
        super()
        this._frequency = 440
        this._noteName = ""
        this._backgroundColor = null
        
        this._buttonEl = document.createElement('button')
        this._buttonEl.classList.add('container')
        this._highlightEl = document.createElement('div')
        this._highlightEl.classList.add("highlight-indicator")
        this._buttonEl.append(this._highlightEl)
        this._spacerEl = document.createElement('div')
        this._spacerEl.classList.add("spacer")
        this._buttonEl.append(this._spacerEl)
        this._noteLabel = document.createElement('div')
        this._buttonEl.append(this._noteLabel)
        this._frequencyLabel = document.createElement('div')
        this._buttonEl.append(this._frequencyLabel)
        this._init()
    }

    async _init() {
        await this.fetchStyle(KeyboardKey.style)
        this.shadowRoot.append(this._buttonEl)
        this.render()
    }

    set frequency(value) {
        if (this._frequency === value) return
        this._frequency = value
        this.render()
    }

    get frequency() {
        return this._frequency
    }

    set highlight(value) {
        if (this._highlight === value) return
        this._highlight = value
        this.render()
    }

    get highlight() {
        return this._highlight
    }

    set noteName(value) {
        if (this._noteName === value) return
        this._noteName = value
        this.render()
    }

    get noteName() {
        return this._noteName
    }

    set step(value) {
        if (this._step === value) return
        this._step = value
        this.render()
    }

    get step() {
        return this._step
    }

    set division(value) {
        if (this._division === value) return
        this._division = value
        this.render()
    }

    get division() {
        return this._division
    }

    set octave(value) {
        if (this._octave === value) return
        this._octave = value
        this.render()
    }

    get octave() {
        return this._octave
    }

    set backgroundColor(value) {
        if (this._backgroundColor === value) return
        this._backgroundColor = value
        this.render()
    }
    
    get backgroundColor() {
        return this._backgroundColor
    }

    set textColor(value) {
        if (this._textColor === value) return
        this._textColor = value
        this.render()
    }

    get textColor() {
        return this._textColor
    }

    renderCallback() {
        this._buttonEl.style.backgroundColor = this._backgroundColor
        this._buttonEl.style.color = this._textColor
        this._noteLabel.textContent = this._noteName || ''
        this._frequencyLabel.textContent = `${this._frequency.toFixed(2)}Hz`
        if (this._highlight) this._buttonEl.classList.add("highlight")
        else this._buttonEl.classList.remove("highlight")
    }

    destroy() {
        this._buttonEl.remove()
        super.destroy()
    }
}