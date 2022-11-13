import Bindable from "../data/bindable.js"
import SignalProcessor from "../events/signal-processor.js"
import randomString from "../string/random-string.js"
import instantiate from "./instantiate.js"
import ModelBase from "./model-base.js"
import { RELEASE } from "./voice-state.js"
import Voice from "./voice.js"
import WaveSplineView from "./wave-spline-view.js"
import WaveSpline from "./wave-spline.js"



export default class Voices extends ModelBase {
    static CHANGE = Symbol("CHANGE")

    constructor({
        voices
    }) {
        super(...arguments)
        this.voices = voices || []
        this._generators = new Map()
    }

    get generators() {
        return new Set(this._voices.map(voice=>voice.generators).flat())
    }

    get voices() {
        return this._voices
    }

    set voices(value) {
        this.clearVoices(true)
        value.forEach(voice=>{
            this.addVoice(voice, true)
        })
        SignalProcessor.send(this, Voices.CHANGE)
    }

    releaseAll() {
        this._voices.forEach(voice=>{
            voice.state = RELEASE
        })
    }

    hasVoice(value) {
        return this._voices.find(voice=>{
            return voice === value
        })
    }

    clearVoices(silent = false) {
        if (this._voices) {
            this._voices.forEach((voice)=>{
                this._removeVoiceListeners(voice)
            }) 
        }
        this._voices = []
        if (!silent) SignalProcessor.send(this, Voices.CHANGE)
    }

    addVoice(value, silent=false) {
        let voice = instantiate(value, Voice)
        this._voices.push(voice)
        this._addVoiceListeners(voice)
        if (!silent) SignalProcessor.send(this, Voices.CHANGE)
        return voice
    }

    removeVoice(value) {
        this._removeVoiceListeners(value)
        this._voices = this._voices.filter((voice)=>{
            return voice !== value
        })
        SignalProcessor.send(this, Voices.CHANGE)
    }

    _addVoiceListeners(voice) {
        if (!voice) return
        SignalProcessor.add(voice, SignalProcessor.WILDCARD, this.bound(this._onVoiceGeneratorChange))
    }

    _removeVoiceListeners(voice) {
        if (!voice) return
        SignalProcessor.remove(voice, SignalProcessor.WILDCARD, this.bound(this._onVoiceGeneratorChange))
    }

    _onVoiceGeneratorChange(e, t) {
        SignalProcessor.send(this, e)
    }
    
    toObject() {
        const obj = {}
        if (this._voices) obj.voices = this._voices.map(voice => voice.toObject())
        return obj
    }

    destroy() {
        super.destroy()
    }
}