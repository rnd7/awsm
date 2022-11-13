import Bindable from "../data/bindable.js"
import SignalProcessor from "../events/signal-processor.js"
import Configuration from "../model/configuration.js"
import Voices from "../model/voices.js"
import WaveSplineProcessorPool from "./wave-spline-processor-pool.js"
import VoiceInterface from "./voice-interface.js"
import Voice from "../model/voice.js"
import { DEAD } from "../model/voice-state.js"

export default class AudioCore extends Bindable {
    constructor(configuration) {
        super()

        this._voiceInterfaces = new Map()
        this._init(configuration)
    }

    async _init(configuration) {
        this._audioContext = new AudioContext()
        this._generatorPool = new WaveSplineProcessorPool(this._audioContext)
        this._audioContext.resume()
        this._masterOutput = this._audioContext.createGain()
        this._masterOutput.gain.value = .5
        this._masterOutput.connect(this._audioContext.destination)
        await this._audioContext.audioWorklet.addModule(`audio/wave-spline-processor.js?a=${Math.random()}`).catch(console.error)
        this._holdInMem = new AudioWorkletNode(this._audioContext, 'wave-spline-processor')
        this.configuration = configuration
    }

    set configuration(value) {
        if (this._configuration === value) return
        this._removeConfigurationListeners()
        this._configuration = value
        this._addConfigurationListeners()
        this._onVoicesChange()
        this._onVolumeChange()
    }
    get configuration() {
        return this._configuration
    }

    _addConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.add(this._configuration, Configuration.MASTER_VOLUME_CHANGE, this.bound(this._onVolumeChange))
        SignalProcessor.add(this._configuration, Configuration.VOICES_CHANGE, this.bound(this._onVoicesChange))
        SignalProcessor.add(this._configuration, Voices.CHANGE, this.bound(this._onVoicesChange))
    }
    _removeConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.remove(this._configuration, Configuration.MASTER_VOLUME_CHANGE, this.bound(this._onVolumeChange))
        SignalProcessor.remove(this._configuration, Configuration.VOICES_CHANGE, this.bound(this._onVoicesChange))
        SignalProcessor.remove(this._configuration, Voices.CHANGE, this.bound(this._onVoicesChange))
    }

    _onVolumeChange() {
        this._adjustGain()
    }

    _onVoicesChange(e,t) {
        this._update()
       
    }

    _adjustGain() {
        this._masterOutput.gain.cancelScheduledValues(this._audioContext.currentTime)
        this._masterOutput.gain.linearRampToValueAtTime(this._configuration.masterVolume / (Math.pow(this._voiceInterfaces.size,.4)+1), this._audioContext.currentTime + .01)
    }

    _update() {
        const now = Date.now()
        this._configuration.voices.voices.forEach(voice => {
            if (!this._voiceInterfaces.has(voice)) {
                const voiceInterface = new VoiceInterface(this._audioContext, this._masterOutput, this._generatorPool, voice)
                this._voiceInterfaces.set(
                    voice, 
                    voiceInterface
                )
                this._addVoiceListeners(voice)
            }
        })
        this._adjustGain()
    }

    _addVoiceListeners(voice) {
        if (!voice) return
        SignalProcessor.add(voice, Voice.STATE_CHANGE, this.bound(this._onVoiceStateChange))
    }

    _removeVoiceListeners(voice) {
        if (!voice) return
        SignalProcessor.remove(voice, Voice.STATE_CHANGE, this.bound(this._onVoiceStateChange))
    }
    
    _onVoiceStateChange(e, t) {
        if (t.state === DEAD) {
            this._removeVoiceListeners(t)
            this._configuration.voices.removeVoice(t)
            const voiceInterface = this._voiceInterfaces.get(t)
            if (voiceInterface) voiceInterface.destroy()
            this._voiceInterfaces.delete(t)
        }
        this._adjustGain()
    }

}