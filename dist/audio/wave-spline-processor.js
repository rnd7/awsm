/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/math/numerical/interpolate-linear.js
function interpolateLinear(a, b, q) {
    return a * (1-q) + b * q
}

;// CONCATENATED MODULE: ./src/math/quantize.js
function quantize(value, quantize=0, threshold=0) {
    if (!quantize) return value
    let t = threshold * .5 + .5
    return ((t + value * quantize)|0) / quantize
    
}
;// CONCATENATED MODULE: ./src/model/wave-spline-type.js
const EXPONENTIAL_SPLINE = "exponential-spline"
const STEP = "step"
const EXPONENTIAL_NODE_SPLINE = "exponential-node-spline"
;// CONCATENATED MODULE: ./src/math/wrap-value.js
function wrapValue(a, n = 1) { 
    return ( a % n + n ) % n 
}
;// CONCATENATED MODULE: ./src/math/numerical/interpolate-exponetial.js


function interpolateExponential(a, b, e, x) {
    if (e == 1) return interpolateLinear(a.y, b.y, x) // is linear
    if (x < .5) return interpolateLinear(a.y, b.y, Math.pow((x * 2), e) / 2)
    return interpolateLinear(a.y, b.y, 1 - Math.pow(((1-x) * 2), e) / 2)
}
;// CONCATENATED MODULE: ./src/math/spline/exponential-spline-solver.js



function exponentialSplineSolver(nodes, x, e = null) {
    const len = nodes.length
    if (!len) return 0
    if (len == 1) return nodes[0].y
    const wrappedTime = wrapValue(x)
    let left
    let right
    for (let i=0; i<len; i++) {
        let node = nodes[i]
        if (node.x > wrappedTime) {
            right = node
            left = nodes[(i-1+len)%len]
            break
        }
    }
    if (!right) {
        right = nodes[0]
        left = nodes[len-1]
    }
    if (left.x == right.x) return (left.y + right.y) / 2
    if (e === null) e = left.e
    const interval = wrapValue(right.x - left.x)
    const dist = wrapValue(wrappedTime - left.x)
    const q = dist / interval
    return interpolateExponential(left, right, e, q)
}
;// CONCATENATED MODULE: ./src/math/spline/step-spline-solver.js
function stepSplineSolver(nodes, x) {
    const len = nodes.length
    if (!len) return 0
    if (len == 1) return nodes[0].y
    const wrappedTime = x % 1
    for (let i=0; i<len; i++) {
        let node = nodes[i]
        if (node.x > wrappedTime) {
            return nodes[(i-1+len)%len].y
        }
    }
    return nodes[len-1].y
}
;// CONCATENATED MODULE: ./src/math/spline/wave-spline-solver.js




function waveSplineSolver(waveSpline, x, phase = 0) {
    x = wrapValue(x - phase)
    if (waveSpline.type === EXPONENTIAL_SPLINE) {
        return exponentialSplineSolver(waveSpline.nodes, x, waveSpline.e)
    } else if (waveSpline.type === EXPONENTIAL_NODE_SPLINE) {
        return exponentialSplineSolver(waveSpline.nodes, x)
    } else if (waveSpline.type === STEP) {
        return stepSplineSolver(waveSpline.nodes, x)
    }
    return 0
}
;// CONCATENATED MODULE: ./src/audio/wave-spline-processor-message.js
const WAVE_SPLINE_DATA = "wave-spline-view-data"
const DESTROY = "destroy"
;// CONCATENATED MODULE: ./src/audio/wave-spline-processor.js







class WaveSplineProcessor extends AudioWorkletProcessor {

    static get parameterDescriptors() {
        return [{
            name: 'gain',
            defaultValue: 1.0,
            minValue: 0,
            maxValue: 1,
            automationRate: "a-rate",
        },{
            name: 'frequency',
            defaultValue: 440,
            minValue: 0,
            maxValue: 0.5 * sampleRate,
            automationRate: "k-rate",
        }, {
            name: 'pitch',
            defaultValue: 0,
            minValue: -1,
            maxValue: 1,
            automationRate: "a-rate",
        }, {
            name: 'pitchScale',
            defaultValue: 1,
            minValue: -4,
            maxValue: 4,
            automationRate: "k-rate",
        }, {
            name: 'quantizeValue',
            defaultValue: 0,
            minValue: 0,
            maxValue: 0xFFFFFF+1,
            automationRate: "k-rate",
        }, {
            name: 'quantizeTime',
            defaultValue: 0,
            minValue: 0,
            maxValue: 0xFFFFFF+1,
            automationRate: "k-rate",
        }, {
            name: 'quantizeTimeThreshold',
            defaultValue: -1,
            minValue: -1,
            maxValue: 1,
            automationRate: "k-rate",
        }]
    }
    constructor(...args) {
        super(...args)

        this._splines = []
        this._time = 0
        this._nodes = null
        this._scale = 2
        this._offset = -1
        this._timeDelta = 0
        this._active = true
        this._transitionTime = 0.00117

        this._startTime = currentTime

        this._previousFrequency = null

        this.port.onmessage = (message) => {
            if (message.data.type === WAVE_SPLINE_DATA) {
                this._onWaveSplineData(message.data.waveSpline)
            } else if (message.data.type === DESTROY) {
                this._nodes = null
                this._splines = null
                this._active = false
                this.port.close()
            }
        }
    }

    _onWaveSplineData(waveSpline) {
        let time = currentTime
        //const startOffset = 256/sampleRate
        if (this._splines.length == 0) {
            this._splines.push({
                ...waveSpline,
                time: time
            })
        } else if (this._splines.length == 1) {
            time = Math.max(time, this._splines[0].time)
            this._splines.push({
                ...waveSpline,
                time: time + this._transitionTime
            })
        } else {
            time = Math.max(time, this._splines[1].time)
            this._splines[2] = {
                ...waveSpline,
                time: time + this._transitionTime
            }
        }
    }

    process(inputs, outputs, parameters) {
        const timeBase = currentTime - this._startTime
        const output = outputs[0]
        const gainParam = parameters.gain
        const pitchParam = parameters.pitch
        const pitchScaleParam = parameters.pitchScale
        const frequencyParam = parameters.frequency
        const quantizeTimeParam = parameters.quantizeTime
        const quantizeTimeThresholdParam = parameters.quantizeTimeThreshold
        const quantizeValueParam = parameters.quantizeValue

        const sampleDuration = 1/sampleRate

        for (let channel = 0; channel < output.length; channel++) {
            for (let sample = 0; sample < output[channel].length; sample++) {
                if (channel == 0) {
                    if (this._splines) {
                        const gain = gainParam.length > 1 ? gainParam[sample]:gainParam[0] 
                        const frequency = frequencyParam.length > 1 ? frequencyParam[sample] : frequencyParam[0]
                        const pitch = pitchParam.length > 1 ? pitchParam[sample] : pitchParam[0]
                        const pitchScale = pitchScaleParam.length > 1 ? pitchScaleParam[sample] : pitchScaleParam[0]
                        const pitchedFrequency = frequency * Math.pow(2, pitch * pitchScale)
                        const quantizeTime = quantizeTimeParam.length > 1 ? quantizeTimeParam[sample] : quantizeTimeParam[0]
                        const quantizeTimeThreshold = quantizeTimeThresholdParam.length > 1 ? quantizeTimeThresholdParam[sample] : quantizeTimeThresholdParam[0]
                        const quantizeValue = quantizeValueParam.length > 1 ? quantizeValueParam[sample] : quantizeValueParam[0]
                        

                        const sampleTime = currentTime + sample * sampleDuration
                        const waveDuration = 1/pitchedFrequency 
                        const sampleIncrement = sampleDuration/waveDuration
                        this._time = (this._time + sampleIncrement)%1

                        let quantizedTime = quantize(this._time, quantizeTime, quantizeTimeThreshold)
                        let value = 0
                        if (this._splines.length == 1) {
                            value = quantize(
                                waveSplineSolver(this._splines[0], quantizedTime, this._splines[0].phase), 
                                quantizeValue
                            ) * 2 - 1
                        } else if (this._splines.length > 1) {
                            let splineA = this._splines[0]
                            let splineB = this._splines[1]
                            let q = (sampleTime-splineB.time) / this._transitionTime
                            if (q<=0) {
                                value = quantize(waveSplineSolver(splineA, quantizedTime, splineA.phase), quantizeValue) * 2 - 1
                            } else if (q>=1) {
                                value = quantize(waveSplineSolver(splineB, quantizedTime, splineB.phase), quantizeValue) * 2 - 1
                                this._splines.shift()
                            } else {
                                const valueA = quantize(waveSplineSolver(splineA, quantizedTime, splineA.phase), quantizeValue) * 2 - 1
                                const valueB = quantize(waveSplineSolver(splineB, quantizedTime, splineB.phase), quantizeValue) * 2 - 1
                                
                                value = interpolateLinear(valueA, valueB, q)
                            }
                        }
                        output[channel][sample] = gain * value
                    } else {
                        output[channel][sample] = 0
                    }
                } else {
                    output[channel][sample] = output[0][sample]
                }
            }
        }
        return this._active
    }
}
registerProcessor('wave-spline-processor', WaveSplineProcessor)
/******/ })()
;