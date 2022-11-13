import WebComponent from "../dom/web-component.js"
import WaveSplineCanvas from "./wave-spline-canvas.js"
import WaveSplineViewSettings from "./wave-spline-view-settings.js"
import WaveSplineNodeList from "./wave-spline-node-list.js"
import Configuration from "../model/configuration.js"
import SignalProcessor from "../events/signal-processor.js"
import WaveSplineSettings from "./wave-spline-settings.js"
import Hint from "../elements/hint.js"

export default class WaveSplineSection extends WebComponent {
    static style = 'components/wave-spline-section.css'

    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._inactive = document.createElement('div')
        this._inactive.classList.add('inactive-container')

        this._inactiveLabel = Hint.create()
        this._inactiveLabel.text = "A bunch of empty space. No wavespline to edit. Try selecting or connecting some generator."
        this._inactive.append(this._inactiveLabel)
        this._containerEl.append(this._inactive)
        
        this._active = document.createElement('div')
        this._active.classList.add('active-container', 'hidden')
        this._containerEl.append(this._active)

        this._hContainer = document.createElement('div')
        this._hContainer.classList.add('h-container')
        this._active.append(this._hContainer)

        this._settingsContainerEl = document.createElement('div')
        this._settingsContainerEl.classList.add('settings-container')
        this._active.append(this._settingsContainerEl)


        this._waveSplineCanvas = WaveSplineCanvas.create()
        this._hContainer.append(this._waveSplineCanvas)

        this._panelEl = document.createElement('div')
        this._panelEl.classList.add('panel')
        this._hContainer.append(this._panelEl)

        this._waveSplineNodes = WaveSplineNodeList.create()
        this._panelEl.append(this._waveSplineNodes)


        this._waveSplineConfig = WaveSplineSettings.create()
        this._settingsContainerEl.append(this._waveSplineConfig)


        this._waveSplineSettings = WaveSplineViewSettings.create()
        this._settingsContainerEl.append(this._waveSplineSettings)


        this._configuration = null
        this._init()
    }

    async _init() {
        await this.fetchStyle(WaveSplineSection.style)
        this.shadowRoot.append(this._containerEl)
    }

    set configuration(value) {
        if (this._configuration === value) return
        this._removeConfigurationListeners()
        this._configuration = value  
        this._waveSplineCanvas.configuration = this._configuration
        this._waveSplineNodes.configuration = this._configuration
        this._waveSplineSettings.configuration = this._configuration
        this._waveSplineConfig.configuration = this._configuration
        this._addConfigurationListeners()
        this._onActiveGeneratorChange()

    }
    get configuration() {
        return this._configuration
    }

    _addConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.add(this._configuration, Configuration.ACTIVE_GENERATOR_CHANGE, this.bound(this._onActiveGeneratorChange))
    }
    _removeConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.remove(this._configuration, Configuration.ACTIVE_GENERATOR_CHANGE, this.bound(this._onActiveGeneratorChange))
    }
    _onActiveGeneratorChange(e, t) {
        this.render()
    }

    renderCallback() {
        if (this._configuration && this._configuration.activeGenerator) {
            this._inactive.classList.add("hidden")
            this._active.classList.remove("hidden")
        } else {
            this._active.classList.add("hidden")
            this._inactive.classList.remove("hidden")
        }
    }
    
    destroy() {
        this._removeConfigurationListeners()
        this._configuration = null
        this._waveSplineCanvas.destroy()
        this._waveSplineNodes.destroy()
        this._waveSplineSettings.destroy()
        super.destroy()
    }

}