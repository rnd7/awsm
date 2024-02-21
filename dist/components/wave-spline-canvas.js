import SignalProcessor from "../events/signal-processor.js"
import toLocalPositon from "../dom/to-local-posittion.js"
import quantize from "../math/quantize.js"
import Configuration from "../model/configuration.js"
import waveSplineSolver from "../math/spline/wave-spline-solver.js"
import calculateDistance from "../math/trigonometry/calculate-distance.js"
import WaveSplineView from "../model/wave-spline-view.js"
import WaveSpline from "../model/wave-spline.js"
import WaveSplineNode from "../model/wave-spline-node.js"
import { PITCH, WAVE } from "../model/voice-generator-category.js"
import DynamicWebComponent from "../dom/dynamic-web-component.js"

export default class WaveSplineCanvas extends DynamicWebComponent {
    static style = 'components/wave-spline-canvas.css'

    constructor() {
        super()

        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')
        this._canvasEl = document.createElement('canvas')
        this._canvasEl.oncontextmenu = () => (false)
        this._context = this._canvasEl.getContext('2d', { alpha: false })

        this._dedicatedWidth = 0
        this._dedicatedHeight = 0

        this._graphWidth = 500
        this._graphHeight = 500

        this._oversample = 1

        this._graphOffset = 20
        this._handleRadius = 5
        this._handleStrokeRadius = 10

        this._xOffset = this._graphOffset
        this._yOffset = this._graphOffset

        this._containerEl.append(this._canvasEl)

        this._canvasEl.addEventListener('pointerdown', this.bound(this._onPointerDown))
        this._init()
    }

    async _init() {
        await this.fetchStyle(WaveSplineCanvas.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
        this.render()
    }

    resize() {
        super.resize()
        this.render()
    }

    _onPointerDown(e) {
        e.preventDefault()
        this._canvasEl.setPointerCapture(e.pointerId)
        this._canvasEl.removeEventListener('pointerdown', this.bound(this._onPointerDown))
        this._canvasEl.addEventListener('pointermove', this.bound(this._onPointerMoveWhileDown))
        this._canvasEl.addEventListener('pointerup', this.bound(this._onPointerUp))
        this._canvasEl.addEventListener('pointercancel', this.bound(this._onPointerCancel))
        this._pointerDownPosition = toLocalPositon(e)
        this._pointerRelativeX = 0
        this._pointerRelativeY = 0
        let list = this._nodeByDist(this._pointerDownPosition)
        this._pointerDownDistance = Number.POSITIVE_INFINITY
        if (list.length) {
            this._configuration.activeWaveSplineNode = list[0].node
            this._pointerDownDistance = list[0].distance
        } else {
            this._configuration.activeWaveSplineNode = null
        }
        let minScale = Math.min(this._graphHeight, this._graphWidth)
        if (
            this._pointerDownDistance > 10 / minScale
            && !this._pointerDownTimeout
        ) this._pointerDownTimeout = setTimeout(this.bound(this._onPointerLongpress), 600)
    }

    _onPointerMoveWhileDown(e) {
        this._pointerRelativeX += e.movementX
        this._pointerRelativeY += e.movementY

        if (
            this._pointerDownTimeout &&
            calculateDistance(this._pointerRelativeX, this._pointerRelativeY) > 5
        ) {
            this._pointerDownTimeout = clearTimeout(this._pointerDownTimeout)
        }

        if (this._configuration.activeWaveSplineNode) {
            this._configuration.activeWaveSplineNode.x += e.movementX / this._graphWidth
            this._configuration.activeWaveSplineNode.y -= e.movementY / this._graphHeight
        }
        this.render()
    }

    _onPointerLongpress(e) {
        if (this._pointerDownTimeout) this._pointerDownTimeout = clearTimeout(this._pointerDownTimeout)
        if (this._configuration && this._configuration.activeGenerator && this._configuration.activeGenerator.waveSplineView) {

            const node = this._configuration.activeGenerator.waveSpline.addNode({
                x: ((this._pointerDownPosition.x - this._xOffset) / this._graphWidth - this._configuration.activeGenerator.waveSpline.phase + 1) % 1,
                y: 1 - (this._pointerDownPosition.y - this._yOffset) / this._graphHeight
            })
            this._configuration.activeWaveSplineNode = node
        }
        this.render()
    }

    _onPointerUp(e) {
        if (this._pointerDownTimeout) {
            this._pointerDownTimeout = clearTimeout(this._pointerDownTimeout)
            let list = this._nodeByDist(this._pointerDownPosition)
            if (list.length) {
                this._configuration.activeWaveSplineNode = list[0].node
            } else {
                this._configuration.activeWaveSplineNode = null
            }
        }
        this._onPointerDownEnd(e)
        this.render()
    }

    _onPointerCancel(e) {
        this._onPointerDownEnd(e)
    }

    _onPointerDownEnd(e) {
        if (this._pointerDownTimeout) this._pointerDownTimeout = clearTimeout(this._pointerDownTimeout)
        this._canvasEl.addEventListener('pointerdown', this.bound(this._onPointerDown))
        this._canvasEl.removeEventListener('pointermove', this.bound(this._onPointerMoveWhileDown))
        this._canvasEl.removeEventListener('pointerup', this.bound(this._onPointerUp))
        this._canvasEl.removeEventListener('pointercancel', this.bound(this._onPointerCancel))
    }

    _nodeByDist({ x, y }) {
        if (!this._configuration || !this._configuration.activeGenerator || !this._configuration.activeGenerator.waveSpline) return []
        let result = this._configuration.activeGenerator.waveSpline.nodes.map((node) => {
            const distance = calculateDistance(
                ((x - this._graphOffset) / this._graphWidth),
                (this._graphHeight - (y - this._graphOffset)) / this._graphHeight,
                (node.x + this._configuration.activeGenerator.waveSpline.phase) % 1,
                node.y
            )
            return { node, distance }
        })
        result.sort((a, b) => {
            return (a.distance - b.distance < 0) ? -1 : 1
        })
        return result
    }

    set configuration(value) {
        if (this._configuration === value) return
        this._removeConfigurationListeners()
        this._configuration = value
        this._addConfigurationListeners()
        this._updateActiveGenerator()
        this.render()
    }

    get configuration() {
        return this._configuration
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

    _onActiveWaveSplineNodeChange(e, t) {
        this.render()
    }

    _onActiveGeneratorChange(e, t) {
        this._updateActiveGenerator()
    }

    _updateActiveGenerator() {
        this.activeGenerator = this._configuration.activeGenerator
    }

    set activeGenerator(value) {
        if (this._activeGenerator === value) return
        this._removeActiveGeneratorListeners()
        this._activeGenerator = value
        this._addActiveGeneratorListeners()
        this.render()
    }


    _addActiveGeneratorListeners() {
        if (!this._activeGenerator) return
        SignalProcessor.add(this._activeGenerator, WaveSplineView.QUANTIZE_X_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.add(this._activeGenerator, WaveSplineView.QUANTIZE_X_THRESHOLD_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.add(this._activeGenerator, WaveSplineView.QUANTIZE_Y_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.add(this._activeGenerator, WaveSpline.NODES_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.add(this._activeGenerator, WaveSpline.E_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.add(this._activeGenerator, WaveSpline.TYPE_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.add(this._activeGenerator, WaveSpline.PHASE_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.add(this._activeGenerator, WaveSplineNode.X_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.add(this._activeGenerator, WaveSplineNode.Y_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.add(this._activeGenerator, WaveSplineNode.E_CHANGE, this.bound(this._onWaveSplineChange))
    }

    _removeActiveGeneratorListeners() {
        if (!this._activeGenerator) return
        SignalProcessor.remove(this._activeGenerator, WaveSplineView.QUANTIZE_X_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.remove(this._activeGenerator, WaveSplineView.QUANTIZE_X_THRESHOLD_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.remove(this._activeGenerator, WaveSplineView.QUANTIZE_Y_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.remove(this._activeGenerator, WaveSpline.NODES_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.remove(this._activeGenerator, WaveSpline.E_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.remove(this._activeGenerator, WaveSpline.TYPE_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.remove(this._activeGenerator, WaveSpline.PHASE_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.remove(this._activeGenerator, WaveSplineNode.X_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.remove(this._activeGenerator, WaveSplineNode.Y_CHANGE, this.bound(this._onWaveSplineChange))
        SignalProcessor.remove(this._activeGenerator, WaveSplineNode.E_CHANGE, this.bound(this._onWaveSplineChange))
    }


    _onWaveSplineChange(e, t) {
        this.render()
    }

    renderCallback() {

        if (this._context.canvas.width != this.dedicatedWidth || this._context.canvas.height != this.dedicatedHeight) {
            this._context.canvas.width = this.dedicatedWidth
            this._context.canvas.height = this.dedicatedHeight
            this._graphWidth = this.dedicatedWidth - this._graphOffset * 2
            this._graphHeight = this.dedicatedHeight - this._graphOffset * 2
        }

        this._context.fillStyle = "#181818"
        this._context.fillRect(0, 0, this._context.canvas.width, this._context.canvas.height)
        this._context.fillStyle = "#101010"
        this._context.fillRect(this._xOffset, this._yOffset, this._graphWidth, this._graphHeight)

        if (
            this._configuration.activeGeneratorCategory === WAVE
            || this._configuration.activeGeneratorCategory === PITCH
        ) this._renderZero()

        if (this._configuration && this._configuration.activeGenerator) {
            this._renderPhase()
            this._renderRawWaveSpline()
            this._renderWaveSpline()
            this._configuration.activeGenerator.waveSpline.nodes.forEach((node) => this._renderNode(node))
        }
    }

    _renderNode(node) {
        if (!this._configuration.activeGenerator) return
        const x = ((node.x + this._configuration.activeGenerator.waveSpline.phase) % 1) * this._graphWidth + this._xOffset
        let y = node.y * this._graphHeight
        y = this._graphHeight - y
        y += this._yOffset
        this._context.beginPath()
        this._context.arc(x, y, this._handleRadius, 0, 2 * Math.PI, false)
        this._context.fillStyle = (this._configuration.activeWaveSplineNode === node) ? "#E0E0E0" : "#505050"
        this._context.fill()
        this._context.beginPath()
        this._context.strokeStyle = (this._configuration.activeWaveSplineNode === node) ? "#E0E0E0" : "#505050"
        this._context.arc(x, y, this._handleStrokeRadius, 0, 2 * Math.PI, false)
        this._context.stroke()
    }

    _renderZero() {
        const x1 = this._xOffset
        const x2 = this._xOffset + this._graphWidth
        const y = this._yOffset + this._graphHeight * .5

        this._context.strokeStyle = "#303030"
        this._context.beginPath()
        this._context.moveTo(x1, y)
        this._context.lineTo(x2, y)
        this._context.stroke()
    }

    _renderPhase() {
        if (!this._configuration.activeGenerator) return
        if (this._configuration.activeGenerator.waveSpline.phase == 0) return
        const x = this._xOffset + this._graphWidth * this._configuration.activeGenerator.waveSpline.phase
        const y1 = this._yOffset
        const y2 = this._yOffset + this._graphHeight

        this._context.strokeStyle = "#303030"
        this._context.beginPath()
        this._context.moveTo(x, y1)
        this._context.lineTo(x, y2)
        this._context.stroke()
    }


    _renderRawWaveSpline() {
        if (!this._configuration.activeGenerator) return
        if (
            this._configuration.activeGenerator.waveSplineView.quantizeX == 0
            && this._configuration.activeGenerator.waveSplineView.quantizeY == 0
        ) return
        let lastX = 0
        let lastY = 0

        for (let i = 0; i < this._graphWidth * this._oversample; i++) {
            let x = (i / this._oversample) + this._xOffset
            let y = this._graphHeight - (
                waveSplineSolver(
                    this._configuration.activeGenerator.waveSpline,
                    i / (this._graphWidth * this._oversample),
                    this._configuration.activeGenerator.waveSpline.phase
                ) * this._graphHeight) + this._yOffset
            if (i > 0) {
                this._context.strokeStyle = "#505050"
                this._context.beginPath()
                this._context.moveTo(lastX, lastY)
                this._context.lineTo(x, y)
                this._context.stroke()
            }
            lastX = x
            lastY = y
        }
    }

    _renderWaveSpline() {
        if (!this._configuration.activeGenerator) return
        let lastX = 0
        let lastY = 0

        for (let i = 0; i < this._graphWidth * this._oversample; i++) {
            let x = (i / this._oversample) + this._xOffset
            let y = this._graphHeight
                - (
                    quantize(
                        waveSplineSolver(
                            this._configuration.activeGenerator.waveSpline,
                            quantize(
                                i / (this._graphWidth * this._oversample),
                                this._configuration.activeGenerator.waveSplineView.quantizeX,
                                this._configuration.activeGenerator.waveSplineView.quantizeXThreshold
                            ),
                            this._configuration.activeGenerator.waveSpline.phase
                        ),
                        this._configuration.activeGenerator.waveSplineView.quantizeY
                    ) * this._graphHeight
                )
                + this._yOffset
            if (i > 0) {
                this._context.strokeStyle = "#E0E0E0"
                this._context.beginPath()
                this._context.moveTo(lastX, lastY)
                this._context.lineTo(x, y)
                this._context.stroke()
            }
            lastX = x
            lastY = y
        }
    }

    destroy() {
        this._removeActiveGeneratorListeners()
        this._removeConfigurationListeners()
        this._pointerDownTimeout = clearTimeout(this._pointerDownTimeout)
        this._canvasEl.removeEventListener('pointerdown', this.bound(this._onPointerDown))
        this._canvasEl.removeEventListener('pointermove', this.bound(this._onPointerMoveWhileDown))
        this._canvasEl.removeEventListener('pointerup', this.bound(this._onPointerUp))
        this._canvasEl.removeEventListener('pointercancel', this.bound(this._onPointerCancel))
        this._canvasEl.remove()
        this._canvasEl = null
        this._configuration = null
        this._context = null

        this._containerEl.remove()
        this._containerEl = null
        super.destroy()
    }
}

