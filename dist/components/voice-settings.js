import RotaryCombo from "../elements/rotary-combo.js"
import WebComponent from "../dom/web-component.js"
import SignalProcessor from "../events/signal-processor.js"
import Configuration from "../model/configuration.js"
import Voice from "../model/voice.js"
import WaveSplineView from "../model/wave-spline-view.js"
import noteFrequencyConversion from "../music/note-frequency-conversion.js"
import { ENVELOPE } from "../elements/rotary-combo-driver/envelope.js"
import VoiceWaveGenerator from "./voice-wave-generator.js"
import VoicePitchGenerator from "./voice-pitch-generator.js"
import VoiceGainGenerator from "./voice-gain-generator.js"
import { SUSTAIN } from "../elements/rotary-combo-driver/sustain.js"
import { GAIN, PITCH, WAVE } from "../model/voice-generator-category.js"
import Button from "../elements/button.js"
import SectionLabel from "../elements/section-label.js"

export default class VoiceSettings extends WebComponent {
    static style = 'components/voice-settings.css'

    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._voiceLabel = SectionLabel.create()
        this._voiceLabel.text = "Voice"
        this._containerEl.append(this._voiceLabel)

        this._contentContainerEl = document.createElement('div')
        this._contentContainerEl.classList.add('content-container')
        this._containerEl.append(this._contentContainerEl)

        this._waveGeneratorComp = VoiceWaveGenerator.create()
        this._waveGeneratorComp.label = "Wave"
        this._contentContainerEl.append(this._waveGeneratorComp)

        this._pitchGeneratorComp = VoicePitchGenerator.create()
        this._pitchGeneratorComp.label = "Pitch"
        this._pitchGeneratorComp.removable = true
        this._contentContainerEl.append(this._pitchGeneratorComp)

        this._gainGeneratorComp = VoiceGainGenerator.create()
        this._gainGeneratorComp.label = "Gain"
        this._gainGeneratorComp.removable = true
        this._contentContainerEl.append(this._gainGeneratorComp)

        this._voiceSetttingsEl = document.createElement('div')
        this._voiceSetttingsEl.classList.add('voice-settings')
        this._contentContainerEl.append(this._voiceSetttingsEl)

        this._attackCombo = RotaryCombo.create()
        this._attackCombo.label = "Attack"
        this._attackCombo.driver = ENVELOPE
        this._attackCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onAttackComboChange))
        this._voiceSetttingsEl.append(this._attackCombo)

        this._sustainCombo = RotaryCombo.create()
        this._sustainCombo.label = "Sustain"
        this._sustainCombo.driver = SUSTAIN
        this._sustainCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onSustainComboChange))
        this._voiceSetttingsEl.append(this._sustainCombo)

        this._releaseCombo = RotaryCombo.create()
        this._releaseCombo.label = "Release"
        this._releaseCombo.driver = ENVELOPE
        this._releaseCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onReleaseComboChange))
        this._voiceSetttingsEl.append(this._releaseCombo)

        this._volumeCombo = RotaryCombo.create()
        this._volumeCombo.label = "Volume"
        this._volumeCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onVolumeComboChange))
        this._voiceSetttingsEl.append(this._volumeCombo)

        this._voiceLauncherEl = document.createElement('div')
        this._voiceLauncherEl.classList.add('voice-launcher')
        this._contentContainerEl.append(this._voiceLauncherEl)

        this._spawnButton = Button.create()
        this._spawnButton.label = "Spawn"
        this._spawnButton.addEventListener(Button.TRIGGER_EVENT, this.bound(this._onSpawnButtonTrigger))
        this._voiceLauncherEl.append(this._spawnButton)

        this._contentContainerEl.addEventListener(VoiceGainGenerator.SELECT_EVENT, this.bound(this._onGeneratorSelected))
        this._contentContainerEl.addEventListener(VoiceGainGenerator.CREATE_EVENT, this.bound(this._onGeneratorCreate))
        this._contentContainerEl.addEventListener(VoiceGainGenerator.REMOVE_EVENT, this.bound(this._onGeneratorRemove))

        this._init()
    }

    async _init() {
        await this.fetchStyle(VoiceSettings.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
    }

    set configuration(value) {
        if (this._configuration === value) return
        this._removeConfigurationListeners()
        this._configuration = value
        this._addConfigurationListeners()
        this._onActiveVoiceChange()
        this._updateMasterTempo()
        this.render()
    }
    get configuration() {
        return this._configuration
    }

    _addConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.add(this._configuration, Configuration.ACTIVE_GENERATOR_CHANGE, this.bound(this._onActiveGeneratorChange))
        SignalProcessor.add(this._configuration, Configuration.ACTIVE_GENERATOR_CATEGORY_CHANGE, this.bound(this._onActiveGeneratorCategoryChange))
        SignalProcessor.add(this._configuration, Configuration.ACTIVE_VOICE_CHANGE, this.bound(this._onActiveVoiceChange))
        SignalProcessor.add(this._configuration, Configuration.MASTER_TEMPO_CHANGE, this.bound(this._onMasterTempoChange))

    }
    _removeConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.remove(this._configuration, Configuration.ACTIVE_GENERATOR_CHANGE, this.bound(this._onActiveGeneratorChange))
        SignalProcessor.remove(this._configuration, Configuration.ACTIVE_GENERATOR_CATEGORY_CHANGE, this.bound(this._onActiveGeneratorCategoryChange))
        SignalProcessor.remove(this._configuration, Configuration.ACTIVE_VOICE_CHANGE, this.bound(this._onActiveVoiceChange))
        SignalProcessor.remove(this._configuration, Configuration.MASTER_TEMPO_CHANGE, this.bound(this._onMasterTempoChange))
    }

    _onMasterTempoChange(e, t) {
        this._updateMasterTempo()
    }

    _onActiveGeneratorChange(e, t) {
        this.render()
    }

    _onActiveGeneratorCategoryChange(e, t) {
        this.render()
    }

    _onActiveVoiceChange(e, t) {
        this.activeVoice = this._configuration.activeVoice

    }

    _updateMasterTempo() {
        this._waveGeneratorComp.masterTempo = this._configuration.masterTempo
        this._pitchGeneratorComp.masterTempo = this._configuration.masterTempo
        this._gainGeneratorComp.masterTempo = this._configuration.masterTempo
    }

    set activeVoice(value) {
        if (this._activeVoice === value) return
        this._removeVoiceListeners()
        this._activeVoice = value
        this._addVoiceListeners()
        this._updateVoiceGenerators()
        this._updateVolume()
        this._updateAttack()
        this._updateSustain()
        this._updateRelease()
    }

    get activeVoice() {
        return this._activeVoice
    }

    _addVoiceListeners() {
        if (!this._activeVoice) return
        SignalProcessor.add(this._activeVoice, Voice.GAIN_CHANGE, this.bound(this._onVoiceGainGeneratorChange))
        SignalProcessor.add(this._activeVoice, Voice.PITCH_CHANGE, this.bound(this._onVoicePitchGeneratorChange))
        SignalProcessor.add(this._activeVoice, Voice.WAVE_CHANGE, this.bound(this._onVoiceWaveGeneratorChange))
        SignalProcessor.add(this._activeVoice, Voice.VOLUME_CHANGE, this.bound(this._onVolumeChange))
        SignalProcessor.add(this._activeVoice, Voice.ATTACK_CHANGE, this.bound(this._onAttackChange))
        SignalProcessor.add(this._activeVoice, Voice.SUSTAIN_CHANGE, this.bound(this._onSustainChange))
        SignalProcessor.add(this._activeVoice, Voice.RELEASE_CHANGE, this.bound(this._onReleaseChange))
    }

    _removeVoiceListeners() {
        if (!this._activeVoice) return
        SignalProcessor.remove(this._activeVoice, Voice.GAIN_CHANGE, this.bound(this._onVoiceGainGeneratorChange))
        SignalProcessor.remove(this._activeVoice, Voice.PITCH_CHANGE, this.bound(this._onVoicePitchGeneratorChange))
        SignalProcessor.remove(this._activeVoice, Voice.WAVE_CHANGE, this.bound(this._onVoiceWaveGeneratorChange))
        SignalProcessor.remove(this._activeVoice, Voice.VOLUME_CHANGE, this.bound(this._onVolumeChange))
        SignalProcessor.remove(this._activeVoice, Voice.ATTACK_CHANGE, this.bound(this._onAttackChange))
        SignalProcessor.remove(this._activeVoice, Voice.SUSTAIN_CHANGE, this.bound(this._onSustainChange))
        SignalProcessor.remove(this._activeVoice, Voice.RELEASE_CHANGE, this.bound(this._onReleaseChange))
    }

    _onVoiceGainGeneratorChange() {
        this._updateVoiceGenerators()
    }
    _onVoicePitchGeneratorChange() {
        this._updateVoiceGenerators()
    }
    _onVoiceWaveGeneratorChange() {
        this._updateVoiceGenerators()
    }
    _onVolumeChange() {
        this._updateVolume()
    }
    _onAttackChange() {
        this._updateAttack()
    }
    _onSustainChange() {
        this._updateSustain()
    }
    _onReleaseChange() {
        this._updateRelease()
    }

    _onVoiceVolumeChange() {
        this._updateVolume()
    }

    _updateVoiceGenerators() {
        this._waveGeneratorComp.generator = this._activeVoice.wave
        this._pitchGeneratorComp.voice = this._activeVoice
        this._gainGeneratorComp.generator = this._activeVoice.gain
    }

    _updateVolume() {
        this._volumeCombo.value = this._activeVoice.volume
    }


    _onGeneratorSelected(e) {
        if (e.target === this._waveGeneratorComp) this._configuration.activeGeneratorCategory = WAVE
        else if (e.target === this._gainGeneratorComp) this._configuration.activeGeneratorCategory = GAIN
        else if (e.target === this._pitchGeneratorComp) this._configuration.activeGeneratorCategory = PITCH
    }

    _onGeneratorRemove(e) {
        if (e.target === this._pitchGeneratorComp) {
            this._configuration.activeVoice.pitch = null
        } else if (e.target === this._gainGeneratorComp) {
            this._configuration.activeVoice.gain = null
        }
    }

    _onAttackComboChange() {
        this._activeVoice.attack = this._attackCombo.value
    }

    _updateAttack() {
        this._attackCombo.value = this._activeVoice.attack
    }

    _onSustainComboChange() {
        this._activeVoice.sustain = this._sustainCombo.value
    }

    _updateSustain() {
        this._sustainCombo.value = this._activeVoice.sustain
    }

    _onReleaseComboChange() {
        this._activeVoice.release = this._releaseCombo.value
    }

    _updateRelease() {
        this._releaseCombo.value = this._activeVoice.release

    }

    _onVolumeComboChange(e) {
        this._activeVoice.volume = this._volumeCombo.value
    }

    _updateVolume() {
        this._volumeCombo.value = this._activeVoice.volume
    }

    _onSpawnButtonTrigger(e) {
        const voice = this._configuration.voices.addVoice(this._activeVoice.toObject())
        this._configuration.activeVoice = voice
    }


    _onGeneratorCreate(e) {
        if (e.target === this._waveGeneratorComp) {
            if (this._activeVoice.wave) {
                this._activeVoice.wave.active = true
            } else {
                this._activeVoice.wave = {
                    waveSpline: {
                        nodes: [
                            {
                                x: .25, y: 0, e: 1,
                            },
                            {
                                x: .75, y: 1, e: 1
                            }
                        ],
                        e: 2.3025
                    },
                    waveSplineView: {
                        frequency: 440,
                        quantizeX: 0,
                        quantizeY: 0,
                    }
                }
                this._configuration.activeGenerator = this._activeVoice.wave
            }

        } else if (e.target === this._pitchGeneratorComp) {
            if (this._activeVoice.pitch) {
                this._activeVoice.pitch.active = true
            } else {
                this._activeVoice.pitch = {
                    waveSpline: {
                        nodes: [
                            {
                                x: 0, y: .5, e: 1,
                            }
                        ]
                    },
                    waveSplineView: {
                        timeUnit: WaveSplineView.TIME_UNIT_MEASURES,
                        frequency: noteFrequencyConversion(1, this._configuration.masterTempo),
                        quantizeX: 16,
                        quantizeY: 24,
                    }
                }
                this._configuration.activeGenerator = this._activeVoice.pitch
            }
        } else if (e.target === this._gainGeneratorComp) {
            if (this._activeVoice.gain) {
                this._activeVoice.gain.active = true
            } else {
                this._activeVoice.gain = {
                    waveSpline: {
                        nodes: [
                            {
                                x: 0, y: .5, e: 1,
                            },
                        ],
                        e: 1.6180
                    },
                    waveSplineView: {
                        timeUnit: WaveSplineView.TIME_UNIT_COMMON,
                        frequency: noteFrequencyConversion(1 / 16, this._configuration.masterTempo),
                        quantizeX: 0,
                        quantizeY: 0,
                    }
                }
                this._configuration.activeGenerator = this._activeVoice.gain
            }
        }

    }

    renderCallback() {
        if (this._configuration && this._configuration.activeVoice) {
            this._waveGeneratorComp.active = this._configuration.activeGeneratorCategory === WAVE
            this._gainGeneratorComp.active = this._configuration.activeGeneratorCategory === GAIN
            this._pitchGeneratorComp.active = this._configuration.activeGeneratorCategory === PITCH
            this._containerEl.classList.add('visible')
        } else {
            this._containerEl.classList.remove('visible')
        }

    }

    destroy() {
        this._removeVoiceListeners()
        this._removeConfigurationListeners()

        this._contentContainerEl.removeEventListener(VoiceGainGenerator.SELECT_EVENT, this.bound(this._onGeneratorSelected))
        this._contentContainerEl.removeEventListener(VoiceGainGenerator.CREATE_EVENT, this.bound(this._onGeneratorCreate))
        this._contentContainerEl.removeEventListener(VoiceGainGenerator.REMOVE_EVENT, this.bound(this._onGeneratorRemove))

        this._waveGeneratorComp.destroy()
        this._waveGeneratorComp = null
        this._pitchGeneratorComp.destroy()
        this._pitchGeneratorComp = null
        this._gainGeneratorComp.destroy()
        this._gainGeneratorComp = null
        this._attackCombo.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onAttackComboChange))
        this._attackCombo.destroy()
        this._attackCombo = null
        this._sustainCombo.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onSustainComboChange))
        this._sustainCombo.destroy()
        this._sustainCombo = null
        this._releaseCombo.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onReleaseComboChange))
        this._releaseCombo.destroy()
        this._releaseCombo = null
        this._volumeCombo.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onVolumeComboChange))
        this._volumeCombo.destroy()
        this._volumeCombo = null
        this._spawnButton.removeEventListener(Button.TRIGGER_EVENT, this.bound(this._onSpawnButtonTrigger))
        this._spawnButton.destroy()
        this._spawnButton = null

        this._configuration = null
        this._activeVoice = null

        super.destroy()
    }
}