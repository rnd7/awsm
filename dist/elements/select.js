import WebComponent from "../dom/web-component.js"
import Label from "./label.js"
import SelectModal from "./select-modal.js"


export default class Select extends WebComponent {

    static TRIGGER_EVENT = "trigger"
    static VALUE_CHANGE_EVENT = "value-change"
    static style = 'elements/select.css'

    constructor() {
        super()
        this._value = ''

        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')

        this._buttonEl = document.createElement('button')
        this._buttonEl.addEventListener("pointerup", this.bound(this._onPointerUp))
        this._containerEl.append(this._buttonEl)

        this._labelEl = Label.create()
        this._buttonEl.append(this._labelEl)

        this._valueEl = Label.create()
        this._buttonEl.append(this._valueEl)

        this._indicatorEl = document.createElement('div')
        this._indicatorEl.classList.add("indicator")

        this._modalContent = SelectModal.create()
        this._modalContent.addEventListener(SelectModal.VALUE_CHANGE_EVENT, this.bound(this._onValueChange))

        this._vertical = "bottom"
        this._init()
    }

    async _init() {
        await this.fetchStyle(Select.style)
        requestAnimationFrame(() => { this.shadowRoot.append(this._containerEl) })
        this.render()
    }

    set vertical(value) {
        this._vertical = value
    }

    get vertical() {
        return this._vertical
    }

    set options(value) {
        this._modalContent.options = value
    }

    get options() {
        return this._modalContent.options
    }

    set label(value) {
        if (this._label === value) return
        this._label = value
        this.render()
    }

    get label() {
        return this._label
    }

    get value() {
        return this._modalContent.value
    }

    set value(value) {
        this._modalContent.value = value
        this.render()
    }

    get modal() {
        return this._modal
    }

    _onPointerUp(e) {
        const referenceRect = this._buttonEl.getBoundingClientRect()
        requestAnimationFrame(() => {
            this._modalContent.style.zIndex = 1000
            if (this._vertical === "bottom") {
                this._modalContent.style.top = `${70}px`
                this._modalContent.style.left = `${-5}px`
            } else {
                this._modalContent.style.top = `${-80}px`
                this._modalContent.style.left = `${-5}px`
            }

            this._indicatorEl.style.bottom = `${-5}px`
            this._indicatorEl.style.left = `${-5}px`
            this._indicatorEl.style.width = `${60}px`
            this._indicatorEl.style.height = `${60}px`
            this._containerEl.append(this._indicatorEl)
            this._containerEl.append(this._modalContent)
        })
        this.dispatchEvent(
            new CustomEvent(Select.TRIGGER_EVENT, {
                bubbles: true,
                cancelable: false,
                composed: true
            })
        )
        this._ignore = e
        document.addEventListener('pointerup', this.bound(this._onGlobalPointerUp))
    }

    _onGlobalPointerUp(e) {
        if (e !== this._ignore) {
            this._indicatorEl.remove()
            this._modalContent.remove()
            document.removeEventListener('pointerup', this.bound(this._onGlobalPointerUp))
        }
    }

    _onValueChange(e) {
        this.render()
        this.dispatchEvent(
            new CustomEvent(Select.VALUE_CHANGE_EVENT, {
                bubbles: true,
                cancelable: false,
                composed: true
            })
        )
    }

    renderCallback() {
        this._labelEl.text = `${this._label}:`
        this._valueEl.text = this._modalContent.label
    }

    destroy() {
        document.removeEventListener('pointerup', this.bound(this._onGlobalPointerUp))
        this._buttonEl.removeEventListener("pointerup", this.bound(this._onPointerUp))
        this._buttonEl.remove()
        this._buttonEl = null
        this._labelEl.destroy()
        this._labelEl = null
        this._valueEl.destroy()
        this._valueEl = null
        this._modalContent.removeEventListener(SelectModal.VALUE_CHANGE_EVENT, this.bound(this._onValueChange))
        this._modalContent.destroy()
        this._modalContent = null
        this._containerEl.remove()
        this._containerEl = null
        super.destroy()
    }
}
