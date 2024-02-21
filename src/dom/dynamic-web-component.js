import WebComponent from "./web-component.js"

export default class DynamicWebComponent extends WebComponent {

    constructor() {
        super()
        this._dedicatedWidth = 0
        this._dedicatedHeight = 0
        this._resizeObserver = new ResizeObserver((entries) => {
            if (entries.length) {
                this._dedicatedWidth = entries[0].contentRect.width
                this._dedicatedHeight = entries[0].contentRect.height
                this.resize()
            }
        })
        this._resizeObserver.observe(this.shadowRoot.host)
    }

    get dedicatedWidth() {
        return this._dedicatedWidth
    }

    get dedicatedHeight() {
        return this._dedicatedHeight
    }

    resize() {
        // implement in subclass
    }

    destroy() {
        this._resizeObserver.disconnect()
        this._resizeObserver = null
        this._dedicatedWidth = this._dedicatedHeight = 0
        super.destroy()
    }

}
