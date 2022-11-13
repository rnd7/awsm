import WebComponent from "../dom/web-component.js"

export default class Modal extends WebComponent {
    static style = 'elements/modal.css'
    constructor() {
        super()
        
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')
        this._resizeObserver = new ResizeObserver(entries => {
            this.render()
        })

        this._contentContainerEl = document.createElement('div')
        this._contentContainerEl.classList.add('content')

        this._resizeObserver.observe(this._contentContainerEl)
        this._containerEl.append(this._contentContainerEl)

        this._visible = false
        this._layer = document.body
        this._init()
    }

    async _init() {
        await this.fetchStyle(Modal.style)
        this.shadowRoot.append(this._containerEl)
        this.render()
    }

    set layer(value) {
        if (this._layer === value) return
        this._removeLayerHandlers()
        this._layer = value
        this.render()
    }

    get layer() {
        return this._layer
    }

    set title(value) {
        if (this._title === value) return
        this._title = value
        this.render()
    }

    get title() {
        return this._title
    }

    _addLayerHandlers() {
        if (!this._layer) return
        this._layer.addEventListener("pointerup", this.bound(this._onRemove))
        this._resizeObserver.observe(this._layer)
    }
    _removeLayerHandlers() {
        if (!this._layer) return
        this._layer.removeEventListener("pointerup", this.bound(this._onRemove))
        this._resizeObserver.unobserve(this._layer)

    }

    set reference(value) {
        if (this._reference === value) return
        this._removeReferenceHandlers()
        this._reference = value
        this.render()
    }

    get reference() {
        return this._reference
    }
    
    _addReferenceHandlers() {
        if (!this._reference) return
        this._resizeObserver.observe(this._reference)
    }
    
    _removeReferenceHandlers() {
        if (!this._reference) return
        this._resizeObserver.observe(this._reference)
    }

    set visible(value) {
        if (this._visible === value) return
        this._visible = value
        this._removeLayerHandlers()
        this.render()
    }
    get visible() {
        return this._visible
    }

    _clearContainer() {
        while (this._contentContainerEl.children.length) this._contentContainerEl.lastChild.remove()
    }

    set content(value) {
        this._clearContainer()
        this._content = value
        if (this._content) this._contentContainerEl.append(this._content)
    }
    get content() {
        return this._content
    }

    _onRemove(e) {
        if (e.target === this) return
        this._removeLayerHandlers()
        this.visible = false
    }

    renderCallback() {
        if (this._layer !== this.parentElement) this.remove()
        if (!this._layer) return

        if (this._visible && this._layer && this._reference) {
            const referenceRect = this._reference.getBoundingClientRect()
            const layerRect = this._layer.getBoundingClientRect()
            const modalRect = this.getBoundingClientRect()
            let x = referenceRect.left
            if (x > layerRect.right - modalRect.width) {
                x = referenceRect.right - modalRect.width
            }
            let y = referenceRect.bottom
            if (y + modalRect.height > layerRect.bottom) {
                y = referenceRect.top - modalRect.height
            }

            this.style.left = `${x}px`
            this.style.top = `${y}px`
            this.style.display = `flex`
        }


        if (this.parentElement && !this._visible) {
            this.remove()
        } else if (!this.parentElement && this._visible) {
            this._layer.append(this)
            this._addLayerHandlers()
            this._addReferenceHandlers()
        }
    }

    destroy() {
        this._removeLayerHandlers()
        this._removeReferenceHandlers()
        if (this.parentElement) this.remove()
        this._resizeObserver.disconnect()
        this._resizeObserver = null
        this._visible = null
        this._layer = null
        this._reference = null
        this._clearContainer()
        this._content = null
        this._containerEl.remove()
        this._containerEl = null
        super.destroy()
    }
}