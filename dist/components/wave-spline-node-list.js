import WebComponent from "../dom/web-component.js"
import SignalProcessor from "../events/signal-processor.js"
import WaveSpline from "../model/wave-spline.js"
import Configuration from "../model/configuration.js"
import Rotary from "../elements/rotary.js"
import { EXPONENTIAL_NODE_SPLINE } from "../model/wave-spline-type.js"
import WaveSplineNodeListItem from "./wave-spline-node-list-item.js"
import WaveSplineNode from "../model/wave-spline-node.js"


export default class WaveSplineNodeList extends WebComponent {
    static style = 'components/wave-spline-node-list.css'

    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')
        this._containerEl.addEventListener("pointerdown", this.bound(this._onContainerDown), false)
        this._containerEl.addEventListener(WaveSplineNodeListItem.REMOVE_EVENT, this.bound(this._onWaveSplineNodeRemove))
        this._containerEl.addEventListener(Rotary.SET_LOCK, this.bound(this._onLock))
        this._containerEl.addEventListener(Rotary.LOCK_RELEASE, this.bound(this._onRelease))
        this._waveSpline = null
        this._configuration = null
        this._locked = false
        this._compact = false
        this._init()
    }

    async _init() {
        await this.fetchStyle(WaveSplineNodeList.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
        this.render()
    }

    _onWaveSplineNodeRemove(e) {
        if (!this._configuration || !this._configuration.activeGenerator.waveSpline) return
        this._configuration.activeGenerator.waveSpline.removeNode(e.target.waveSplineNode)
    }

    set configuration(value) {
        if (this._configuration === value) return
        this._removeConfigurationListeners()
        this._configuration = value
        this._addConfigurationListeners()
        this._updateActiveGenerator()
    }

    get configuration() {
        return this._configuration
    }

    set compact(value) {
        if (value === this._compact) return
        this._compact = value
        this.render()
    }

    get compact() {
        return this._compact
    }

    _addConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.add(this._configuration, Configuration.ACTIVE_GENERATOR_CHANGE, this.bound(this._onActiveGeneratorChange))
        SignalProcessor.add(this._configuration, Configuration.ACTIVE_WAVESPLINE_NODE_CHANGE, this.bound(this._onActiveWaveSplineNodeChange))
    }

    _removeConfigurationListeners() {
        if (!this._configuration) return
        SignalProcessor.remove(this._configuration, Configuration.ACTIVE_GENERATOR_CHANGE, this.bound(this._onActiveGeneratorChange))
        SignalProcessor.remove(this._configuration, Configuration.ACTIVE_WAVESPLINE_NODE_CHANGE, this.bound(this._onActiveWaveSplineNodeChange))
    }

    _onActiveGeneratorChange(e, t) {
        this._updateActiveGenerator()
    }

    _onActiveWaveSplineNodeChange(e, t) {
        this._updateActiveWaveSplineNode()
    }

    _updateActiveWaveSplineNode() {
        this._scrollInPlace = true
        this.render()
    }

    _updateActiveGenerator() {
        this.activeGenerator = this._configuration.activeGenerator
        this.render()
    }

    set activeGenerator(value) {
        if (this._activeGenerator === value) return
        this._removeActiveGeneratorListeners()
        this._activeGenerator = value
        this._addActiveGeneratorListeners()
        this._updateActiveGenerator()
    }

    get activeGenerator() {
        return this._activeGenerator
    }

    _addActiveGeneratorListeners() {
        if (!this._activeGenerator) return
        SignalProcessor.add(this._activeGenerator, WaveSpline.TYPE_CHANGE, this.bound(this._onWaveSplineTypeChange))
        SignalProcessor.add(this._activeGenerator, WaveSpline.NODES_CHANGE, this.bound(this._onWaveSplineNodesChange))
        SignalProcessor.add(this._activeGenerator, WaveSplineNode.X_CHANGE, this.bound(this._onWaveSplineNodesChange))
        SignalProcessor.add(this._activeGenerator, WaveSpline.PHASE_CHANGE, this.bound(this._onWaveSplinePhaseChange))
    }

    _removeActiveGeneratorListeners() {
        if (!this._activeGenerator) return
        SignalProcessor.remove(this._activeGenerator, WaveSpline.TYPE_CHANGE, this.bound(this._onWaveSplineTypeChange))
        SignalProcessor.remove(this._activeGenerator, WaveSpline.NODES_CHANGE, this.bound(this._onWaveSplineNodesChange))
        SignalProcessor.remove(this._activeGenerator, WaveSplineNode.X_CHANGE, this.bound(this._onWaveSplineNodesChange))
        SignalProcessor.remove(this._activeGenerator, WaveSpline.PHASE_CHANGE, this.bound(this._onWaveSplinePhaseChange))
    }

    _onWaveSplineTypeChange(e, t) {
        this.render()
    }

    _onWaveSplinePhaseChange(e, t) {
        this.render()
    }

    _onWaveSplineNodesChange(e, t) {
        if (this._locked) return
        this.render()
    }

    _onContainerDown(e) {
        this._configuration.activeWaveSplineNode = e.target.waveSplineNode
    }

    _addContainerListeners(el) {
        //el.addEventListener(Rotary.SET_LOCK, this.bound(this._onLock))
        //el.addEventListener(Rotary.LOCK_RELEASE, this.bound(this._onRelease))
    }

    _removeContainerListeners(el) {
        //el.removeEventListener(Rotary.SET_LOCK, this.bound(this._onLock))
        //el.removeEventListener(Rotary.LOCK_RELEASE, this.bound(this._onRelease))

    }

    renderCallback() {
        if (this._compact) {
            let list = []
            if (
                this._configuration.activeGenerator
                && this._configuration.activeWaveSplineNode
                && this._configuration.activeGenerator.waveSpline.contains(this._configuration.activeWaveSplineNode)
            ) {
                list = [{
                    waveSplineNode: this._configuration.activeWaveSplineNode,
                    exponent: this._configuration.activeGenerator.waveSpline.type === EXPONENTIAL_NODE_SPLINE,
                    active: true
                }]
            }

            this.manageContainer(
                this._containerEl,
                list,
                WaveSplineNodeListItem,
                this.bound(this._addContainerListeners),
                this.bound(this._removeContainerListeners)

            )
        } else {
            let list = []
            if (this._configuration.activeGenerator) {
                list = this._configuration.activeGenerator.waveSpline.nodes.map((node) => {
                    return {
                        waveSplineNode: node,
                        exponent: this._configuration.activeGenerator.waveSpline.type === EXPONENTIAL_NODE_SPLINE,
                        active: this._configuration.activeWaveSplineNode === node
                    }
                })
                list.sort((a, b) => {
                    return (
                        ((a.waveSplineNode.x + this._configuration.activeGenerator.waveSpline.phase) % 1)
                        > ((b.waveSplineNode.x + this._configuration.activeGenerator.waveSpline.phase) % 1)
                    ) ? 1 : -1
                })

            }


            this.manageContainer(
                this._containerEl,
                list,
                WaveSplineNodeListItem
                /*,
                this.bound(this._addContainerListeners),
                this.bound(this._removeContainerListeners)*/

            )
            if (this._scrollInPlace) {
                this._scrollInPlace = false
                for (let i = 0; i < this._containerEl.childNodes.length; i++) {
                    if (this._containerEl.childNodes[i].waveSplineNode === this._configuration.activeWaveSplineNode) {
                        this._containerEl.childNodes[i].scrollIntoView()
                        break
                    }
                }
            }
        }

    }

    _onLock(e) {
        this._locked = true
    }

    _onRelease(e) {
        this._locked = false
        this.render()
    }

    destroy() {
        this._removeConfigurationListeners()
        this._removeActiveGeneratorListeners()
        this._containerEl.removeEventListener("pointerdown", this.bound(this._onContainerDown), false)
        this._containerEl.removeEventListener(WaveSplineNodeListItem.REMOVE_EVENT, this.bound(this._onWaveSplineNodeRemove))
        this._containerEl.removeEventListener(Rotary.SET_LOCK, this.bound(this._onLock))
        this._containerEl.removeEventListener(Rotary.LOCK_RELEASE, this.bound(this._onRelease))
        this.destroyContainer(this._containerEl)
        this._containerEl.remove()
        this._containerEl = null
        this._configuration = null
        super.destroy()
    }
}