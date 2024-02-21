import Bindable from "../data/bindable.js"
import SignalProcessor from "../events/signal-processor.js"

export default class ModelBase extends Bindable {
    static _nameGenerator = null

    static set nameGenerator(value) {
        ModelBase._nameGenerator = value
        SignalProcessor.send(ModelBase, ModelBase.NAME_GENERATOR_CHANGE)
    }

    static get nameGenerator() {
        return ModelBase._nameGenerator
    }

    static NAME_GENERATOR_CHANGE = Symbol("NAME_GENERATOR_CHANGE")
    static NAME_CHANGE = Symbol("NAME_CHANGE")

    constructor({ name = "" }) {
        super()
        this.name = name
        this._ensureName()
        SignalProcessor.add(ModelBase, ModelBase.NAME_GENERATOR_CHANGE, this.bound(this._onNameGeneratorChange))

    }

    _onNameGeneratorChange() {
        this._ensureName()
    }

    _ensureName() {
        if (!ModelBase._nameGenerator) return
        if (!this._name) this.name = ModelBase._nameGenerator()
    }

    set name(value) {
        if (this._name === value) return
        this._name = value
        SignalProcessor.send(this, ModelBase.NAME_CHANGE)
    }

    get name() {
        return this._name
    }

    destroy() {
        SignalProcessor.remove(ModelBase, ModelBase.NAME_GENERATOR_CHANGE, this.bound(this._onNameGeneratorChange))
        this._name = ""
        super.destroy()
    }
}