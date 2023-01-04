import WebComponent from "../dom/web-component.js"
import RotaryCombo from "../elements/rotary-combo.js"
import SignalProcessor from "../events/signal-processor.js"
import WaveSplineNode from "../model/wave-spline-node.js"
import Button from "../elements/button.js"
import Label from "../elements/label.js"
import ModelBase from "../model/model-base.js"
import { UNIT_VALUE } from "../elements/rotary-combo-driver/unit-value.js"
import { AMPLITUDE } from "../elements/rotary-combo-driver/amplitude.js"
import { WAVE_SPLINE_EXPONENT } from "../elements/rotary-combo-driver/wave-spline-exponent.js"
import { POW_4 } from "../elements/rotary-scale/pow-4.js"


export default class WaveSplineNodeListItem extends WebComponent {
    static REMOVE_EVENT = "remove"
    static LOCK_EVENT = "lock"
    static RELEASE_EVENT = "release"
    static style = 'components/wave-spline-node-list-item.css'

    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._nameLabel = Label.create()
        this._nameLabel.text = ""
        this._containerEl.append(this._nameLabel)

        this._hContainerEl = document.createElement('div')
        this._hContainerEl.classList.add('h-container')
        this._containerEl.append(this._hContainerEl)

        this._xRotaryCombo = RotaryCombo.create()
        this._xRotaryCombo.driver = UNIT_VALUE
        this._xRotaryCombo.label = "Time"
        this._xRotaryCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onXRotaryComboChange))
        this._hContainerEl.append(this._xRotaryCombo)

        this._yRotaryCombo = RotaryCombo.create()
        this._yRotaryCombo.driver = AMPLITUDE
        this._yRotaryCombo.label = "Value"
        this._yRotaryCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onYRotaryComboChange))
        this._hContainerEl.append(this._yRotaryCombo)

        this._eRotaryCombo = RotaryCombo.create()
        this._eRotaryCombo.driver = WAVE_SPLINE_EXPONENT
        this._eRotaryCombo.scale = POW_4
        this._eRotaryCombo.label = "Exponent"
        this._eRotaryCombo.addEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onERotaryComboChange))
        this._hContainerEl.append(this._eRotaryCombo)

        this._removeButton = Button.create()
        this._removeButton.label = "Remove"
        this._removeButton.addEventListener(Button.TRIGGER_EVENT, this.bound(this._onRemoveButttonTrigger))
        this._hContainerEl.append(this._removeButton)

        this._waveSplineNode = null
        this._active = null

        this._init()
    }

    async _init() {
        await this.fetchStyle(WaveSplineNodeListItem.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
        this.render()
    }


    _onXRotaryComboChange(e) {
        if (this._waveSplineNode) {
            this._waveSplineNode.x = this._xRotaryCombo.value
        }
    }
    _onYRotaryComboChange(e) {
        if (this._waveSplineNode) {
            this._waveSplineNode.y = this._yRotaryCombo.value
        }
    }
    _onERotaryComboChange(e) {
        if (this._waveSplineNode) {
            this._waveSplineNode.e = this._eRotaryCombo.value
        }
    }
    _onRemoveButttonTrigger(e) {
        this.dispatchEvent(
            new CustomEvent(WaveSplineNodeListItem.REMOVE_EVENT, {
                bubbles: true,
                cancelable: false,
                composed: true
            })
        )
    }
    set active(value) {
        if (this._active === value) return
        this._active = value
        this.render()
    }
    get active() {
        return this._active
    }

    set exponent(value) {
        if (this._exponent === value) return
        this._exponent = value
        this.render()
    }
    get exponent() {
        return this._exponent
    }

    set waveSplineNode(value) {
        if (this._waveSplineNode === value) return
        this._removeWaveSplineNodeListeners()
        this._waveSplineNode = value
        this._addWaveSplineNodeListeners()
        this._updateAll()
    }
    get waveSplineNode() {
        return this._waveSplineNode
    }
    _addWaveSplineNodeListeners() {
        if (!this._waveSplineNode) return
        SignalProcessor.add(this._waveSplineNode, ModelBase.NAME_CHANGE, this.bound(this._onWaveSplineNodeNameChange))
        SignalProcessor.add(this._waveSplineNode, WaveSplineNode.E_CHANGE, this.bound(this._onWaveSplineNodeEChange))
        SignalProcessor.add(this._waveSplineNode, WaveSplineNode.X_CHANGE, this.bound(this._onWaveSplineNodeXChange))
        SignalProcessor.add(this._waveSplineNode, WaveSplineNode.Y_CHANGE, this.bound(this._onWaveSplineNodeYChange))
    }
    _removeWaveSplineNodeListeners() {
        if (!this._waveSplineNode) return
        SignalProcessor.remove(this._waveSplineNode, ModelBase.NAME_CHANGE, this.bound(this._onWaveSplineNodeNameChange))
        SignalProcessor.remove(this._waveSplineNode, WaveSplineNode.E_CHANGE, this.bound(this._onWaveSplineNodeEChange))
        SignalProcessor.remove(this._waveSplineNode, WaveSplineNode.X_CHANGE, this.bound(this._onWaveSplineNodeXChange))
        SignalProcessor.remove(this._waveSplineNode, WaveSplineNode.Y_CHANGE, this.bound(this._onWaveSplineNodeYChange))
    }
    _onWaveSplineNodeNameChange() {
        this._nameLabel.text = this._waveSplineNode.name
    }

    _onWaveSplineNodeEChange(e, t) {
        this._eRotaryCombo.value = this._waveSplineNode.e
    }

    _onWaveSplineNodeXChange(e, t) {
        this._xRotaryCombo.value = this._waveSplineNode.x
    }

    _onWaveSplineNodeYChange(e, t) {
        this._yRotaryCombo.value = this._waveSplineNode.y
    }

    _updateAll() {
        this._onWaveSplineNodeEChange()
        this._onWaveSplineNodeXChange()
        this._onWaveSplineNodeYChange()
        this._onWaveSplineNodeNameChange()
    }

    renderCallback() {
        if (this._active) this._containerEl.classList.add("active")
        else this._containerEl.classList.remove("active")
        if (this._exponent) this._eRotaryCombo.classList.remove("hidden")
        else this._eRotaryCombo.classList.add("hidden")
    }

    destroy() {
        this._removeWaveSplineNodeListeners()
        this._waveSplineNode = null
        this._active = null
        this._nameLabel.destroy()
        this._xRotaryCombo.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onXRotaryComboChange))
        this._xRotaryCombo.destroy()
        this._yRotaryCombo.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onYRotaryComboChange))
        this._yRotaryCombo.destroy()
        this._eRotaryCombo.removeEventListener(RotaryCombo.VALUE_CHANGE_EVENT, this.bound(this._onERotaryComboChange))
        this._eRotaryCombo.destroy()
        this._removeButton.removeEventListener(Button.TRIGGER_EVENT, this.bound(this._onRemoveButttonTrigger))
        this._removeButton.destroy()
        this._containerEl.remove()
        super.destroy()

    }
}
