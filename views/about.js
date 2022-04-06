const template = document.createElement('template')
template.innerHTML = /*html*/`
<zion-component>
  <link rel="stylesheet" href="style.css">

  <style>

  </style>

  <section>
    <h1>About.JS</h1>
  </section>
 </zion-component>
`

export default class About extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))


	}
}

customElements.define('view-about', About)