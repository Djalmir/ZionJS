const template = document.createElement('template')
template.innerHTML = /*html*/`
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

		#div1 {
			width: fit-content;
			background: var(--dark-bg2);
			margin: auto;
			padding: 13px;
			border-radius: .2rem;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 13px;
		}

		#div1 span {
			color: var(--dark-font2);
		}

		#div2 {
			background: var(--dark-bg3);
			padding: 13px;
			border-radius: .2rem;
		}

		#div3 {
			background: var(--dark-bg4);
			padding: 13px;
			border-radius: .2rem;
		}
  </style>
	
	<h1 style="text-align:center;">ZionJS</h1>
  <section style="display:flex;align-items: flex-end; gap: 13px;">
		<!-- Testing Two way data binding and method calls on events -->
		<label>
			app.user.name = 'Your name'<br/>
			<input type="text" z-model="user.name" placeholder="Nome"/>
		</label>
		<label>
			app.user.age = 'Your age'<br/>
			<input type="text" z-model="user.age" placeholder="Idade"/>
		</label>
		<button z-onclick="()=>{this.user.name='';this.user.age=''}">Clear</button>
		<button z-onclick="change">name=Djalmir; age=32;</button>
  </section>

	<section style="display: flex; gap: 30px; align-items: center;">
		<!-- Testing conditional rendering -->
		<label z-if="test">
			<span>app.test = false</span><br/>
			<input type="text" z-model="showImage1" >
		</label>
		<div>
			<b>Show image?</b><br/>
			<label>
				<input type="radio" value="false" z-model="showImage1">
				No
			</label><br/>
			<label>
				<input type="radio" value="true" z-model="showImage1">
				Yes
			</label>
		</div>
		<img z-if="showImage1" src="../img.png" style="height:53px;margin-left:20px;">
		<b z-else>This text shows up when the image isn't visible!</b>
		<label>
			app.showImage1 = true
		</label>
	</section>

	<section>
		<!-- Testing conditional rendering without z-model -->
		<p>
			app.showImage2 = false
		</p>
		<br/>
		<img z-if="showImage2" src="../img.png" style="height:53px;margin-left:20px;">
		<b z-else>This text shows up when the image isn't visible!</b>
	</section>

	<section>
		<!-- Testing nested conditional rendering -->
		<div z-if="showDivs.div1" id="div1">
			<span>app.showDivs.div1 = false</span>
			<div z-if="showDivs.div2" id="div2">
				<span>app.showDivs.div2 = false</span>
			</div>
			<div z-if="showDivs.div3" id="div3">
				<span>app.showDivs.div3 = false</span>
			</div>
		</div>
	</section>
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
		this.test = true

		this.user = {
			name: 'Hosama',
			age: 28
		}

		this.showImage1 = false
		this.showImage2 = true

		this.showDivs = {
			div1: true,
			div2: true,
			div3: true
		}
		/* ******* */

		/* Methods */
		this.change = () => {
			this.user.name = 'Djalmir'
			this.user.age = 32
		}
		/* ******* */

	}
}

customElements.define('view-home', Home)