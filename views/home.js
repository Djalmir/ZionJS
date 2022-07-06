const style = document.createElement('style')
style.textContent = /*css*/`
	h2 {
		text-align: center;
	}

	section {
		background: var(--dark-bg3);
		margin: 17px;
		box-sizing: border-box;
		border-radius: .3rem;
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		align-items: flex-start;
	}

	#testBt {
		position: fixed;
		top: 10px;
		left: 10px;
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

	#itemsList {
		list-style: none;
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		display: flex;
		flex-wrap: wrap;
		gap: 33px;
	}

	#itemsList li,
	.box {
		background: var(--dark-bg2);
		padding: 13px;
		border-radius: .2rem;
	}

	.box {
		margin: 7px;
		max-width: calc(100% - 14px);
		display: inline-block;
		vertical-align: top;
	}

	.cam {
		margin: 7px;
		padding: 7px;
		border-radius: .2rem;
		display: flex;
		flex-direction: column;
		border: 1px solid black;
		background: var(--dark-bg3);
	}

	.cam div {
		margin: 7px 0 14px 7px;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes fadeOut {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes rollIn {
		from {
			transform: translate(100%,0);
			opacity: 0;
		}
		to {
			transform: translate(0,0);
			opacity: 1;
		}
	}

	@keyframes rollOut {
		from {
			transform: translate(0,0);
			opacity: 1;
		}
		to {
			transform: translate(-100%,0);
			opacity: 0;
		}
	}
`
const template = document.createElement('template')
template.innerHTML = /*html*/`
	<!-- <link rel="stylesheet" href="style.css"> -->
	<h1 style="text-align:center;">ZionJS</h1>
	<h2>{{mainMessage}}</h2>
	<button z-if="positionFixedzIfTest" id="testBt">teste</button>
  <section style="display:flex;align-items: flex-end; gap: 13px;">
		<!-- Testing Two way data binding and method calls on events  -->
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
		 <!-- Testing conditional rendering  -->
		<label z-if="!test">
			<span>app.test = false</span><br/>
			<input type="text" z-model="showImage1" readonly>
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
		<img z-if="showImage1" src="../img.png" style="height:53px;margin-left:20px;" enter-animation="fadeIn .2s linear" leave-animation="fadeOut .2s linear">
		<b z-else enter-animation="fadeIn .2s linear" leave-animation="fadeOut .2s linear">This text shows up when the image isn't visible!</b>
		<label>
			app.showImage1 = true
		</label>
	</section>

	<section>
		<!-- Testing conditional rendering without z-model  -->
		<div>
			<p>
				app.showImage2 = false
			</p>
			<br/>
			<img z-if="showImage2" src="../img.png" style="height:53px;margin-left:20px;">
			<b z-else>This text shows up when the image isn't visible!</b>
		</div>
	</section>

	<section>
		 <!-- Testing nested conditional rendering  -->
		<div z-if="showDivs.div1" id="div1" enter-animation="rollIn .2s linear" leave-animation="rollOut .2s linear">
			<span>app.showDivs.div1 = false</span>
			<div z-if="showDivs.div2" id="div2" enter-animation="rollIn .2s linear" leave-animation="rollOut .2s linear">
				<span>app.showDivs.div2 = false</span>
			</div>
			<div z-if="showDivs.div3" id="div3" enter-animation="rollIn .2s linear" leave-animation="rollOut .2s linear">
				<span>app.showDivs.div3 = false</span>
			</div>
		</div>
	</section>

	<section>
		<ul id="itemsList">
			<li z-for="item in showingItems" style="color:lime;" z-if="item.name != 'asdf'" enter-animation="rollIn 1s linear" leave-animation="rollOut .8s linear">
				<b z-model="item.name" z-if="item.name != 'poiu'" enter-animation="rollIn 1s linear" leave-animation="rollOut .8s linear"></b>
				<p>{{item.description}}</p>
				<input type="text" z-model="item.name">
			</li>
		</ul>
		<button z-onclick="showItems">Exibe Itens</button>
		<label>
			app.showingItems = app.items2
		</label>
	</section>

	<section>
		<p z-if="1 + 1 == 2">
			Lorem ipsum, dolor sit amet consectetur adipisicing elit. Blanditiis perferendis laudantium distinctio reprehenderit repellat inventore odit! Sapiente fugit esse reiciendis aliquam nisi aut, minima quis dignissimos. Voluptates natus voluptate vitae.
		</p>
	</section>

	<section>
		<div z-for="box in boxes" class="box">
			<b z-model="box.name"></b>
			<div z-for="cam in box.cams" class="cam">
				<span z-model="cam.name"></span>
				<input type="text" z-model="cam.name" placeholder="Nome da câmera">
				<div z-for="fo in cam.foo">
					<p>foo description:
						<span z-model="fo.description"></span>
					</p>
				</div>
			</div>
		</div>
	</section>

	<section>
		<div>
			<p>{{ 1 + 1 }} teste</p>
			<p>{{2 * 2}} ihaa</p>
			<p>aueee {{1 + 1 == 1 ? 'kkk' : 'lol'}}</p>
		</div>
		<button z-onclick="showMessage('Hello world!','Almost done!')">showMessage('Hello world!')</button>
		<button z-onclick="teste">TESTE</button>
	</section>

	<section>
		<fragment z-for="item in items1">
			<p>{{item.name}}</p>
		</fragment>
	</section>
`
export default class Home extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(style.cloneNode(true))
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
			},
			'showImage1': () => {
				console.log('this.showImage1', this.showImage1)
			},
			'showingItems[0].name': () => {
				console.log('nome: ', this.showingItems[0].name)
			}
		}
		/* ******** */

		/* Data */
		this.positionFixedzIfTest = false

		this.mainMessage = 'Hello world!'
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
		this.items1 = [
			{name: 'item 1', description: 'bla bla bla'},
			{name: 'item 2', description: 'bla bla bla 2'},
			{name: 'Da hora a vida!', description: 'huehue br br br'},
			{name: 'asdf', description: 'lol'},
			{name: 'qwerttyyy', description: 'lol'},
			{name: 'poiu', description: 'lol'},
		]
		this.items2 = [
			{name: 'Vue', description: 'Pra que? rsrs'},
			{name: 'React', description: 'Coitado kkk'},
			{name: 'Angular', description: 'pff 🤣'}
		]
		this.showingItems = this.items1
		this.boxes = [
			{
				name: 'Box 1',
				cams: [
					{
						name: 'b1 - cam1',
						foo: [
							{
								description: 'b1 c1 f1'
							}
						]
					},
					{
						name: 'b1 - cam2',
						foo: [
							{
								description: 'b1 c2 f1'
							},
							{
								description: 'b1 c2 f2'
							}
						]
					},
					{
						name: 'b1 - cam3',
						foo: [
							{
								description: 'b1 c3 f1'
							},
							{
								description: 'b1 c3 f2'
							},
							{
								description: 'b1 c3 f3'
							}
						]
					}
				]
			},
			{
				name: 'Box 2',
				cams: [
					{
						name: 'b2 - cam1',
						foo: []
					},
					{
						name: 'b2 - cam2',
						foo: []
					},
					{
						name: 'b2 - cam3',
						foo: []
					},
					{
						name: 'b2 - cam4',
						foo: []
					},
					{
						name: 'b2 - cam5',
						foo: [
							{
								description: 'b2 c5 f1'
							},
							{
								description: 'b2 c5 f2'
							},
							{
								description: 'b2 c5 f3'
							}
						]
					}
				]
			}
		]
		/* ******* */

		/* Methods */
		this.change = () => {
			this.user.name = 'Djalmir'
			this.user.age = 32
		}

		this.showItems = () => {
			console.log(this.showingItems)
		}

		this.calc = (calcule) => {
			alert(eval(calcule))
		}
		/* ******* */
	}
}

customElements.define('view-home', Home)