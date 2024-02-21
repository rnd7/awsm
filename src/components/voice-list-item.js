import WebComponent from "../dom/web-component.js"
import Button from "../elements/button.js"
import Label from "../elements/label.js"
import SignalProcessor from "../events/signal-processor.js"
import { ATTACK, RELEASE } from "../model/voice-state.js"
import Voice from "../model/voice.js"

export class VoiceListItem extends WebComponent {
    static style = 'components/voice-list-item.css'

    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container', 'animated-opacity')

        this._vContainerEl = document.createElement('div')
        this._vContainerEl.classList.add("v-container")
        this._containerEl.append(this._vContainerEl)


        this._categoryEl = Label.create()
        this._categoryEl.classList.add("category")
        this._categoryEl.text = "Voice"
        this._vContainerEl.append(this._categoryEl)

        this._labelEl = Label.create()
        this._labelEl.text = "Voice"
        this._vContainerEl.append(this._labelEl)

        this._stateChangeButton = Button.create()
        this._stateChangeButton.label = "Kill"
        this._stateChangeButton.classList.add("hidden")
        this._stateChangeButton.addEventListener(Button.TRIGGER_EVENT, this.bound(this._onRemoveTrigger))

        this._containerEl.append(this._stateChangeButton)
        this._removable = false

        this._init()
    }

    async _init() {
        await this.fetchStyle(VoiceListItem.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
        this.render()
    }

    _onRemoveTrigger(e) {
        if (this._voice.state === RELEASE) {
            this._voice.state = ATTACK
        } else {
            this._voice.state = RELEASE
        }
    }

    set category(value) {
        if (this._category === value) return
        this._category = value
        this.render()
    }

    get category() {
        return this._category
    }

    set active(value) {
        if (this._active === value) return
        this._active = value
        this.render()
    }

    get active() {
        return this._active
    }

    set removable(value) {
        if (this._removable === value) return
        this._removable = value
        this.render()
    }

    get removable() {
        return this._removable
    }

    set voice(value) {
        if (this._voice === value) return
        this._removeVoiceListeners()
        this._voice = value
        this._addVoiceListeners()
        this.render()
    }

    get voice() {
        return this._voice
    }

    _addVoiceListeners() {
        if (!this._voice) return
        SignalProcessor.add(this._voice, Voice.STATE_CHANGE, this.bound(this._onVoiceStateChange))
        SignalProcessor.add(this._voice, Voice.NAME_CHANGE, this.bound(this._onVoiceNameChange))
    }

    _removeVoiceListeners() {
        if (!this._voice) return
        SignalProcessor.remove(this._voice, Voice.STATE_CHANGE, this.bound(this._onVoiceStateChange))
        SignalProcessor.remove(this._voice, Voice.NAME_CHANGE, this.bound(this._onVoiceNameChange))
    }

    _onVoiceNameChange() {
        this.render()
    }

    _onVoiceStateChange() {
        this.render()
    }

    renderCallback() {
        if (this._active) this._containerEl.classList.add("active")
        else this._containerEl.classList.remove("active")
        if (this._removable) this._stateChangeButton.classList.remove("hidden")
        else this._stateChangeButton.classList.add("hidden")
        this._labelEl.text = this._voice.name
        if (this._voice && this._voice.state === RELEASE) {
            this._stateChangeButton.label = "Revive"
            this._containerEl.classList.add("release")
        } else {
            this._stateChangeButton.label = "Kill"
            this._containerEl.classList.remove("release")
        }
        if (this._category) {
            this._categoryEl.classList.add("category")
            this._categoryEl.text = `${this._category}`
        } else {
            this._categoryEl.classList.remove("category")
            this._categoryEl.text = ""
        }
    }

    destroy() {
        this._removeVoiceListeners()
        this._categoryEl.destroy()
        this._categoryEl = null
        this._labelEl.destroy()
        this._labelEl = null
        this._stateChangeButton.removeEventListener(Button.TRIGGER_EVENT, this.bound(this._onRemoveTrigger))
        this._stateChangeButton.destroy()
        this._stateChangeButton = null
        this._containerEl.remove()
        this._voice = null
        super.destroy()
    }
}
