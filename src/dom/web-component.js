import Binding from "../data/binding.js"
import camelToKebab from "../string/camel-to-kebab.js"

export default class WebComponent extends HTMLElement {
    static _register = new Set()
    static _prefix = "awsm"

    constructor() {
        super()
        this._binding = new Binding(this)
        this.attachShadow({ mode: 'open' })
    }

    bound(fn) {
        return this._binding.bound(fn)
    }

    from(opts) {
        Object.keys(opts).forEach((key) => {
            this[key] = opts[key]
        })
    }

    appendStyle(style) {
        this.removeStyle()
        this._styleEl = document.createElement('style')
        this._styleEl.appendChild(document.createTextNode(style))
        this.shadowRoot.append(this._styleEl)
    }

    removeStyle() {
        if (!this._styleEl) return
        this._styleEl.onload = null
        this._styleEl.onerror = null
        this._styleEl.remove()
        this._styleEl = null
    }

    fetchStyle(url) {
        this.removeStyle()
        return new Promise((resolve, reject) => {
            this._styleEl = document.createElement('link');
            this._styleEl.type = 'text/css'
            this._styleEl.rel = 'stylesheet'
            this._styleEl.onload = () => resolve()
            this._styleEl.onerror = () => reject()
            this._styleEl.href = url
            this.shadowRoot.append(this._styleEl)
        })
    }

    render() {
        if (this._renderFlag) return
        this._renderFlag = true
        this._animationFrameHandle = requestAnimationFrame(() => {
            this.renderCallback()
            this._renderFlag = false
        })
    }

    renderCallback() {
        // implement in subclass
    }

    static get componentName() {
        return [this._prefix, camelToKebab(this.name)].join('-')
    }

    static create() {
        const name = this.componentName
        if (!this._register.has(name)) {
            customElements.define(name, this)
            this._register.add(name)
        }
        return document.createElement(name)
    }

    manageContainer(containerElement, list, componentClass, createCallback, destroyCallback) {
        while (containerElement.children.length > list.length) {
            if (destroyCallback) destroyCallback(containerElement.lastChild)
            containerElement.lastChild.destroy()
        }
        while (containerElement.children.length < list.length) {
            const comp = componentClass.create()
            if (createCallback) createCallback(comp)
            containerElement.append(comp)
        }
        list.forEach((item, index) => {
            containerElement.children[index].from(item)
        })
    }

    destroyContainer(containerElement) {
        while (containerElement.children.length) {
            containerElement.lastChild.destroy()
        }
    }

    destroy() {
        cancelAnimationFrame(this._animationFrameHandle)
        this._renderFlag = false
        this.removeStyle()
        this.remove()
        this._styleEl = null
        this._binding.destroy()
        this._binding = null
    }
}