import WebComponent from "../dom/web-component.js"
import { ALTERNATIVE_NOTE_NAMES, getNote, getOctave } from "../music/notes.js"
import KeyboardKey from "./keyboard-key.js"


export default class Keyboard extends WebComponent {

    static NOTE_ON_EVENT = "note-on"
    static NOTE_OFF_EVENT = "note-off"

    static style = 'elements/keyboard.css'

    constructor() {
        super()
        this._value = ''

        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._containerEl.addEventListener("pointerdown", this.bound(this._onPointerDown), false)
        this._containerEl.addEventListener("pointerup", this.bound(this._onPointerUp), false)

        this._keys = 12
        this._divisions = 12
        this._frequency = 440
        this._transpose = -2
        this._highlight = 0

        this._init()
    }

    async _init() {
        await this.fetchStyle(Keyboard.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
        this.render()
    }

    set highlight(value) {
        if (this._highlight === value) return
        this._highlight = value
        this._updateHighlight()
    }

    get highlight() {
        return this._highlight
    }

    _updateHighlight() {
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

    set keys(value) {
        if (this._keys === value) return
        this._keys = value
        this.render()
    }
    get keys() {
        return this._keys
    }

    set divisions(value) {
        if (this._divisions === value) return
        this._divisions = value
        this.render()
    }

    get divisions() {
        return this._divisions
    }

    set frequency(value) {
        if (this._frequency === value) return
        this._frequency = value
        this.render()
    }

    get frequency() {
        return this._frequency
    }

    set transpose(value) {
        if (this._transpose === value) return
        this._transpose = value
        this.render()
    }

    get transpose() {
        return this._transpose
    }

    _onPointerDown(e) {
        if (!e.target.frequency) return
        this.dispatchEvent(
            new CustomEvent(Keyboard.NOTE_ON_EVENT, {
                bubbles: true,
                cancelable: false,
                composed: true,
                detail: {
                    frequency: e.target.frequency
                }
            })
        )
    }

    _onPointerUp(e) {
        if (!e.target.frequency) return
        this.dispatchEvent(
            new CustomEvent(Keyboard.NOTE_OFF_EVENT, {
                bubbles: true,
                cancelable: false,
                composed: true,
                detail: {
                    frequency: e.target.frequency
                }
            })
        )
    }

    _generateKeys(from, keys = 12, divisions = 12, transpose = 0) {
        const list = []
        const range = keys + (transpose)
        for (let i = transpose; i < range; i++) {
            const frequency = from * Math.pow(2, i / divisions)
            const note = getNote(frequency)
            note.division = (i - transpose) % divisions
            note.step = Math.floor((i - transpose) / divisions)
            note.highlight = (Math.round(frequency * 1000) === Math.round(this._highlight * 1000))
            if (note.color === 0) {
                note.backgroundColor = '#E0E0E0'
                note.textColor = '#101010'
            } else if (note.color === 1) {
                note.backgroundColor = '#101010'
                note.textColor = '#E0E0E0'
            } else {
                let from = 0xb0
                let to = 0x80
                let color = Math.floor((from + (to - from) * note.division / divisions))
                note.backgroundColor = `rgb(${color},${color},${color})`
                note.textColor = '#101010'
            }

            if (note.note) {
                note.noteName = `${note.note}${note.octave || ''}`
            } else {
                let octave = getOctave(frequency)
                if (octave !== null) {
                    note.noteName = `${ALTERNATIVE_NOTE_NAMES[note.division]}${octave}`
                } else {
                    note.noteName = ''
                }
            }
            list.push(note)
        }
        return list
    }

    renderCallback() {
        const keys = this._generateKeys(this.frequency, this._keys, this._divisions, this._transpose)
        this.manageContainer(this._containerEl, keys, KeyboardKey)
    }

    destroy() {
        this._containerEl.removeEventListener("pointerdown", this.bound(this._onPointerDown), false)
        this._containerEl.removeEventListener("pointerup", this.bound(this._onPointerUp), false)
        this.destroyContainer(this._containerEl)
        this._containerEl.remove()
        this._containerEl = null
        super.destroy()
    }
}
