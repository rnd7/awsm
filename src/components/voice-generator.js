import Button from "../elements/button.js"
import Label from "../elements/label.js"
import WebComponent from "../dom/web-component.js"
import SignalProcessor from "../events/signal-processor.js"
import Generator from "../model/generator.js"
import WaveSplineView from "../model/wave-spline-view.js"
import { getNote } from "../music/notes.js"
import noteFrequencyConversion from "../music/note-frequency-conversion.js"
import { fromFraction, toFraction } from "../math/fraction.js"

export default class VoiceGenerator extends WebComponent {
    static REMOVE_EVENT = "remove-event"
    static SELECT_EVENT = "select-event"
    static CREATE_EVENT = "create-event"
    static style = 'components/voice-generator.css'

    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')
        this._containerEl.addEventListener("pointerdown", this.bound(this._onPointerDown))

        this._labelContainerEl = document.createElement('div')
        this._labelContainerEl.classList.add('v-container')
        this._containerEl.append(this._labelContainerEl)

        this._labelEl = Label.create()
        this._labelEl.classList.add("label")
        this._labelEl.text = ""
        this._labelContainerEl.append(this._labelEl)



        this._noteEl = Label.create()
        this._noteEl.text = ""
        this._labelContainerEl.append(this._noteEl)

        this._noteValueEl = Label.create()
        this._noteValueEl.text = ""
        this._labelContainerEl.append(this._noteValueEl)

        this._frequencyEl = Label.create()
        this._frequencyEl.text = ""
        this._labelContainerEl.append(this._frequencyEl)

        this._durationEl = Label.create()
        this._durationEl.text = ""
        this._labelContainerEl.append(this._durationEl)

        this._buttonContainer = document.createElement('div')
        this._buttonContainer.classList.add("button-container")
        this._containerEl.append(this._buttonContainer)

        this._removeButton = Button.create()
        this._removeButton.label = "Disconnect"
        this._removeButton.addEventListener(Button.TRIGGER_EVENT, this.bound(this._onRemoveTrigger))
        this._buttonContainer.append(this._removeButton)

        this._createButton = Button.create()
        this._createButton.label = "Connect"
        this._createButton.addEventListener(Button.TRIGGER_EVENT, this.bound(this._onCreateTrigger))
        this._buttonContainer.append(this._createButton)

        this._removable = false
        this._active = null
        this._label = ""

        this._init()
    }

    set content(value) {
        if (this._content === value) return
        if (this._content) this._content.remove()
        this._content = value
        if (this._content && !this._content.parentElement) {
            if (this._buttonContainer.parentElement) this._containerEl.insertBefore(this._content, this._buttonContainer)
            else this._containerEl.append(this._content)
        }
        this.render()
    }

    get content() {
        return this._content
    }

    async _init() {
        await this.fetchStyle(VoiceGenerator.style)
        this.shadowRoot.append(this._containerEl)
    }

    set removable(value) {
        if (this._removable === value) return
        this._removable = value
        this.render()
    }
    get removable() {
        return this._removable
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
 
    set masterTempo(value) {
        if (this._masterTempo === value) return
        this._masterTempo = value
        this.render()
    }
    get masterTempo() {
        return this._masterTempo
    }

    set generator(value) {
        if (this._generator === value) return
        this._removeGeneratorListeners()
        this._generator = value
        this._addGeneratorListeners()
        this.render()
    }
    get generator() {
        return this._generator
    } 

    _addGeneratorListeners() {
        if (!this._generator) return
        SignalProcessor.add(this._generator, WaveSplineView.FREQUENCY_CHANGE, this.bound(this._onFrequencyChange))
    }

    _removeGeneratorListeners() {
        if (!this._generator) return
        SignalProcessor.remove(this._generator, WaveSplineView.FREQUENCY_CHANGE, this.bound(this._onFrequencyChange))
    }

    _onPointerDown(e) {
        this.dispatchEvent(new CustomEvent(
            VoiceGenerator.SELECT_EVENT, 
            {
                detail: {
                    generator: this._generator
                },
                bubbles: true,
                cancelable: false,
                composed: true, 
            }
        ))
    }

    _onRemoveTrigger(e) {
        this.dispatchEvent(new CustomEvent(
            VoiceGenerator.REMOVE_EVENT,
            {
                bubbles: true,
                cancelable: false,
                composed: true, 
            }
        ))
    }
    _onCreateTrigger(e) {
        this.dispatchEvent(new CustomEvent(
            VoiceGenerator.CREATE_EVENT,
            {
                bubbles: true,
                cancelable: false,
                composed: true, 
            }
        ))
    }

    _onFrequencyChange(e, t) {
        this.render()
    }
   
    _updateAll(){
        this._onFrequencyChange()
    }
    renderCallback() {
        if (this._generator) {
            this._frequencyEl.text = `${this._generator.waveSplineView.frequency.toFixed(2)} Hz`
            let note = getNote(this._generator.waveSplineView.frequency)
            if (note.note) {
                this._noteEl.text = `${note.note}${note.octave||''}`
            } else {
                this._noteEl.text = ""
            }
            const noteValue = noteFrequencyConversion(this._generator.waveSplineView.frequency, this._masterTempo)
            let fraction = toFraction(noteValue)
            let inverse = fromFraction(fraction)
            if (inverse === noteValue) {
                this._noteValueEl.text = fraction
            } else if (inverse > 0 && Math.round(inverse*64) === Math.round(noteValue*64)){
                this._noteValueEl.text = `≈ ${fraction}`
            } else {
                this._noteValueEl.text = ''
            }
            const duration = 1/this._generator.waveSplineView.frequency 
            if (duration >= 1) {
                this._durationEl.text = `${duration.toFixed(2)} s`
            } else if (duration >= 1/1e3) {
                this._durationEl.text = `${(duration * 1e3).toFixed(2)} ms`
            } else if (duration >= 1/1e6) {
                this._durationEl.text = `${(duration * 1e6).toFixed(2)} µs`
            }
            
        } else {
            this._frequencyEl.text = ""
            this._noteEl.text = ""
            this._noteValueEl.text = ""
            this._durationEl.text = ""
        }

        

        if (this._removable && !this._buttonContainer.parentElement) {
            this._containerEl.append(this._buttonContainer)
        } else if (!this._removable && this._buttonContainer.parentElement) {
            this._buttonContainer.remove()
        }

        if (this._removable && this._generator) {
            this._removeButton.classList.remove("hidden")
            this._createButton.classList.add("hidden")
        } else if (this._removable && !this._generator) {
            this._createButton.classList.remove("hidden")
            this._removeButton.classList.add("hidden")
        }
       
        this._labelEl.text = `${this._label}`
        if (this._active) this._containerEl.classList.add("active")
        else this._containerEl.classList.remove("active")
    }

    destroy() {

        this._removeButton.removeEventListener(Button.TRIGGER_EVENT, this.bound(this._onRemoveTrigger))
        this._createButton.removeEventListener(Button.TRIGGER_EVENT, this.bound(this._onCreateTrigger))
        this._removeGeneratorListeners()

        this._createButton.destroy()
        this._removeButton.destroy()
        this._frequencyEl.destroy()
        this._noteEl.destroy()
        this._noteValueEl.destroy()
        this._labelEl.destroy()

        this._containerEl.remove()

        this._generator = null

        super.destroy()
    }
}