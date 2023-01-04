import WebComponent from "../dom/web-component.js"
import SignalProcessor from "../events/signal-processor.js"
import Configuration from "../model/configuration.js"
import VoiceSettings from "./voice-settings.js"
import { VoiceListItem } from "./voice-list-item.js"
import Voices from "../model/voices.js"
import SectionLabel from "../elements/section-label.js"

export default class VoiceSection extends WebComponent {
    static style = 'components/voice-section.css'


    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')


        this._voiceSettingsContainer = document.createElement('div')
        this._voiceSettingsContainer.classList.add("voice-row", "voice-settings-row")
        this._containerEl.append(this._voiceSettingsContainer)

        this._voiceSettings = VoiceSettings.create()
        this._voiceSettingsContainer.append(this._voiceSettings)

        this._voicesContainer = document.createElement('div')
        this._voicesContainer.classList.add("voices-container")
        this._containerEl.append(this._voicesContainer)

        this._voicesLabel = SectionLabel.create()
        this._voicesLabel.text = "Voices"
        this._voicesContainer.append(this._voicesLabel)

        this._voiceSection = document.createElement('div')
        this._voiceSection.classList.add("voices")
        this._voicesContainer.append(this._voiceSection)

        this._voiceRowEl = document.createElement('div')
        this._voiceRowEl.classList.add("voice-row", "voice-selection-row")
        this._voicesContainer.append(this._voiceRowEl)




        this._voicesContainerEl = document.createElement('div')
        this._voicesContainerEl.classList.add('voices')
        this._voiceRowEl.append(this._voicesContainerEl)

        this._containerEl.addEventListener("pointerdown", this.bound(this._onContainerDown))

        this._init()
    }

    async _init() {
        await this.fetchStyle(VoiceSection.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
        this.render()
    }

    _onContainerDown(e) {
        if (e.target.voice) this._configuration.activeVoice = e.target.voice
    }

    set configuration(value) {
        if (this._configuration === value) return
        this._removeConfigurationListeners()
        this._configuration = value
        this._addConfigurationListeners()
        this._updateEditorState()
        this.render()
    }
    get configuration() {
        return this._configuration
    }

    _addConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.add(this._configuration, Configuration.DEFAULT_VOICE_CHANGE, this.bound(this._onDefaultVoiceChange))
        SignalProcessor.add(this._configuration, Configuration.ACTIVE_VOICE_CHANGE, this.bound(this._onActiveVoiceChange))
        SignalProcessor.add(this._configuration, Configuration.GRAVEYARD_VOICE_CHANGE, this.bound(this._onGraveyardVoiceChange))
        SignalProcessor.add(this._configuration, Configuration.VOICES_CHANGE, this.bound(this._onVoicesChange))
        SignalProcessor.add(this._configuration, Voices.CHANGE, this.bound(this._onVoicesChange))
    }
    _removeConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.remove(this._configuration, Configuration.DEFAULT_VOICE_CHANGE, this.bound(this._onDefaultVoiceChange))
        SignalProcessor.remove(this._configuration, Configuration.ACTIVE_VOICE_CHANGE, this.bound(this._onActiveVoiceChange))
        SignalProcessor.remove(this._configuration, Configuration.GRAVEYARD_VOICE_CHANGE, this.bound(this._onGraveyardVoiceChange))
        SignalProcessor.remove(this._configuration, Configuration.VOICES_CHANGE, this.bound(this._onVoicesChange))
        SignalProcessor.remove(this._configuration, Voices.CHANGE, this.bound(this._onVoicesChange))
    }

    _onDefaultVoiceChange(e, t) {
        this._updateDefaultVoice()
    }

    _onActiveVoiceChange(e, t) {
        this.render()
    }

    _onGraveyardVoiceChange(e, t) {
        this.render()
    }

    _onVoicesChange() {
        this.render()
    }

    _updateEditorState() {
        this._voiceSettings.configuration = this._configuration
    }

    renderCallback() {
        let list = this._configuration.voices.voices.map((voice) => {
            return {
                voice,
                active: this._configuration.activeVoice === voice,
                removable: true
            }
        })
        if (this._configuration.graveyardVoice) {
            list.unshift({
                voice: this._configuration.graveyardVoice,
                active: this._configuration.activeVoice === this._configuration.graveyardVoice,
                removable: false,
                category: "Grave"
            })
        }
        list.unshift({
            voice: this._configuration.defaultVoice,
            active: this._configuration.activeVoice === this._configuration.defaultVoice,
            removable: false,
            category: "Ether"
        })

        this.manageContainer(this._voicesContainerEl, list, VoiceListItem)
    }

    destroy() {

        this._containerEl.removeEventListener("pointerdown", this.bound(this._onContainerDown))
        this._removeConfigurationListeners()
        this.destroyContainer(this._voicesContainerEl)
        this._configuration = null
        this._voices = null
        this._containerEl.remove()
        this._containerEl = null
        super.destroy()
    }
}