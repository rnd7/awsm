import SignalProcessor from "../events/signal-processor.js"
import Generator from "./generator.js"
import instantiate from "./instantiate.js"
import ModelBase from "./model-base.js"
import { IDLE } from "./voice-state.js"

export default class Voice extends ModelBase {

    static WAVE_CHANGE = Symbol("WAVE_CHANGE")
    static PITCH_CHANGE = Symbol("PITCH_CHANGE")
    static GAIN_CHANGE = Symbol("GAIN_CHANGE")
    static TIME_CHANGE = Symbol("TIME_CHANGE")
    static ATTACK_CHANGE = Symbol("ATTTACK_CHANGE")
    static SUSTAIN_CHANGE = Symbol("SUSTAIN_CHANGE")
    static RELEASE_CHANGE = Symbol("RELEASE_CHANGE")
    static VOLUME_CHANGE = Symbol("VOLUME_CHANGE")
    static PITCH_SCALE_CHANGE = Symbol("PITCH_SCALE_CHANGE")
    static START_TIME_CHANGE = Symbol("START_TIME_CHANGE")
    static STOP_TIME_CHANGE = Symbol("STOP_TIME_CHANGE")
    static STATE_CHANGE = Symbol("STATE_CHANGE")

    constructor({
        wave = null,
        pitch = null,
        gain = null,
        attack = 0.7,
        sustain = Number.MAX_SAFE_INTEGER,
        release = 3,
        volume = 0.5,
        pitchScale = 1,
        startTime = 0,
        stopTime = Number.MAX_SAFE_INTEGER
    }) {
        super(...arguments)
        this.wave = wave
        this.pitch = pitch
        this.gain = gain
        this.attack = attack
        this.sustain = sustain
        this.release = release
        this.volume = volume
        this.pitchScale = pitchScale
        this.startTime = startTime
        this.stopTime = stopTime
        this.state = IDLE
    }

    get state() {
        return this._state
    }

    set state(value) {
        if (this._state === value) return
        this._state = value
        SignalProcessor.send(this, Voice.STATE_CHANGE)
    }

    set pitchScale(value) {
        if (this._pitchScale === value) return
        this._pitchScale = value
        SignalProcessor.send(this, Voice.PITCH_SCALE_CHANGE)
    }

    get pitchScale() {
        return this._pitchScale
    }

    set attack(value) {
        if (this._attack === value) return
        this._attack = value
        SignalProcessor.send(this, Voice.ATTACK_CHANGE)
    }

    get attack() {
        return this._attack
    }

    set sustain(value) {
        if (this._sustain === value) return
        this._sustain = value
        SignalProcessor.send(this, Voice.SUSTAIN_CHANGE)
    }

    get sustain() {
        return this._sustain
    }

    set release(value) {
        if (this._release === value) return
        this._release = value
        SignalProcessor.send(this, Voice.RELEASE_CHANGE)
    }

    get release() {
        return this._release
    }

    set startTime(value) {
        if (this._startTime === value) return
        this._startTime = value
        SignalProcessor.send(this, Voice.START_TIME_CHANGE)
    }

    get startTime() {
        return this._startTime
    }

    set stopTime(value) {
        if (this._stopTime === value) return
        this._stopTime = value
        SignalProcessor.send(this, Voice.STOP_TIME_CHANGE)
    }

    get stopTime() {
        return this._stopTime
    }

    set volume(value) {
        if (this._volume === value) return
        this._volume = value
        SignalProcessor.send(this, Voice.VOLUME_CHANGE)
    }

    get volume() {
        return this._volume
    }

    _addGeneratorListeners(generator) {
        if (!generator) return
        SignalProcessor.add(generator, SignalProcessor.WILDCARD, this.bound(this._onGeneratorChange))
    }

    _removeGeneratorListeners(generator) {
        if (!generator) return
        SignalProcessor.remove(generator, SignalProcessor.WILDCARD, this.bound(this._onGeneratorChange))
    }

    _onGeneratorChange(e, t) {
        SignalProcessor.send(this, e)
    }

    set wave(value) {
        if (this._wave === value) return
        this._removeGeneratorListeners(this._wave)
        this._wave = instantiate(value, Generator, true)
        this._addGeneratorListeners(this._wave)
        SignalProcessor.send(this, Voice.WAVE_CHANGE)
    }

    get wave() {
        return this._wave
    }

    get generators() {
        return [this._wave, this._gain, this._pitch].filter(e => e)
    }

    set pitch(value) {
        if (this._pitch === value) return
        this._removeGeneratorListeners(this._pitch)
        this._pitch = instantiate(value, Generator, false)
        this._addGeneratorListeners(this._pitch)
        SignalProcessor.send(this, Voice.PITCH_CHANGE)
    }

    get pitch() {
        return this._pitch
    }

    set gain(value) {
        if (this._gain === value) return
        this._removeGeneratorListeners(this._gain)
        this._gain = instantiate(value, Generator, false)
        this._addGeneratorListeners(this._gain)
        SignalProcessor.send(this, Voice.GAIN_CHANGE)
    }

    get gain() {
        return this._gain
    }

    toObject() {
        const obj = {}
        if (this._wave) obj.wave = this._wave.toObject()
        if (this._pitch) obj.pitch = this._pitch.toObject()
        if (this._gain) obj.gain = this._gain.toObject()
        obj.volume = this._volume
        obj.attack = this._attack
        obj.sustain = this._sustain
        obj.release = this._release
        obj.pitchScale = this._pitchScale
        obj.startTime = this._startTime
        obj.stopTime = this._stopTime
        return obj
    }

    destroy() {
        this._removeGeneratorListeners(this._wave)
        this._removeGeneratorListeners(this._pitch)
        this._removeGeneratorListeners(this._gain)
        super.destroy()
    }
}