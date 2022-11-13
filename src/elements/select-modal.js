import WebComponent from "../dom/web-component.js"
import SelectOption from "./select-option.js"

export default class SelectModal extends WebComponent {

    static VALUE_CHANGE_EVENT = "value-change"
    static style = 'elements/select-modal.css'

    constructor() {
        super()
        this._containerEl = document.createElement('div')
        this._containerEl.classList.add('container')
        this._containerEl.addEventListener('pointerup', this.bound(this._onContainerPointerUp))
        this._init()
    }

    async _init() {
        await this.fetchStyle(SelectModal.style)
        this.shadowRoot.append(this._containerEl)
        this.render()
    }

    _onContainerPointerUp(e) {
        this._value = e.target.value
        this.dispatchEvent(
            new CustomEvent(SelectModal.VALUE_CHANGE_EVENT,  {
                bubbles: true,
                cancelable: false,
                composed: true
            })
        )
    }
    
    set options(value) {
        if (this._options === value) return
        this._options = value
        this.render()
    }

    get options() {
        return this._options
    }

    set value(value) {
        this._value = value
        this.render()
    }

    get value() {
        return this._value
    }

    get label() {
        const option = this._options.find((option)=>{return option.value === this._value})
        if (option) return option.label
        return "none"
    }


    renderCallback() {
        this.manageContainer(this._containerEl, this._options.map((option)=>{
            return {
                ...option,
                active: option.value === this._value

            }
        }), SelectOption)
    }

    destroy() {
        this._containerEl.removeEventListener('pointerup', this.bound(this._onContainerPointerUp))
        this.destroyContainer(this._containerEl)
        this._containerEl.remove()
        super.destroy()
    }
}