const threshold = .75
const atanUnit = 2 / Math.PI
const inverseThreshold = 1 - threshold
class Clipper extends AudioWorkletProcessor {
    constructor(...args) {
        super(...args)
        this._active = true
        this._bypass = false
        this._time = []
        this._sign = []
        this._clipped = false
        this._limit = 3 // seconds

        this.port.onmessage = (message) => {
            if (message.data.type === "destroy") {
                this._time = null
                this._sign = null
                this._active = false
                this._disabled = false
                this.port.close()
            } else if (message.data.type === "disable") {
                this._bypass = true
            } else if (message.data.type === "enable") {
                this._bypass = false
            }
        }
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0]
        const output = outputs[0]
        const sampleDuration = 1 / sampleRate

        let i = 0
        const len = this._time.length
        for (i; i < len; i++) {
            if (this._time[i] >= this._limit) break
        }
        if (i != len && !this._clipped) {
            this._clipped = true
            this.port.postMessage({ type: "clip" })
        } else if (i == len && this._clipped) {
            this._clipped = false
            this.port.postMessage({ type: "release" })
        }


        for (let channel = 0; channel < output.length; channel++) {
            const matchingInput = input.length > channel
                && input[channel].length === output[channel].length
            for (let sample = 0; sample < output[channel].length; sample++) {
                let value = 0
                if (matchingInput) {
                    value = input[channel][sample]
                }
                const sign = Math.sign(value)
                if (sign != 0 && sign == this._sign[channel]) {
                    this._time[channel] = this._time[channel] + sampleDuration || sampleDuration
                } else if (this._time[channel]) {
                    this._time[channel] = 0
                }
                this._sign[channel] = sign

                if (this._bypass || !this._clipped) {
                    const absVal = Math.abs(value)
                    if (absVal > threshold) {
                        output[channel][sample] = sign * (threshold + (atanUnit * Math.atan((absVal - threshold) / (inverseThreshold))) * (inverseThreshold))
                        if (Math.abs(value) > 1) console.warn("clip", value, output[channel][sample])
                    } else {
                        output[channel][sample] = value
                    }
                } else {
                    output[channel][sample] = 0
                }
            }
        }
        return this._active
    }
}
registerProcessor('awsm-clipper', Clipper)