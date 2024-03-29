const template = document.createElement('template')
template.innerHTML = /*html*/`
<style>
	header{
		margin: 0;
		text-align: center;
	}

	nav {
		background: var(--dark-bg2);
		padding: 7px 0 17px;
	}

	ul {
		list-style: none;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 7px;
		padding: 0;
		margin: 0;
	}

	li {
		color: var(--light-blue);
		cursor: pointer;
		font-weight: bold;
	}
</style>

<nav>
	<ul>
		<li z-onclick="goTo('/')">Home</li> |
		<li z-onclick="goTo('/about')">About</li>
	</ul>
</nav>

`

export default class Menu extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))

		this.goTo = (path) => {
			location.hash = `#${ path }`
		}

	}
}

customElements.define('main-menu', Menu)