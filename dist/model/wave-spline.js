import SignalProcessor from "../events/signal-processor.js"
import WaveSplineNode from "./wave-spline-node.js"
import ModelBase from "./model-base.js"
import instantiate from "./instantiate.js"
import { EXPONENTIAL_SPLINE } from "./wave-spline-type.js"

export default class WaveSpline extends ModelBase {
    static NODES_CHANGE = Symbol("NODES_CHANGE")
    static TYPE_CHANGE = Symbol("TYPE_CHANGE")
    static E_CHANGE = Symbol("E_CHANGE")
    static PHASE_CHANGE = Symbol("PHASE_CHANGE")
    constructor({
        nodes = [],
        type = EXPONENTIAL_SPLINE,
        e = 1,
        phase = 0,
    }) {
        super(...arguments)
        this.nodes = nodes
        this.type = type
        this.phase = phase
        this.e = e
        
    } 

    set type(value) {
        if (this._type === value) return
        this._type = value
        SignalProcessor.send(this, WaveSpline.TYPE_CHANGE)
    }

    get type() {
        return this._type
    }

    
    set e(value) {
        if (this._e === value) return
        this._e = value
        SignalProcessor.send(this, WaveSpline.E_CHANGE)
    }
    get e() {
        return this._e
    }


    set phase(value) {
        if (this._phase === value) return
        this._phase = value
        SignalProcessor.send(this, WaveSpline.PHASE_CHANGE)
    }
    get phase() {
        return this._phase
    }



    set nodes(value) {
        this.clearNodes(true)
        value.forEach((node)=>{this.addNode(node, true)})
        this.sort()
        SignalProcessor.send(this, WaveSpline.NODES_CHANGE)
    }

    get nodes() {
        return this._nodes
    }

    clearNodes(silent = false) {
        if (this._nodes) {
            this._nodes.forEach((node)=>{
                this._removeNodeListeners(node)
            }) 
        }
        this._nodes = []
        if (!silent) { 
            SignalProcessor.send(this, WaveSpline.NODES_CHANGE)
        }
    }

    _onNodeChange(e, t) {
        SignalProcessor.send(this, e)
        if (e === WaveSplineNode.X_CHANGE) this._onNodeXChange()
    }

    _onNodeXChange(e, t) {
        this.sort()
    }

    addNode(value, silent=false) {
        let node = instantiate(value, WaveSplineNode, true)
        this._nodes.push(node)
        this._addNodeListeners(node)
        this.sort()
        if (!silent) {
            SignalProcessor.send(this, WaveSpline.NODES_CHANGE)
        }
        return node
    }

    removeNode(value) {
        this._removeNodeListeners(value)
        this._nodes = this._nodes.filter((node)=>{
            return node !== value
        })
        SignalProcessor.send(this, WaveSpline.NODES_CHANGE)
    }

    _addNodeListeners(node) {
        if (!node) return
        SignalProcessor.add(node, SignalProcessor.WILDCARD, this.bound(this._onNodeChange))
    }

    _removeNodeListeners(node) {
        if (!node) return
        SignalProcessor.remove(node, SignalProcessor.WILDCARD, this.bound(this._onNodeChange))
    }

    sort() {
        this._nodes.sort((a,b)=>{
            return (a.x-b.x < 0)?-1:1
        })
    }

    toObject() {
        return {
            nodes: this._nodes.map(waveSplineNode => {
                return waveSplineNode.toObject()
            }),
            e: this.e,
            type: this.type,
            phase: this.phase
        }
    }
      
    destroy() {
        this._nodes.forEach((node)=>{
            this._removeNodeListeners(node)
            node.destroy()
        }) 
        this._nodes = null
        super.destroy()
    }

}