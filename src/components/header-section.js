import RotaryCombo from "../elements/rotary-combo.js"
import SignalProcessor from "../events/signal-processor.js"
import Configuration from "../model/configuration.js"
import Logo from "./logo.js"
import { TEMPO } from "../elements/rotary-combo-driver/tempo.js"
import { LINEAR } from "../elements/rotary-scale/linear.js"
import Button from "../elements/button.js"
import Toggle from "../elements/toggle.js"
import DynamicWebComponent from "../dom/dynamic-web-component.js"
import GlobalSettingsModal from "./global-settings-modal.js"
import Select from "../elements/select.js"

export default class HeaderSection extends DynamicWebComponent {
    static style = 'components/header-section.css'
    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._logo = Logo.create()
        this._containerEl.append(this._logo)

        this._h1ContainerEl = document.createElement('div')
        this._h1ContainerEl.classList.add('h-container')
        this._containerEl.append(this._h1ContainerEl)

        this._tempoControl = RotaryCombo.create()
        this._tempoControl.driver = TEMPO
        this._tempoControl.scale = LINEAR
        this._tempoControl.label = "Tempo"
        this._tempoControl.step = 1
        this._tempoControl.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onTempoControlChange))
        this._h1ContainerEl.append(this._tempoControl)


        this._spacerEl = document.createElement('div')
        this._spacerEl.classList.add('spacer')
        this._h1ContainerEl.append(this._spacerEl)

        this._masterVolumeControl = RotaryCombo.create()
        this._masterVolumeControl.classList.add("right-align")
        this._masterVolumeControl.label = "Main Out"
        this._masterVolumeControl.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onMasterVolumeControlChange))
        this._h1ContainerEl.append(this._masterVolumeControl)


        this._clipToggle = Toggle.create()
        this._clipToggle.classList.add("clip")
        this._clipToggle.label = "Protection"
        this._clipToggle.addEventListener(Toggle.TRIGGER_EVENT, this.bound(this._onClipToggleTrigger))
        this._h1ContainerEl.append(this._clipToggle)

        this._panicButton = Button.create()
        this._panicButton.classList.add("panic")
        this._panicButton.label = "Panic"
        this._panicButton.addEventListener(Button.TRIGGER_EVENT, this.bound(this._onPanicButtonTrigger))
        this._h1ContainerEl.append(this._panicButton)


        this._buttonEl = document.createElement('button')
        this._buttonEl.textContent = "Settings"
        this._buttonEl.addEventListener("pointerup", this.bound(this._onPointerUp))

        this._indicatorEl = document.createElement('div')
        this._indicatorEl.classList.add("indicator")
        this._modalContent = GlobalSettingsModal.create()

        this._configuration = null
        this._init()

    }

    async _init() {
        await this.fetchStyle(HeaderSection.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
    }

    set configuration(value) {
        if (this._configuration === value) return
        this._removeConfigurationListeners()
        this._configuration = value
        this._modalContent.configuration = this._configuration
        this._addConfigurationListeners()
        this._updateAll()
    }

    get configuration() {
        return this._configuration
    }

    _onPointerUp(e) {
        this._buttonEl.removeEventListener("pointerup", this.bound(this._onPointerUp))
        //if (e.target === this._buttonEl) {
            requestAnimationFrame(() => {
                this._buttonEl.append(this._modalContent)
                const referenceRect = this._modalContent.getBoundingClientRect()
                this._modalContent.style.zIndex = 1000
                this._modalContent.style.top = `${70}px`
                this._modalContent.style.left = `${-5}px`

                this._indicatorEl.style.bottom = `${-5}px`
                this._indicatorEl.style.left = `${-5}px`
                this._indicatorEl.style.width = `${60}px`
                this._indicatorEl.style.height = `${60}px`
                this._buttonEl.append(this._indicatorEl)
            })
            this.dispatchEvent(
                new CustomEvent(Select.TRIGGER_EVENT, {
                    bubbles: true,
                    cancelable: false,
                    composed: true
                })
            )
            this._ignore = e
            document.addEventListener('pointerup', this.bound(this._onGlobalPointerUp))
        //}
    }

    _onGlobalPointerUp(e) {
        if (e !== this._ignore) { //  && !e.path.includes(this._modalContent)
            this._modalContent.remove()
            this._indicatorEl.remove()
            document.removeEventListener('pointerup', this.bound(this._onGlobalPointerUp))
        }
        this._buttonEl.addEventListener("pointerup", this.bound(this._onPointerUp))
    }

    _addConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.add(this._configuration, Configuration.MASTER_TEMPO_CHANGE, this.bound(this._onTempoChange))
        SignalProcessor.add(this._configuration, Configuration.SPEAKER_PROTECTION_CHANGE, this.bound(this._onSpeakerProtectionChange))
        SignalProcessor.add(this._configuration, Configuration.OUTPUT_CLIPPED_CHANGE, this.bound(this._onOutputClippedChange))
        SignalProcessor.add(this._configuration, Configuration.MASTER_VOLUME_CHANGE, this.bound(this._onMasterVolumeChange))
    }

    _removeConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.remove(this._configuration, Configuration.MASTER_TEMPO_CHANGE, this.bound(this._onTempoChange))
        SignalProcessor.remove(this._configuration, Configuration.SPEAKER_PROTECTION_CHANGE, this.bound(this._onSpeakerProtectionChange))
        SignalProcessor.remove(this._configuration, Configuration.OUTPUT_CLIPPED_CHANGE, this.bound(this._onOutputClippedChange))
        SignalProcessor.remove(this._configuration, Configuration.MASTER_VOLUME_CHANGE, this.bound(this._onMasterVolumeChange))
    }

    _onSpeakerProtectionChange(e, t) {
        this._clipToggle.active = this._configuration.speakerProtection
        if (!this._configuration.speakerProtection) this._clipToggle.blink = false
        else if (this._configuration.outputClipped) this._clipToggle.blink = true
    }

    _onOutputClippedChange(e, t) {
        if (this._configuration.speakerProtection && this._configuration.outputClipped) this._clipToggle.blink = true
        else this._clipToggle.blink = false
    }

    _onTempoChange(e, t) {
        this._tempoControl.value = this._configuration.masterTempo
    }

    _onTempoControlChange(e) {
        this._configuration.masterTempo = this._tempoControl.value
    }

    _onMasterVolumeChange(e, t) {
        this._masterVolumeControl.value = this._configuration.masterVolume
    }

    _onMasterVolumeControlChange(e) {
        this._configuration.masterVolume = this._masterVolumeControl.value
    }

    _onClipToggleTrigger(e) {
        this._configuration.speakerProtection = !this._configuration.speakerProtection
    }

    _onPanicButtonTrigger(e) {
        this._configuration.panic()
    }

    _updateAll() {
        if (!this._configuration) return
        this._onMasterVolumeChange()
        this._onTempoChange()
        this._onSpeakerProtectionChange()
    }

    resize() {
        this.render()
    }

    renderCallback() {
        if (this.dedicatedWidth < 470) {
            if (this._h1ContainerEl.parentNode) {
                this._h1ContainerEl.remove()
            }
            if (!this._buttonEl.parentNode) {
                this._containerEl.append(this._buttonEl)
            }
        } else {
            if (this._buttonEl.parentNode) {
                this._buttonEl.remove()
            }
            if (!this._h1ContainerEl.parentNode) {
                this._containerEl.append(this._h1ContainerEl)
            }
        }
    }

    destroy() {
        this._removeConfigurationListeners()
        document.removeEventListener('pointerup', this.bound(this._onGlobalPointerUp))
        this._logo.destroy()
        this._logo = null
        this._tempoControl.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onTempoControlChange))
        this._tempoControl.destroy()
        this._tempoControl = null
        this._masterVolumeControl.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onMasterVolumeControlChange))
        this._masterVolumeControl.destroy()
        this._masterVolumeControl = null
        this._clipToggle.removeEventListener(Toggle.TRIGGER_EVENT, this.bound(this._onClipToggleTrigger))
        this._clipToggle.destroy()
        this._clipToggle = null
        this._panicButton.removeEventListener(Button.TRIGGER_EVENT, this.bound(this._onPanicButtonTrigger))
        this._panicButton.destroy()
        this._buttonEl.removeEventListener("pointerup", this.bound(this._onPointerUp))
        this._modalContent.destroy()
        this._containerEl.remove()
        this._configuration = null
        super.destroy()

    }
}