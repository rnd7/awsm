
/**
 * AWSM - AwesomeWaveSplineMachine. EcmaScript software synthesizer.
 * Copyright (C) 2022 C. Nicholas Schreiber
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */    

import VoiceSection from './voice-section.js'
import KeyboardSection from './keyboard-section.js'
import AudioCore from '../audio/audio-core.js'
import WaveSplineSection from './wave-spline-section.js'
import Configuration from "../model/configuration.js"
import WebComponent from '../dom/web-component.js'
import HeaderSection from './header-section.js'
import RandomNameService from '../string/random-name-service.js'
import ModelBase from '../model/model-base.js'
import { DEFAULT_VOICE } from '../model/default-voice.js'

export default class AWSM extends WebComponent { 
    static style = 'components/awsm.css'
    constructor() {
        super()

        console.group("AWSM - AwesomeWaveSplineMachine")
        console.log("EcmaScript software synthesizer.")
        console.log("Copyright (C) 2022 C. Nicholas Schreiber")
        console.log("This program comes with ABSOLUTELY NO WARRANTY")
        console.log("This is free software, and you are welcome to redistribute it under certain conditions")
        console.groupEnd()

        this._configuration = new Configuration({
            masterTempo: 120,
            defaultVoice: DEFAULT_VOICE
        })
        this._configuration.activeVoice = this._configuration.defaultVoice
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._headerSection = HeaderSection.create()
        this._headerSection.configuration = this._configuration
        this._containerEl.append(this._headerSection)
        
        this._waveSplineSection = WaveSplineSection.create()
        this._waveSplineSection.configuration = this._configuration
        this._containerEl.append(this._waveSplineSection)

        this._voiceSection = VoiceSection.create()
        this._voiceSection.configuration = this._configuration
        this._containerEl.append(this._voiceSection)

        this._spawnSection = KeyboardSection.create()
        this._spawnSection.configuration = this._configuration
        this._containerEl.append(this._spawnSection)

        document.querySelector('body').addEventListener('pointerdown', this.bound(this._initAudio))
        this._init()
    }

    async _init() {
        await this.fetchStyle(AWSM.style)
        this.shadowRoot.append(this._containerEl)
        await RandomNameService.load()
        ModelBase.nameGenerator = RandomNameService.getName
    }

    async _initAudio() {
        document.querySelector('body').removeEventListener('pointerdown', this.bound(this._initAudio))
        this._audioCore = new AudioCore(this._configuration)
    }

    destroy() {
        document.querySelector('body').removeEventListener('pointerdown', this.bound(this._initAudio))
        this._audioCore.destroy()
        this._headerSection.destroy()
        this._waveSplineSection.destroy()
        this._voiceSection.destroy()
        this._spawnSection.destroy()
        this._containerEl.remove()
        ModelBase.nameGenerator = null
        this._configuration = null
        super.destroy()
    }
}
            
