// const style = document.createElement('style')
// style.textContent = /*css*/`

// `

const template = document.createElement('template')
template.innerHTML = /*html*/`
<!-- <link rel="stylesheet" href="style.css"> -->

<section>
	<h1>About.JS</h1>
</section>
`

export default class About extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		// this.shadowRoot.appendChild(style.cloneNode(true))
		this.shadowRoot.appendChild(template.content.cloneNode(true))
	}
}

customElements.define('view-about', About)