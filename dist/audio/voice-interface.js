import SignalProcessor from "../events/signal-processor.js"
import Bindable from "../data/bindable.js"
import Voice from "../model/voice.js"
import { IDLE, ATTACK, DEAD, HOLD, RELEASE } from "../model/voice-state.js"

export default class VoiceInterface extends Bindable {


    constructor(audioContext, outputBus, generatorPool, voice) {
        super()

        this._mode = VoiceInterface.IDLE
        this._timeout

        this._waveGenerator = null
        this._pitchGenerator = null
        this._gainGenerator = null

        this._audioContext = audioContext

        this._volumeNode = this._audioContext.createGain()
        this._volumeNode.gain.value = 0

        this._generatorPool = generatorPool
        this.voice = voice
        this.outputBus = outputBus


    }

    set outputBus(value) {
        if (value === this._outputBus) return
        this._disconnectWaveGenerator()
        this._outputBus = value
        this._connectWaveGenerator()

    }
    get outputBus() {
        return this._outputBus
    }

    _connectWaveGenerator() {
        if (this._waveGenerator && this._outputBus) {
            this._waveGenerator.connect(this._volumeNode)
            this._volumeNode.gain.cancelScheduledValues(this._audioContext.currentTime)
            this._volumeNode.gain.setValueAtTime(0, this._audioContext.currentTime)
            this._volumeNode.connect(this._outputBus)
        }
    }

    _disconnectWaveGenerator() {
        if (this._waveGenerator && this._outputBus) {
            this._waveGenerator.disconnect(this._volumeNode)
            this._volumeNode.disconnect(this._outputBus)
        }
    }


    set voice(value) {
        this._removeVoiceListeners()
        this._voice = value
        this._addVoiceListeners()
        this._updateAll()
        if (this._voice.state === IDLE) this._voice.state = ATTACK
    }

    get voice() {
        return this._voice
    }

    _addVoiceListeners() {
        if (!this._voice) return
        SignalProcessor.add(this._voice, Voice.VOLUME_CHANGE, this.bound(this._onVoiceVolumeChange))
        SignalProcessor.add(this._voice, Voice.WAVE_CHANGE, this.bound(this._onVoiceWaveChange))
        SignalProcessor.add(this._voice, Voice.GAIN_CHANGE, this.bound(this._onVoiceGainChange))
        SignalProcessor.add(this._voice, Voice.PITCH_CHANGE, this.bound(this._onVoicePitchChange))
        SignalProcessor.add(this._voice, Voice.PITCH_SCALE_CHANGE, this.bound(this._onVoicePitchScaleChange))
        SignalProcessor.add(this._voice, Voice.STATE_CHANGE, this.bound(this._onVoiceStateChange))
        SignalProcessor.add(this._voice, Voice.SUSTAIN_CHANGE, this.bound(this._onVoiceSustainChange))

    }

    _removeVoiceListeners() {
        if (!this._voice) return
        SignalProcessor.remove(this._voice, Voice.VOLUME_CHANGE, this.bound(this._onVoiceVolumeChange))
        SignalProcessor.remove(this._voice, Voice.WAVE_CHANGE, this.bound(this._onVoiceWaveChange))
        SignalProcessor.remove(this._voice, Voice.GAIN_CHANGE, this.bound(this._onVoiceGainChange))
        SignalProcessor.remove(this._voice, Voice.PITCH_CHANGE, this.bound(this._onVoicePitchChange))
        SignalProcessor.remove(this._voice, Voice.PITCH_SCALE_CHANGE, this.bound(this._onVoicePitchScaleChange))
        SignalProcessor.remove(this._voice, Voice.STATE_CHANGE, this.bound(this._onVoiceStateChange))
        SignalProcessor.remove(this._voice, Voice.SUSTAIN_CHANGE, this.bound(this._onVoiceSustainChange))


    }

    _onVoiceSustainChange() {
        if (this._voice.state === HOLD) {
            if (this._stateChangeTimeout) this._stateChangeTimeout = clearTimeout(this._stateChangeTimeout)
            this._holdTime = this._audioContext.currentTime
            if (this.voice.sustain != Number.MAX_SAFE_INTEGER) {
                this._stateChangeTimeout = setTimeout(this.bound(this._onSustainTimeout), this._voice.sustain * 1000)
            }
        }
    }

    _onVoiceWaveChange() {
        if (this._waveGenerator) {
            this._disconnectWaveGenerator()
            this._generatorPool.release(this._waveGenerator.generator)
        }
        if (this._voice && this._voice.wave) {
            this._waveGenerator = this._generatorPool.retrieve(this.voice.wave)
            this._connectWaveGenerator()
        } else {
            this._waveGenerator = null
        }
    }

    _onVoiceGainChange() {
        if (this._gainGenerator) {
            this._gainGenerator.disconnect(this._waveGenerator.gainInput)
            this._generatorPool.release(this._gainGenerator.generator)
        }
        if (this._voice && this._voice.gain) {
            this._gainGenerator = this._generatorPool.retrieve(this.voice.gain)
            this._gainGenerator.connect(this._waveGenerator.gainInput)
        } else {
            this._gainGenerator = null
        }

    }

    _onVoicePitchChange() {
        if (this._pitchGenerator) {
            this._pitchGenerator.disconnect(this._waveGenerator.pitchInput)
            this._generatorPool.release(this._pitchGenerator.generator)
        }
        if (this._voice && this._voice.pitch) {
            this._pitchGenerator = this._generatorPool.retrieve(this.voice.pitch)
            this._pitchGenerator.connect(this._waveGenerator.pitchInput)
        } else {
            this._pitchGenerator = null
        }

    }

    _onVoiceVolumeChange() {
        if (this._voice.state === RELEASE) {
            return
        } else if (this._voice.state === ATTACK) {
            this._volumeNode.gain.cancelScheduledValues(this._audioContext.currentTime)
            this._volumeNode.gain.setValueAtTime(this._volumeNode.gain.value || 0, this._audioContext.currentTime)
            this._volumeNode.gain.linearRampToValueAtTime(this.voice.volume, this._onTime)
        } else if (this._voice.state === HOLD) {
            this._volumeNode.gain.cancelScheduledValues(this._audioContext.currentTime)
            this._volumeNode.gain.setValueAtTime(this._volumeNode.gain.value || 0, this._audioContext.currentTime)
            this._volumeNode.gain.linearRampToValueAtTime(this._voice.volume, this._audioContext.currentTime + .01)
        }

    }
    _onVoicePitchScaleChange() {
        this._waveGenerator._pitchScaleParam.setValueAtTime(this._voice.pitchScale, this._audioContext.currentTime)
    }

    _updateAll() {
        this._onVoiceWaveChange()
        this._onVoiceGainChange()
        this._onVoicePitchChange()
        this._onVoicePitchScaleChange()


    }

    _onVoiceStateChange() {
        if (this._stateChangeTimeout) this._stateChangeTimeout = clearTimeout(this._stateChangeTimeout)
        if (this._voice.state === ATTACK) {
            this._onTime = this._audioContext.currentTime + this.voice.attack
            this._volumeNode.gain.cancelScheduledValues(this._audioContext.currentTime)
            this._volumeNode.gain.setValueAtTime(this._volumeNode.gain.value || 0, this._audioContext.currentTime)
            this._volumeNode.gain.linearRampToValueAtTime(this.voice.volume, this._onTime)
            this._stateChangeTimeout = setTimeout(this.bound(this._onHoldTimeout), this.voice.attack * 1000)
        } else if (this._voice.state === HOLD) {
            this._holdTime = this._audioContext.currentTime
            if (this._voice.sustain != Number.MAX_SAFE_INTEGER) {
                this._stateChangeTimeout = setTimeout(this.bound(this._onSustainTimeout), this._voice.sustain * 1000)
            }
        } else if (this._voice.state === RELEASE) {
            this._offTime = this._audioContext.currentTime + this.voice.release
            this._volumeNode.gain.cancelScheduledValues(this._audioContext.currentTime)
            this._volumeNode.gain.setValueAtTime(this._volumeNode.gain.value, this._audioContext.currentTime)
            this._volumeNode.gain.linearRampToValueAtTime(0, this._offTime)
            this._stateChangeTimeout = setTimeout(this.bound(this._onDeleteTimeout), this.voice.release * 1000)
        } else if (this._voice.state === DEAD) {

        }
    }

    _onHoldTimeout() {
        this._voice.state = HOLD
    }

    _onSustainTimeout() {
        this._voice.state = RELEASE
    }

    _onDeleteTimeout() {
        this._voice.state = DEAD
    }


    destroy() {
        if (this._stateChangeTimeout) this._stateChangeTimeout = clearTimeout(this._stateChangeTimeout)
        if (this._pitchGenerator) {
            this._pitchGenerator.disconnect(this._waveGenerator.pitchInput)
            this._generatorPool.release(this._pitchGenerator.generator)
            this._pitchGenerator = null
        }
        if (this._gainGenerator) {
            this._gainGenerator.disconnect(this._waveGenerator.gainInput)
            this._generatorPool.release(this._gainGenerator.generator)
            this._gainGenerator = null
        }
        if (this._waveGenerator) {
            this._disconnectWaveGenerator()
            this._generatorPool.release(this._waveGenerator.generator)
            this._waveGenerator = null
        }
        this._removeVoiceListeners()
        this._voice = null
        this._audioContext = null
        this._volumeNode = null
        this._generatorPool = null
        this._outputBus = null
        super.destroy()
    }

}