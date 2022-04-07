const template = document.createElement('template')
template.innerHTML = /*html*/`
<zion-component>
  <link rel="stylesheet" href="style.css">

  <style>
		section {
			background: var(--dark-bg3);
			margin: 20px;
			border-radius: .3rem;
		}

		input {
			background: var(--dark-bg2);
		}
  </style>

	<h1 style="text-align:center;">ZionJS</h1>
  <section>
		<!-- Testing Two way data binding and method calls on events -->
    <input type="text" z-model="user.name" placeholder="Nome"/>
    <input type="text" z-model="user.age" placeholder="Idade"/>
		<button z-onclick="()=>{this.user.name='';this.user.age=''}">Clear</button>
		<button z-onclick="change">name=Djalmir; age=32;</button>
  </section>

	<section style="display: flex; gap: 30px; align-items: center;">
		<!-- Testing conditional rendering -->
		<div>
			<b>Show image?</b><br/>
			<label>
				<input type="radio" value="false" z-model="showImage">
				No
			</label><br/>
			<label>
				<input type="radio" value="true" z-model="showImage">
				Yes
			</label>
		</div>
		<img z-if="showImage" src="../img.png" style="height:53px;margin-left:20px;">
		<b z-else>This text shows up when the image isn't visible!</b>
	</section>

	<section>
		<!-- Testing conditional rendering without z-model -->
		<p>To make the picture below show and hide, change "showImage2" variable value throught the console.</p>
		<pre>
			<code>
let App = app.firstElementChild;
App.showImage2 = false;
			</code>
		</pre>
		<br/>
		<img z-if="showImage2" src="../img.png" style="height:53px;margin-left:20px;">
		<b z-else>This text shows up when the image isn't visible!</b>
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
			// 'user.name': () => {
			// 	console.log('user name changed to', this.user.name)
			// 	if (this.user.name == 'Zama')
			// 		alert('lol')
			// },
			// 'user.age': () => {
			// 	console.log('user age changed to', this.user.age)
			// }
			// 'showImage': () => {
			// 	console.log('this.showImage', this.showImage)
			// }
		}
		/* ******** */

		/* Data */
		this.user = {
			name: 'Hosama',
			age: 28
		}

		this.showImage = false
		this.showImage2 = true
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