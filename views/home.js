const template = document.createElement('template')
template.innerHTML = /*html*/`
<zion-component>
  <link rel="stylesheet" href="style.css">

  <style>
		section {
			background: var(--dark-bg3);
			margin: 20px;
		}

		input {
			background: var(--dark-bg2);
		}
  </style>

	<h1>Zion.JS</h1>
  <section>
    <input type="text" z-model="user.name" placeholder="Nome"/>
    <input type="text" z-model="user.age" placeholder="Idade"/>
		<button z-onclick="()=>{this.user.name='';this.user.age=''}">Clear</button>
		<button z-onclick="change">name=Djalmir; age=32;</button>
  </section>

	<section>
		<input type="text" z-model="user.name" placeholder="Nome"/>
    <input type="text" z-model="user.age" placeholder="Idade"/>
		<button z-onclick="()=>{this.user.name='';this.user.age=''}">Clear</button>
		<button z-onclick="change">name=Djalmir; age=32;</button>
	</section>
 </zion-component>
`

export default class Home extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(template.content.cloneNode(true))

		/*Watch*/
		this.watch = {
			'user.name': () => {
				console.log('user name changed to', this.user.name)
				if (this.user.name == 'Zama')
					alert('lol')
			},
			'user.age': () => {
				console.log('user age changed to', this.user.age)
			}
		}
		/* ******** */

		/* Data */
		this.user = {
			name: 'Hosama',
			age: 28
		}
		/* ******* */

		/* Methods */
		this.change = () => {
			this.user.name = 'Djalmir'
			this.user.age = 32
		}
		/* ******* */

		//This will proccess all Zion directives in our HTML
		ZION(this)
	}
}

customElements.define('view-home', Home)