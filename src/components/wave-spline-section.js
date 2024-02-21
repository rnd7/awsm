import WebComponent from "../dom/web-component.js"
import WaveSplineCanvas from "./wave-spline-canvas.js"
import WaveSplineNodeList from "./wave-spline-node-list.js"
import Configuration from "../model/configuration.js"
import SignalProcessor from "../events/signal-processor.js"
import SectionLabel from "../elements/section-label.js"

export default class WaveSplineSection extends WebComponent {
    static style = 'components/wave-spline-section.css'

    constructor() {
        super()
        this._compact = false
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._hContainer = document.createElement('div')
        this._hContainer.classList.add('h-container')
        this._containerEl.append(this._hContainer)

        this._settingsContainerEl = document.createElement('div')
        this._settingsContainerEl.classList.add('settings-container')
        this._containerEl.append(this._settingsContainerEl)

        this._waveSplineCanvas = WaveSplineCanvas.create()
        this._hContainer.append(this._waveSplineCanvas)

        this._panelEl = document.createElement('div')
        this._panelEl.classList.add('panel')
        this._hContainer.append(this._panelEl)

        this._waveSplineLabel = SectionLabel.create()
        this._waveSplineLabel.text = "WaveSpline"
        this._panelEl.append(this._waveSplineLabel)

        this._waveSplineNodes = WaveSplineNodeList.create()
        this._panelEl.append(this._waveSplineNodes)

        this._configuration = null
        this._init()
    }

    async _init() {
        await this.fetchStyle(WaveSplineSection.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
    }

    set compact(value) {
        if (value === this._compact) return
        this._compact = value
        this._waveSplineNodes.compact = this._compact
        this.render()
    }

    get compact() {
        return this._compact
    }


    set configuration(value) {
        if (this._configuration === value) return
        this._removeConfigurationListeners()
        this._configuration = value
        this._waveSplineCanvas.configuration = this._configuration
        this._waveSplineNodes.configuration = this._configuration
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
        if (this._compact) {
            this._hContainer.classList.add("vertical")
        } else {
            this._hContainer.classList.remove("vertical")
        }
    }

    destroy() {
        this._removeConfigurationListeners()
        this._configuration = null
        this._waveSplineCanvas.destroy()
        this._waveSplineCanvas = null
        this._waveSplineLabel.destroy()
        this._waveSplineLabel = null
        this._waveSplineNodes.destroy()
        this._waveSplineNodes = null
        this._configuration = null
        super.destroy()
    }

}