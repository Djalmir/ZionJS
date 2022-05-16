const style = document.createElement('style')
style.textContent = /*css*/`
	.restaurant {
		background: var(--dark-bg2);
		margin: 13px 0;
		padding: 13px;
	}

	div {
		margin-left: 17px;
	}

	hr {
		border: none;
		border-top: 1px solid var(--dark-bg3);
	}
`

const template = document.createElement('template')
template.innerHTML = /*html*/`

	<section>
		<h1>About.JS</h1>

		<div class="restaurant" z-for="restaurant in restaurants">
			<b z-model="restaurant.name"></b>
			<hr/>
			<div class="table" z-for="table in restaurant.tables">
				<b z-model="table.name"></b>
				<div class="customer" z-for="customer in table.customers">
					<u z-model="customer.name"></u>
					<div class="order" z-for="order in customer.orders">
						<span z-model="order.name"></span>
						<div class="extra" z-for="extra in order.extras">
							<i z-model="extra"></i>
						</div>
					</div>
				</div>
				<hr/>
			</div>
		</div>

		<p z-for="label in labels">
			<fragment z-model="label"></fragment>
		</p>

		<p>fim</p>

	</section>

`

export default class About extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(style.cloneNode(true))
		this.shadowRoot.appendChild(template.content.cloneNode(true))

		this.restaurants = [
			{
				name: 'Restaurante do Zé',
				tables: [
					{
						name: 'Mesa 01',
						customers: [
							{
								name: 'Djalmir',
								orders: [
									{
										name: 'Sprite',
										extras: [
											'gelo'
										]
									},
									{
										name: 'Buffet Livre',
										extras: [
											'sobremesa'
										]
									}
								]
							},
							{
								name: 'Hosama',
								orders: [
									{
										name: 'Coca-cola',
										extras: [
											'limão',
											'gelo'
										]
									},
									{
										name: 'Buffet Livre',
										extras: [
											'sobremesa'
										]
									}
								]
							}
						]
					},
					{
						name: 'Mesa 02',
						customers: [
							{
								name: 'Luli',
								orders: [
									{
										name: 'Cerveja'
									},
									{
										name: 'X-Salada'
									}
								]
							},
							{
								name: 'Lolisvaldo',
								orders: [
									{
										name: 'Coca-cola',
										extras: [
											'limão'
										]
									},
									{
										name: 'X-Burguer',
										extras: [
											'molho verde',
											'hamburger extra',
											'pimenta'
										]
									}
								]
							}
						]
					}
				]
			},
			{
				name: "Braulio's Restaurant",
				tables: [
					{
						name: 'Table 1',
						customers: [
							{
								name: 'Penisvaldo',
								orders: [
									{
										name: 'Água com gas',
										extras: [
											'gelo'
										]
									},
									{
										name: 'Buffet Livre',
										extras: [
											'sobremesa',
											'porção de fritas'
										]
									}
								]
							},
							{
								name: 'Cremilson',
								orders: [
									{
										name: 'Coca-cola',
										extras: [
											'limão',
											'gelo',
											'dose de vodka'
										]
									},
									{
										name: 'Buffet Livre'
									}
								]
							}
						]
					},
					{
						name: 'Table 2',
						customers: [
							{
								name: 'Braulio',
								orders: [
									{
										name: 'Cerveja'
									},
									{
										name: 'X-Coração'
									}
								]
							},
							{
								name: 'Sicrilda',
								orders: [
									{
										name: 'X-Tudo'
									}
								]
							}
						]
					}
				]
			}
		]

		this.labels = [
			'abc1', 'teste', 'ihuul', 'agora vai'
		]
	}
}

customElements.define('view-about', About)