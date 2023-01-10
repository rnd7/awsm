import degreeToRadians from "../math/trigonometry/degree-to-radians.js"
import minmax from "../math/minmax.js"
import calculateAngle from "../math/trigonometry/calculate-angle.js"
import calculateAngleDelta from "../math/trigonometry/calculate-angle-delta.js"
import { LINEAR } from "./rotary-scale/linear.js"
import rotateAroundOrigin from "../math/trigonometry/rotate-around-origin.js"
import drawTorusSegment from "../canvas/draw-torus-segment.js"
import calculateDistance from "../math/trigonometry/calculate-distance.js"
import DynamicWebComponent from "../dom/dynamic-web-component.js"

export default class Rotary extends DynamicWebComponent {

    static VALUE_CHANGE_EVENT = "value-change"
    static LOCK_RELEASE = "lock-release"
    static SET_LOCK = "set-lock"

    static style = 'elements/rotary.css'

    constructor() {
        super()
        this._value = 0
        this._rotate = -90
        this._minAngle = -135
        this._maxAngle = 135
        this._step = 0
        this._scale = LINEAR
        this._active = false
        this._scaleSize = .25
        this._scaleRadius = .9
        this._knobRadius = .6
        this._knobIndicator = .075
        this._continuous = false
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')
        this._containerEl.addEventListener('pointerdown', this.bound(this._onPointerDown))

        this._canvasEl = document.createElement('canvas')
        this._canvasEl.oncontextmenu = () => (false)
        this._context = this._canvasEl.getContext('2d')
        this._containerEl.append(this._canvasEl)

        this._init()

    }

    async _init() {
        await this.fetchStyle(Rotary.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
        this.render()
    }

    resize() {
        super.resize()
        this.render()
    }

    _onPointerDown(e) {
        e.preventDefault()
        this._containerEl.setPointerCapture(e.pointerId)
        this._active = true

        this._containerEl.removeEventListener('pointerdown', this.bound(this._onPointerDown))
        this._containerEl.addEventListener('pointermove', this.bound(this._onPointerMoveWhileDown))
        this._containerEl.addEventListener('pointerup', this.bound(this._onPointerUp))
        this._containerEl.addEventListener('pointercancel', this.bound(this._onPointerCancel))
        this.dispatchEvent(
            new CustomEvent(
                Rotary.SET_LOCK,
                {
                    bubbles: true,
                    cancelable: false,
                    composed: true
                }
            )
        )
        const rect = e.target.getBoundingClientRect()
        this._pointerRelativeX = e.clientX - rect.left - rect.width / 2
        this._pointerRelativeY = e.clientY - rect.top - rect.height / 2
        this._lastValue = null
    }

    _onPointerMoveWhileDown(e) {
        this._pointerRelativeX += e.movementX
        this._pointerRelativeY += e.movementY
        const dist = calculateDistance(this._pointerRelativeX, this._pointerRelativeY)
        if (dist < 5) {
            this._lastValue = null
            return
        }
        const angle = calculateAngle(
            0,
            0,
            this._pointerRelativeX,
            this._pointerRelativeY,
        )

        let delta = 0
        if (this._lastValue) {
            delta = calculateAngleDelta(this._lastValue, angle)
        }
        this._lastValue = angle
        let targetValue
        const angleRange = degreeToRadians(this._maxAngle - this._minAngle)

        if (this._continuous) {
            targetValue = this._position + delta / angleRange
            targetValue = (targetValue + 1) % 1
        } else {
            targetValue = this._position + delta / angleRange
            targetValue = minmax(targetValue, 0, 1)
        }
        this._changeValue(targetValue)
    }

    _onPointerUp(e) {
        this._onPointerDownEnd(e)
    }

    _onPointerCancel(e) {
        this._onPointerDownEnd(e)
    }

    _onPointerDownEnd(e) {
        this._active = false
        console.log("pointerDownEnd")
        this.dispatchEvent(
            new CustomEvent(
                Rotary.LOCK_RELEASE,
                {
                    bubbles: true,
                    cancelable: false,
                    composed: true
                }
            )
        )
        this._containerEl.addEventListener('pointerdown', this.bound(this._onPointerDown))
        this._containerEl.removeEventListener('pointermove', this.bound(this._onPointerMoveWhileDown))
        this._containerEl.removeEventListener('pointerup', this.bound(this._onPointerUp))
        this._containerEl.removeEventListener('pointercancel', this.bound(this._onPointerCancel))
    }

    _changeValue(value) {
        this.position = value
        let scaled = this.scale.normalize(this._position)
        if (scaled !== this._value) {
            this._value = scaled
            this.dispatchEvent(
                new CustomEvent(
                    Rotary.VALUE_CHANGE_EVENT,
                    {
                        bubbles: false,
                        cancelable: false,
                        composed: true
                    }
                )
            )
        }
    }

    set position(value) {
        if (this._position == value) return
        this._position = value
        this.render()
    }

    get position() {
        return this._position
    }

    set value(value) {
        this._value = value
        if (!this._active) {
            this._position = this._scale.denormalize(value)
            this.render()
        }
    }

    get value() {
        return this._value
    }

    set continuous(value) {
        this._continuous = value
    }

    get continuous() {
        return this._continuous
    }

    set step(value) {
        this._step = value
    }

    get step() {
        return this._step
    }

    set scale(value) {
        this._scale = value
        this.render()
    }

    get scale() {
        return this._scale
    }

    renderCallback() {
        if (this._context.canvas.width != this.dedicatedWidth || this._context.canvas.height != this.dedicatedHeight) {
            this._context.canvas.width = this.dedicatedWidth
            this._context.canvas.height = this.dedicatedHeight
        }

        const angleRange = this._maxAngle - this._minAngle
        const startAngle = this._minAngle + this._rotate

        let cx = this._context.canvas.width / 2
        let cy = this._context.canvas.height / 2
        let maxRadius = Math.min(this._context.canvas.height, this._context.canvas.width) / 2

        this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height)

        // bg
        this._context.beginPath()
        this._context.arc(cx, cy, maxRadius, 0, 2 * Math.PI, false)
        this._context.fillStyle = "#202020"
        this._context.fill()

        // knob bg
        this._context.beginPath()
        this._context.arc(cx, cy, maxRadius * this._knobRadius, 0, 2 * Math.PI, false)
        this._context.fillStyle = "#101010"
        this._context.fill()
        const knobIndicatorSize = maxRadius * this._knobIndicator
        const indicatorPos = rotateAroundOrigin(
            { x: maxRadius, y: maxRadius },
            { x: maxRadius + maxRadius * this._knobRadius - knobIndicatorSize * 2, y: maxRadius },
            (Math.PI * 2) - degreeToRadians(startAngle + angleRange * this._position)
        )

        // knob indicator
        this._context.beginPath()
        this._context.arc(indicatorPos.x, indicatorPos.y, maxRadius * this._knobIndicator, 0, 2 * Math.PI, false)
        this._context.fillStyle = "#c0c0c0"
        this._context.fill()

        // scale 
        this._context.fillStyle = "#e0e0e0"
        drawTorusSegment(
            this._context,
            cx, cy,
            maxRadius * this._scaleRadius, maxRadius * (1 - this._scaleSize),
            degreeToRadians(startAngle), degreeToRadians(startAngle + angleRange * this._position)
        )
        this._context.fill()
    }

    destroy() {
        clearTimeout(this._pointerDownTimeout)
        this._containerEl.removeEventListener('pointerdown', this.bound(this._onPointerDown), false)
        this._containerEl.removeEventListener('pointermove', this.bound(this._onPointerMoveWhileDown), false)
        this._containerEl.removeEventListener('pointerup', this.bound(this._onPointerUp), false)
        this._containerEl.removeEventListener('pointercancel', this.bound(this._onPointerCancel), false)
        this._canvasEl.oncontextmenu = null
        this._canvasEl.remove()
        this._canvasEl = null
        this._context = null
        this._scale = null
        this._pointerDownPosition = null
        this._containerEl.remove()
        this._containerEl = null
        super.destroy()
    }
}
