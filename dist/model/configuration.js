import SignalProcessor from "../events/signal-processor.js"
import instantiate from "./instantiate.js"
import Voices from "./voices.js"
import Generator from "./generator.js"
import Voice from "./voice.js"
import WaveSplineNode from "./wave-spline-node.js"
import WaveSplineView from "./wave-spline-view.js"
import WaveSpline from "./wave-spline.js"
import ModelBase from "./model-base.js"
import noteFrequencyConversion from "../music/note-frequency-conversion.js"
import { POLYPHON } from "./voice-mode.js"
import { GAIN, PITCH, WAVE } from "./voice-generator-category.js"

export default class Configuration extends ModelBase {

    static ACTIVE_WAVESPLINE_CHANGE = Symbol("ACTIVE_WAVESPLINE_CHANGE")
    static ACTIVE_WAVESPLINE_NODES_CHANGE = Symbol("ACTIVE_WAVESPLINE_NODES_CHANGE")
    static ACTIVE_WAVESPLINE_VIEW_CHANGE = Symbol("ACTIVE_WAVESPLINE_VIEW_CHANGE")
    static ACTIVE_WAVESPLINE_NODE_CHANGE = Symbol("ACTIVE_WAVESPLINE_NODE_CHANGE")
    static ACTIVE_GENERATOR_CHANGE = Symbol("ACTIVE_GENERATOR_CHANGE")
    static ACTIVE_GENERATOR_CATEGORY_CHANGE = Symbol("ACTIVE_GENERATOR_CATEGORY_CHANGE")
    static ACTIVE_VOICE_CHANGE = Symbol("ACTIVE_VOICE_CHANGE")
    static VOICES_CHANGE = Symbol("VOICES_CHANGE")
    static KEYBOARD_CHANGE = Symbol("KEYBOARD_CHANGE")
    static KEYBOARD_KEYS_CHANGE = Symbol("KEYBOARD_KEYS_CHANGE")
    static KEYBOARD_FREQUENCY_CHANGE = Symbol("KEYBOARD_FREQUENCY_CHANGE")
    static KEYBOARD_DIVISIONS_CHANGE = Symbol("KEYBOARD_DIVISIONS_CHANGE")
    static KEYBOARD_TRANSPOSE_CHANGE = Symbol("KEYBOARD_TRANSPOSE_CHANGE")
    static MASTER_TEMPO_CHANGE = Symbol("MASTER_TEMPO_CHANGE")
    static MASTER_VOLUME_CHANGE = Symbol("MASTER_VOLUME_CHANGE")
    static KEYBOARD_MODE_CHANGE = Symbol("KEYBOARD_MODE_CHANGE")
    static DEFAULT_VOICE_CHANGE = Symbol("DEFAULT_GENERATOR_CHANGE")
    static GRAVEYARD_VOICE_CHANGE = Symbol("GRAVEYARD_VOICE_CHANGE")

    constructor({
        voices = null,
        defaultVoice = null,
        activeWaveSplineNode,
        activeGenerator,
        activeGeneratorCategory = WAVE,
        activeVoice,
        keyboardKeys = 16,
        keyboardDivisions = 12,
        keyboardFrequency = 440,
        keyboardTranspose = -2,
        masterTempo = 120,
        masterVolume = .75,
        keyboardMode = POLYPHON
    }) {
        super(...arguments)
        this.defaultVoice = defaultVoice
        this.voices = voices
        this.activeWaveSplineNode = activeWaveSplineNode
        this.activeGenerator = activeGenerator
        this.activeGeneratorCategory = activeGeneratorCategory
        this.activeVoice = activeVoice
        this.keyboardKeys = keyboardKeys 
        this.keyboardDivisions = keyboardDivisions
        this.keyboardFrequency = keyboardFrequency
        this.keyboardTranspose = keyboardTranspose
        this.masterTempo = masterTempo
        this.masterVolume = masterVolume
        this.keyboardMode = keyboardMode
    }
    
    set masterVolume(value) {
        if (this._masterVolume == value) return
        this._masterVolume = value
        SignalProcessor.send(this, Configuration.MASTER_VOLUME_CHANGE)
    }

    get masterVolume() {
        return this._masterVolume
    }   


    set masterTempo(value) {
        if (this._masterTempo == value) return
        const previousTempo = this._masterTempo
        this._masterTempo = value
        if (this._voices) {
            this._voices.generators.forEach((generator)=>{
               this._updateGeneratorTempo(previousTempo, generator)
            })
        }
        if (this._defaultVoice) {
            this._defaultVoice.generators.forEach((generator)=>{
                this._updateGeneratorTempo(previousTempo, generator)
            })
        }
        SignalProcessor.send(this, Configuration.MASTER_TEMPO_CHANGE)
    }

    get masterTempo() {
        return this._masterTempo
    }   

    _updateGeneratorTempo(previousTempo, generator) {
        if (
            generator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_NOTE
            || generator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_COMMON
        ) {
            const generatorNote = noteFrequencyConversion(generator.waveSplineView.frequency, previousTempo)
            generator.waveSplineView.frequency = noteFrequencyConversion(generatorNote, this._masterTempo)
        } else if (generator.waveSplineView.timeUnit === WaveSplineView.TIME_UNIT_MEASURES) {
            const generatorMeasures = noteFrequencyConversion(generator.waveSplineView.frequency, previousTempo)
            generator.waveSplineView.frequency = noteFrequencyConversion(generatorMeasures, this._masterTempo)
        }
    }
    
    set keyboardKeys(value) {
        if (this._keyboardKeys == value) return
        this._keyboardKeys = value
        SignalProcessor.send(this, Configuration.KEYBOARD_KEYS_CHANGE)
        SignalProcessor.send(this, Configuration.KEYBOARD_CHANGE)
    }

    get keyboardKeys() {
        return this._keyboardKeys
    }   
    
    set keyboardDivisions(value) {
        if (this._keyboardDivisions == value) return
        this._keyboardDivisions = value
        SignalProcessor.send(this, Configuration.KEYBOARD_DIVISIONS_CHANGE)
        SignalProcessor.send(this, Configuration.KEYBOARD_CHANGE)

    }

    get keyboardDivisions() {
        return this._keyboardDivisions
    }   

    set keyboardFrequency(value) {
        if (this._keyboardFrequency == value) return
        this._keyboardFrequency = value
        SignalProcessor.send(this, Configuration.KEYBOARD_FREQUENCY_CHANGE)
        SignalProcessor.send(this, Configuration.KEYBOARD_CHANGE)
    }

    get keyboardFrequency() {
        return this._keyboardFrequency
    }   

    
    set keyboardTranspose(value) {
        if (this._keyboardTranspose == value) return
        this._keyboardTranspose = value
        SignalProcessor.send(this, Configuration.KEYBOARD_TRANSPOSE_CHANGE)
        SignalProcessor.send(this, Configuration.KEYBOARD_CHANGE)
    }

    get keyboardTranspose() {
        return this._keyboardTranspose
    }   


    set keyboardMode(value) {
        if (this._keyboardMode === value) return
        this._keyboardMode = value
        SignalProcessor.send(this, Configuration.KEYBOARD_MODE_CHANGE)
    }

    get keyboardMode() {
        return this._keyboardMode
    }   

    
    set activeWaveSplineNode(value) {
        if (this._activeWaveSplineNode === value) return
        this._activeWaveSplineNode = instantiate(value, WaveSplineNode, false)
        SignalProcessor.send(this, Configuration.ACTIVE_WAVESPLINE_NODE_CHANGE)
    }

    get activeWaveSplineNode() {
        return this._activeWaveSplineNode
    }

    set voices(value) {
        if (this._voices === value) return
        this._removeVoicesListeners()
        this._voices = instantiate(value, Voices)
        this._addVoicesListeners()
        SignalProcessor.send(this, Configuration.VOICES_CHANGE)
    }

    get voices() {
        return this._voices
    }

    _addVoicesListeners() {
        if (!this._voices) return
        SignalProcessor.add(this._voices, SignalProcessor.WILDCARD, this.bound(this._onVoicesChange))
   
    }

    _removeVoicesListeners() {
        if (!this._voices) return
        SignalProcessor.remove(this._voices, SignalProcessor.WILDCARD, this.bound(this._onVoicesChange))
    }

    _onVoicesChange(e, t) {
        if (
            this._activeVoice
            && !this.voices.hasVoice(this._activeVoice) 
            && this._defaultVoice !== this._activeVoice
        ) {
            this.graveyardVoice = this._activeVoice
        }
        SignalProcessor.send(this, e)
    }

    set activeGeneratorCategory(value) {
        if (this._activeGeneratorCategory === value) return
        this._activeGeneratorCategory = value
        SignalProcessor.send(this, Configuration.ACTIVE_GENERATOR_CATEGORY_CHANGE)
        this._updateActiveGenerator()
    }

    get activeGeneratorCategory() {
        return this._activeGeneratorCategory
    }
    
    set activeVoice(value) {
        if (this._activeVoice === value) return
        this._removeActiveVoiceListeners()
        this._activeVoice = instantiate(value, Voice, false)
        this._addActiveVoiceListeners()
        SignalProcessor.send(this, Configuration.ACTIVE_VOICE_CHANGE)
        this._updateActiveGenerator()
    }
    get activeVoice() {
        return this._activeVoice
    }

    _addActiveVoiceListeners() {
        if (!this._activeVoice) return
        SignalProcessor.add(this._activeVoice, SignalProcessor.WILDCARD, this.bound(this._onActiveVoiceGeneratorChange))
        
    }

    _removeActiveVoiceListeners() {
        if (!this._activeVoice) return
        SignalProcessor.remove(this._activeVoice, SignalProcessor.WILDCARD, this.bound(this._onActiveVoiceGeneratorChange))
        
    }

    _onActiveVoiceGeneratorChange(e, t) {
        if (
            e === Voice.WAVE_CHANGE ||
            e === Voice.PITCH_CHANGE ||
            e === Voice.GAIN_CHANGE
        ) {
            this._updateActiveGenerator()
        }
    }

    _updateActiveGenerator() {
        if (this._activeVoice) {
            if (this._activeGeneratorCategory === PITCH && this._activeVoice.pitch) {
                this.activeGenerator = this._activeVoice.pitch
            } else if (this._activeGeneratorCategory === GAIN && this._activeVoice.gain) {
                this.activeGenerator = this._activeVoice.gain
            } else if (this._activeGeneratorCategory === WAVE && this._activeVoice.wave) {
                this.activeGenerator = this._activeVoice.wave
            } else {
                this.activeGenerator = null
            }
        } else {
            this.activeGenerator = null
        }
    }

    set activeGenerator(value) {
        if (this._activeGenerator === value) return
        this._activeGenerator = instantiate(value, Generator, false)
        SignalProcessor.send(this, Configuration.ACTIVE_GENERATOR_CHANGE)
    }

    get activeGenerator() {
        return this._activeGenerator
    }

    set defaultVoice(value) {
        if (this._defaultVoice === value) return
        this._defaultVoice = instantiate(value, Voice, true)
        SignalProcessor.send(this, Configuration.DEFAULT_VOICE_CHANGE)
    }
    get defaultVoice() {
        return this._defaultVoice
    }


    set graveyardVoice(value) {
        if (this._graveyardVoice === value) return
        this._graveyardVoice = instantiate(value, Voice, true)
        SignalProcessor.send(this, Configuration.GRAVEYARD_VOICE_CHANGE)
    }
    get graveyardVoice() {
        return this._graveyardVoice
    }

    panic() {
        // this.masterVolume = 0
        this._voices.releaseAll()
    }

    toObject() {
        const obj = {}
        if (this._voices) obj.voices = this._voices.toObject()
        if (this._activeVoice) obj.activeVoice = this._activeVoice.toObject()
        if (this._activeGenerator) obj.activeGenerator = this._activeGenerator.toObject()
        if (this._activeWaveSplineNode) obj.activeWaveSplineNode = this._activeWaveSplineNode.toObject()
        return obj
      
    }
}
