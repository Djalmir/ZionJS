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
		let elements = Array.from(view.querySelectorAll(`[${ eDirective }]`))
		elements.map((el) => {
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
		let scope
		if (arr.length > 1)
			scope = eval('self.' + [...arr.splice(0, arr.length - 1)].join('.'))
		else
			scope = self

		//fills the element with the property value once the view is loaded
		if (el.type != 'radio' && el.type != 'checkbox')
			el.value = scope[prop]
		else if (el.type == 'radio' || el.type == 'checkbox')
			el.checked = scope[prop] == eval(el.value)
		else
			el.textContent = scope[prop]

		//update property on input key up event
		el.onkeyup = () => {
			scope[prop] = el.value
		}
		//update property on change
		el.onchange = () => {
			if ((el.type != 'radio' && el.type != 'checkbox') || el.checked) {
				scope[prop] = el.value
			}
		}

		let zIfElements = Array.from(view.querySelectorAll('[z-if]')).filter(zEl => zEl.getAttribute('z-if') == el.getAttribute('z-model'))
		let currVal = scope[prop]

		//Show or hide z-if elements accordingly
		zIfElements.map((zEl) => {
			//TODO: UPDATE THIS BLOCK!!!
			zEl.style.display = eval(currVal) ? 'unset' : 'none'
			if (zEl.nextElementSibling) {
				if (zEl.nextElementSibling.hasAttribute('z-else'))
					zEl.nextElementSibling.style.display = eval(currVal) ? 'none' : 'unset'
			}
		})


		//Set the property getter and setter
		Object.defineProperty(scope, prop, {
			get: () => {
				return currVal
			},
			set: (newValue) => {
				if (typeof newValue === 'undefined')
					currVal = eval(newValue)
				else
					currVal = newValue

				let zElements = elements.filter(e => e.getAttribute('z-model') == el.getAttribute('z-model'))
				//Once the property receives a new value, update all elements binded to it
				zElements.map((zEl) => {
					if (zEl.type != 'radio' && zEl.type != 'checkbox')
						zEl.value = newValue
					else if (zEl.type == 'radio' || zEl.type == 'checkbox')
						zEl.checked = eval(newValue) == eval(zEl.value)
					else
						zEl.textContent = newValue
				})

				//Once the property receives a new value, 
				//call the property watch function if it exists
				if (Object.keys(watch).includes(binded)) {
					watch[binded]()
				}

				//if element has z-if directive proccess it now				
				zIfElements.map((zEl) => {
					//TODO: UPDATE THIS BLOCK!!!
					zEl.style.display = eval(currVal) ? 'unset' : 'none'
					if (zEl.nextElementSibling) {
						if (zEl.nextElementSibling.hasAttribute('z-else'))
							zEl.nextElementSibling.style.display = eval(currVal) ? 'none' : 'unset'
					}
				})
			}
		})
	})

	let watchKeys = {}
	//Set the watch function to all keys that are not binded to any element
	Object.keys(watch).filter(key => !zModeledKeys.includes(key)).map((watchKey) => {
		let arr = watchKey.split('.')
		let prop = arr[arr.length - 1]
		let scope
		if (arr.length > 1)
			scope = eval('self.' + [...arr.splice(0, arr.length - 1)].join('.'))
		else
			scope = self
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
				}
				watch[watchKey]()
			}
		})
	})

	//Proccess all z-if directives but the zModeled ones
	let zIfElements = Array.from(view.querySelectorAll('[z-if]')).filter((el => !zModeledKeys.includes(el.getAttribute('z-if'))))
	zIfElements.map((zEl) => {
		let zIf = zEl.getAttribute('z-if')
		if (typeof self[zIf] !== 'undefined') {
			let arr = zIf.split('.')
			let prop = arr[arr.length - 1]
			let scope
			if (arr.length > 1)
				scope = eval('self.' + [...arr.splice(0, arr.length - 1)].join('.'))
			else
				scope = self

			zEl.style.display = self[zIf] ? 'unset' : 'none'
			if (zEl.nextElementSibling) {
				if (zEl.nextElementSibling.hasAttribute('z-else'))
					zEl.nextElementSibling.style.display = self[zIf] ? 'none' : 'unset'
			}

			let currVal = self[zIf]
			Object.defineProperty(scope, prop, {
				get: () => {
					return currVal
				},
				set: (newVal) => {
					currVal = newVal
					zEl.style.display = newVal ? 'unset' : 'none'//TODO: UPDATE THIS LINE!!!
					if (zEl.nextElementSibling) {
						if (zEl.nextElementSibling.hasAttribute('z-else'))
							zEl.nextElementSibling.style.display = newVal ? 'none' : 'unset'
					}
				}
			})
		}
		else {
			zEl.style.display = eval(zIf) ? 'unset' : 'none'//TODO: UPDATE THIS LINE!!!
			if (zEl.nextElementSibling) {
				if (zEl.nextElementSibling.hasAttribute('z-else'))
					zEl.nextElementSibling.style.display = eval(zIf) ? 'none' : 'unset'
			}
		}
	})
}