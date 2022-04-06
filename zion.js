const ZION = (self) => {

	const view = self.shadowRoot.firstElementChild
	const watch = self['watch']
	const zModeledKeys = []

	const eventDirectives = [
		'z-onblur',
		'z-onchange',
		'z-onclick',
		'z-onfocus',
		'z-onkeydown',
		'z-onkeypress',
		'z-onkeyup',
		'z-onmouseenter',
		'z-onmouseleave',
		'z-onmousemove',
		'z-onpaste',
		'z-onsubmit'
	]

	//Setting HTML events method callings (z-onclick = onclick, etc)
	eventDirectives.map((eDirective) => {
		let eventElements = Array.from(view.querySelectorAll(`[${ eDirective }]`))
		eventElements.map((el) => {
			let method = el.getAttribute(eDirective).replaceAll('this', 'self')
			//The line below would look like: el.onclick = someMethod
			el[`${ eDirective.replace(/z-/gi, '') }`] = self[method] || eval(method)
		})
	})

	//Creating two way data binding to all elements with z-model attribute
	let elements = Array.from(view.querySelectorAll("[z-model]"))
	elements.map((el) => {
		let binded = el.getAttribute('z-model')
		zModeledKeys.push(binded)
		let arr = binded.split('.')
		let prop = arr[arr.length - 1]
		let scope = eval('self.' + [...arr.splice(0, arr.length - 1)].join('.'))

		//fills the element with the property value once the view is loaded
		el.value = scope[prop]

		//update property on input key up event
		el.onkeyup = () => {
			scope[prop] = el.value
		}

		//Set the property getter and setter
		Object.defineProperty(scope, prop, {
			get: () => {
				return el.value
			},
			set: (newValue) => {
				let zElements = elements.filter(e => e.getAttribute('z-model') == el.getAttribute('z-model'))
				//Once the property receives a new value, update all elements binded to it
				zElements.map((zEl) => {
					if (zEl.type)
						zEl.value = newValue
					else
						zEl.textContent = newValue
				})

				//Once the property receives a new value, 
				//call the property watch function if it exists
				if (Object.keys(watch).includes(binded)) {
					watch[binded]()
				}
			}
		})
	})

	let watchKeys = {}
	//Set the watch function to all keys that are not binded to any element
	Object.keys(watch).filter(key => !zModeledKeys.includes(key)).map((watchKey) => {
		let arr = watchKey.split('.')
		let prop = arr[arr.length - 1]
		let scope = eval('self.' + [...arr.splice(0, arr.length - 1)].join('.'))
		watchKeys[watchKey] = scope[prop]
		Object.defineProperty(scope, prop, {
			get: () => {
				return watchKeys[watchKey]
			},
			set: (newValue) => {
				if (watchKeys[watchKey])
					watchKeys[watchKey] = newValue
				else {
					watchKeys[watchKey] = newValue
					console.log('watchKeys pushed', watchKeys)
				}
				watch[watchKey]()
			}
		})
	})
}