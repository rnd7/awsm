import WaveSplineProcessorInterface from "./wave-spline-processor-interface.js"

export default class WaveSplineProcessorPool {
    constructor(audioContext) {
        this._audioContext = audioContext
        this._generators = new Map()
        this._users = new Map()
    }

    retrieve(generator) {
        if (!generator) return
        if (!this._generators.size) this._audioContext.resume()
        let instance = this._generators.get(generator)
        if (!instance) {
            instance = new WaveSplineProcessorInterface(this._audioContext, generator)
            this._generators.set(generator, instance)
            this._users.set(generator, 0)
        }
        this._users.set(generator, this._users.get(generator) + 1)
        return instance
    }

    release(generator) {
        if (!generator) return
        if (this._users.has(generator)) {
            this._users.set(generator, this._users.get(generator) - 1)
        }
        if (this._users.get(generator) < 1) {
            const instance = this._generators.get(generator)
            if (instance) {
                instance.destroy()
            }
            this._generators.delete(generator)
            this._users.delete(generator)
        }
        if (!this._generators.size) this._audioContext.suspend()
    }
}