import React from 'react';
import ReactDOM from 'react-dom/client'

export default (name, component) => {
  const converted = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
  if (!customElements.get(converted)) {
    customElements.define(converted, class extends HTMLElement {
      constructor() {
        super();        
        this._root = ReactDOM.createRoot(this)
        this._observer = null
      }
      getProps() {
        const props = this.getAttributeNames().reduce((acc, name) => {
          const value = this.getAttribute(name)
          if (value === 'true') {
            acc[name] = true
          } else if (value === 'false') {
            acc[name] = false
          } else if (!isNaN(value)) {
            acc[name] = Number(value)
          } else {
            acc[name] = value
          }
          return acc
        }, {})

        props.$emit = (eventName, detail) =>
          this.dispatchEvent(new CustomEvent(eventName, { detail }))

        return props
      }
      renderReact() {
        if (!this._root || !this._root._internalRoot) {
          this._root = ReactDOM.createRoot(this)
        }
        this._root.render(React.createElement(component, this.getProps()))
      }
      connectedCallback() {
        this.renderReact()

        this._observer = new MutationObserver(() => {
          this.renderReact()
        })

        this._observer.observe(this, { attributes: true })
      }
      disconnectedCallback() {
        if (this._observer) {
          this._observer.disconnect();
          this._observer = null;
        }

        if (this._root && this._root._internalRoot) {
          setTimeout(() => {
            this._root.render(null)
            this._root.unmount()
            this._root = null
          }, 0)
        }
      }
    })
  }
}