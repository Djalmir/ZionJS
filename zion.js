const ZION = (self) => {

	const view = self.shadowRoot
	const watch = self['watch'] || {}

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

	//Proccess all curly-brackets match
	let matches = view.innerHTML.match(/({{.+?}})/g)
	if (matches) {
		matches.map((match) => {
			try {
				let result = eval(match.replace(/[{}]/g, ''))
				if (result)
					view.innerHTML = view.innerHTML.replace(match, result)
			}
			catch {}
		})
	}

	//Generating and rendering z-for elements
	let zForElements
	while (Array.from(view.querySelectorAll("[z-for]")).filter(z => !z.hasAttribute('end-z-for')).filter(e => e.offsetParent != 'null').length) {
		zForElements = Array.from(view.querySelectorAll("[z-for]")).filter(z => !z.hasAttribute('end-z-for')).filter(e => e.offsetParent != 'null')
		zForElements.map((zEl) => {
			zEl.setAttribute('data_id', 1 + Math.floor(Math.random() * 9999999))
			while (zForElements.filter(e => e != zEl).find(t => t.getAttribute('data_id') == zEl.getAttribute('data_id')))
				zEl.setAttribute('data_id', 1 + Math.floor(Math.random() * 9999999))
			let arr
			let nick
			let array

			let parent = zEl.parentElement
			let startZfor

			const updateList = (newVal) => {
				if (newVal) {
					let foundEnd = false
					while (!foundEnd) {
						parent.removeChild(startZfor.nextElementSibling)
						foundEnd = startZfor.nextElementSibling.hasAttribute('end-z-for')
						if (foundEnd)
							foundEnd = startZfor.nextElementSibling.getAttribute('end-z-for') == zEl.getAttribute('data_id')
					}
					parent.removeChild(startZfor)
					zEl.removeAttribute('end-z-for')
					zEl.style.display = ''
				}
				else {
					arr = zEl.getAttribute('z-for').split(' in ').map((z => z.trim()))
					nick = arr[0]
					zEl.nick = arr[0]

					array = arr.slice(1, arr.length)
					startZfor = parent.insertBefore(document.createComment(zEl.outerHTML), zEl)

					try {
						eval('self.' + array).map((z, idx) => {
							let newEl = parent.insertBefore(document.createElement(zEl.tagName), zEl)
							Array.from(zEl.attributes).filter(at => at.nodeName != 'z-for').map((attr) => {
								newEl.setAttribute(attr.nodeName, attr.nodeValue)
							})

							Array.from(newEl.attributes).map((attr) => {
								let n = attr.nodeName.replaceAll(`${ nick }.`, `${ array }[${ idx }].`)
								let v = attr.nodeValue.replaceAll(`${ nick }.`, `${ array }[${ idx }].`)

								newEl.setAttribute(n, v)
							})

							let html = zEl.innerHTML

							let matches = zEl.innerHTML.match(/({{.+?}})/g)
							if (matches)
								matches.map((match) => {
									html = html.replaceAll(match, z[match.replace(/[{{,}}]/g, '').split('.')[1]])
								})

							html = html.replaceAll(`${ nick }.`, `${ array }[${ idx }].`)

							newEl.innerHTML = html
						})
					}
					catch {
						//
					}
				}

				if (newVal) {
					ZION(self)
				}
				else {
					zEl.setAttribute('end-z-for', zEl.getAttribute('data_id'))
					zEl.style.display = 'none'
				}
			}

			updateList()

			//Z-FOR TWO WAY DATA BINDING
			array = array[0].split('.')
			try {
				let scope = eval(`self${ array.length > 1 ? '.' + array.slice(0, array.length - 2) : '' }`)
				let prop = array[array.length - 1]
				let currVal = scope[prop]
				let oldProp = Object.getOwnPropertyDescriptor(scope, prop)
				Object.defineProperty(scope, prop, {
					configurable: true,
					get: () => {
						return currVal
					},
					set: (newVal) => {
						if (typeof newVal === 'undefined' && eval(newVal) != undefined) {
							currVal = eval(newVal)
							if (oldProp.set)
								oldProp.set(eval(newVal))
						}
						else {
							currVal = newVal
							if (oldProp.set)
								oldProp.set(newVal)
						}
						// currVal = newVal
						updateList(newVal)
					}
				})
			}
			catch (err) {
				//
			}
		})
	}

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
	let elements = Array.from(view.querySelectorAll("[z-model]"))/*.filter(e => e.offsetParent != null)*/
	elements.map((el) => {
		let binded = el.getAttribute('z-model')
		let arr = binded.split('.')
		let prop = arr[arr.length - 1]
		let scope
		if (arr.length > 1)
			scope = eval('self.' + [...arr.splice(0, arr.length - 1)].join('.'))
		else
			scope = self

		try {
			//fills the element with the property value once the view is loaded
			if (!el.type)
				el.textContent = scope[prop]
			else if (el.type != 'radio' && el.type != 'checkbox') {
				el.value = scope[prop]
			}
			else if (el.type == 'radio' || el.type == 'checkbox')
				el.checked = scope[prop] == eval(el.value)

			//update property on input key up event
			el.addEventListener('keyup', () => {
				try {
					if (typeof el.value === 'undefined' || eval(el.value) != undefined)
						scope[prop] = eval(el.value)
					else
						scope[prop] = el.value
				}
				catch {
					scope[prop] = el.value
				}
			})
			//update property on change
			el.addEventListener('change', () => {
				if ((el.type != 'radio' && el.type != 'checkbox') || el.checked) {
					try {
						if (typeof el.value === 'undefined' || eval(el.value) != undefined)
							scope[prop] = eval(el.value)
						else
							scope[prop] = el.value
					}
					catch {
						scope[prop] = el.value
					}
				}
			})

			let currVal = scope[prop]
			//Set the property getter and setter
			let oldProp = Object.getOwnPropertyDescriptor(scope, prop)
			Object.defineProperty(scope, prop, {
				configurable: true,
				get: () => {
					return currVal
				},
				set: (newVal) => {
					if (typeof newVal === 'undefined' && eval(newVal) != undefined) {
						currVal = eval(newVal)
						if (oldProp.set)
							oldProp.set(eval(newVal))
					}
					else {
						currVal = newVal
						if (oldProp.set)
							oldProp.set(newVal)
					}

					let zElements = elements.filter(e => e.getAttribute('z-model') == el.getAttribute('z-model'))
					//Once the property receives a new value, update all elements binded to it
					zElements.map((zEl) => {
						if (!zEl.type)
							zEl.textContent = newVal
						else if (zEl.type != 'radio' && zEl.type != 'checkbox') {
							zEl.value = newVal
						}
						else if (zEl.type == 'radio' || zEl.type == 'checkbox')
							zEl.checked = eval(newVal) == eval(zEl.value)
					})
				}
			})
		}
		catch {
			//
		}
	})

	let watchKeys = {}
	//Set the watch function to all keys
	Object.keys(watch).map((watchKey) => {
		let arr = watchKey.split('.')
		let prop = arr[arr.length - 1]
		let scope
		if (arr.length > 1)
			scope = eval('self.' + [...arr.splice(0, arr.length - 1)].join('.'))
		else
			scope = self
		watchKeys[watchKey] = scope[prop]
		let oldProp = Object.getOwnPropertyDescriptor(scope, prop)
		Object.defineProperty(scope, prop, {
			configurable: true,
			get: () => {
				return watchKeys[watchKey]
			},
			set: (newVal) => {
				if (watchKeys[watchKey])
					watchKeys[watchKey] = newVal
				else {
					watchKeys[watchKey] = newVal
				}
				watch[watchKey]()
				if (oldProp.set) {
					if (typeof newVal === 'undefined' && eval(newVal) != undefined)
						oldProp.set(eval(newVal))
					else
						oldProp.set(newVal)
				}
			}
		})
	})

	//Proccess all z-if directives
	let zIfElements = Array.from(view.querySelectorAll('[z-if]')).filter(el => !el.hasAttribute('end-z-for')).filter(e => e.offsetParent != null)
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

			zEl.style.display = self[zIf] ? '' : 'none'
			if (zEl.nextElementSibling) {
				if (zEl.nextElementSibling.hasAttribute('z-else'))
					zEl.nextElementSibling.style.display = self[zIf] ? 'none' : ''
			}

			let currVal = self[zIf]
			let oldProp = Object.getOwnPropertyDescriptor(scope, prop)
			Object.defineProperty(scope, prop, {
				configurable: true,
				get: () => {
					return currVal
				},
				set: (newVal) => {
					if (oldProp.set) {
						if (typeof newVal === 'undefined' && eval(newVal) != undefined) {
							currVal = eval(newVal)
							oldProp.set(eval(newVal))
						}
						else {
							currVal = newVal
							oldProp.set(newVal)
						}
					}
					else {
						if (typeof newVal === 'undefined' && eval(newVal) != undefined)
							currVal = eval(newVal)
						else
							currVal = newVal
					}

					zEl.style.display = newVal ? '' : 'none'
					if (zEl.nextElementSibling) {
						if (zEl.nextElementSibling.hasAttribute('z-else'))
							zEl.nextElementSibling.style.display = newVal ? 'none' : ''
					}
				}
			})
		}
		else {
			try {
				zEl.style.display = eval(zIf) ? '' : 'none'
				if (zEl.nextElementSibling) {
					if (zEl.nextElementSibling.hasAttribute('z-else'))
						zEl.nextElementSibling.style.display = eval(zIf) ? 'none' : ''
				}
			}
			catch {
				let originalZif = zIf
				let arr = zIf.split('.')
				let scope = `self${ arr.length ? '.' + arr.slice(0, arr.length - 1) : '' }`
				if (eval(scope)) {
					scope = eval(scope)
					zIf = arr[arr.length - 1]
				}
				else {
					scope = eval(`self${ arr.length > 2 ? '.' + arr.slice(0, arr.length - 2) : '' } `)
					zIf = arr[arr.length - 2]
				}

				let currVal
				if ((scope[zIf]))
					currVal = scope[zIf]
				else {
					currVal = eval('self.' + originalZif)
					zIf = zIf.split(' ')[0]
				}

				zEl.style.display = currVal ? '' : 'none'
				if (zEl.nextElementSibling) {
					if (zEl.nextElementSibling.hasAttribute('z-else'))
						zEl.nextElementSibling.style.display = currVal ? 'none' : ''
				}

				currVal = scope[zIf]
				let oldProp = Object.getOwnPropertyDescriptor(scope, zIf)
				Object.defineProperty(scope, zIf, {
					configurable: true,
					get: () => {
						return currVal
					},
					set: (newVal) => {
						if (oldProp.set) {
							if (typeof newVal === 'undefined' && eval(newVal) != undefined) {
								currVal = eval(newVal)
								oldProp.set(eval(newVal))
							}
							else {
								currVal = newVal
								oldProp.set(newVal)
							}
						}
						else {
							if (typeof newVal === 'undefined' && eval(newVal) != undefined) {
								currVal = eval(newVal)
							}
							else {
								currVal = newVal
							}
						}

						let logic = originalZif.split(zIf)[1]
						if (logic)
							zEl.style.display = (eval(`"${ scope[zIf] }" ${ logic }`) ? '' : 'none')
						else
							zEl.style.display = (eval(`${ scope[zIf] }`) ? '' : 'none')
						if (zEl.nextElementSibling) {
							if (zEl.nextElementSibling.hasAttribute('z-else'))
								zEl.nextElementSibling.style.display = eval(`"${ scope[zIf] }" ${ logic }`) ? 'none' : ''
						}
					}
				})
			}
		}
	})
}

const zGet = async (url, headers) => {
	return new Promise((result, rej) => {
		fetch(url, {
			method: 'get',
			headers: headers ? {
				...headers,
				'Content-Type': 'application/json'
			} : {
				'Content-Type': 'application/json'
			}
		})
			.then(res => {
				return (res.json())
			})
			.then(res => {
				if (res.error) {
					rej(res)
				}
				else {
					result(res)
				}
			})
	})
}

const zPost = async (url, body, headers) => {
	return new Promise((result, rej) => {
		fetch(url, {
			method: 'post',
			headers: headers ? {
				...headers,
				'Content-Type': 'application/json'
			} : {
				'Content-Type': 'application/json'
			},
			body: body ? JSON.stringify(body) : null
		})
			.then(res => {
				return (res.json())
			})
			.then(res => {
				if (res.error) {
					rej(res)
				}
				else {
					result(res)
				}
			})
	})
}

const zPut = async (url, body, headers) => {
	return new Promise((result, rej) => {
		fetch(url, {
			method: 'put',
			headers: headers ? {
				...headers,
				'Content-Type': 'application/json'
			} : {
				'Content-Type': 'application/json'
			},
			body: body ? JSON.stringify(body) : null
		})
			.then(res => {
				return (res.json())
			})
			.then(res => {
				if (res.error) {
					rej(res)
				}
				else {
					result(res)
				}
			})
	})
}

const zDelete = async (url, headers) => {
	return new Promise((result, rej) => {
		fetch(url, {
			method: 'delete',
			headers: headers ? {
				...headers,
				'Content-Type': 'application/json'
			} : {
				'Content-Type': 'application/json'
			}
		})
			.then(res => {
				return (res.json())
			})
			.then(res => {
				if (res.error) {
					rej(res)
				}
				else {
					result(res)
				}
			})
	})
}