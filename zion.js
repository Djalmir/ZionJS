const ZION = async (self, zion_component, refreshing) => {

	const view = zion_component ? zion_component : self.shadowRoot
	const watch = self['watch'] || {}

	const eventDirectives = [
		'z-onblur',
		'z-onchange',
		'z-onclick',
		'z-oncontextmenu',
		'z-oncopy',
		'z-ondblclick',
		'z-onfocus',
		'z-oninput',
		'z-onkeydown',
		'z-onkeypress',
		'z-onkeyup',
		'z-onmousedown',
		'z-onmouseenter',
		'z-onmouseleave',
		'z-onmousemove',
		'z-onmouseup',
		'z-onpaste',
		'z-onsubmit',
		'z-ontouchcancel',
		'z-ontouchend',
		'z-ontouchmove',
		'z-ontouchstart'
	]

	//Proccess all curly-brackets match
	let matches = view.innerHTML.match(/({{.+?}})/g)
	if (matches) {
		matches.map((match, idx) => {
			try {
				let foundKey, zionComp
				Array.from(Object.keys(self)).find((key) => {
					if (match.match(key)) {
						foundKey = key
						zionComp = document.createElement('zion-comp')
						zionComp.id = `zionComp_${ idx }`
					}
				})

				if (self[match.replace(/[{}]/g, '')]) {
					zionComp.setAttribute('z-model', match.replace(/[{}]/g, ''))
					view.innerHTML = view.innerHTML.replace(match, zionComp.outerHTML)
				}
				else if (foundKey) {
					zionComp.textContent = eval(match.replace(foundKey, `self.${ foundKey }`).replace(/[{}]/g, ''))
					view.innerHTML = view.innerHTML.replace(match, zionComp.outerHTML)
					let currVal = self[foundKey]
					Object.defineProperty(self, foundKey, {
						configurable: true,
						get: () => {
							return currVal
						},
						set: (newValue) => {
							currVal = newValue
							view.getElementById(`zionComp_${ idx }`).textContent = eval(match.replace(foundKey, `self.${ foundKey }`).replace(/[{}]/g, ''))
						}
					})
				}
				else {
					let result = eval(match.replace(/[{}]/g, ''))
					if (result)
						view.innerHTML = view.innerHTML.replace(match, result)
				}
			}
			catch {}
		})
	}

	//Generating and rendering z-for elements
	let zForElements
	while (Array.from(view.querySelectorAll("[z-for]")).filter(z => !z.hasAttribute('end-z-for')).filter(e => e.offsetParent != null).length) {
		zForElements = Array.from(view.querySelectorAll("[z-for]")).filter(z => !z.hasAttribute('end-z-for')).filter(e => e.offsetParent != 'null')
		zForElements.map((zEl) => {
			if (!zEl.hasAttribute('data_id')) {
				zEl.setAttribute('data_id', 1 + Math.floor(Math.random() * 9999999))
				while (zForElements.filter(e => e != zEl).find(t => t.getAttribute('data_id') == zEl.getAttribute('data_id')))
					zEl.setAttribute('data_id', 1 + Math.floor(Math.random() * 9999999))
			}
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
					zEl.removeAttribute('end-z-for')
					zEl.style.display = ''
					let child = Array.from(zEl.querySelectorAll('[end-z-for]')).reverse()[0]
					while (child) {
						let children = Array.from(zEl.querySelectorAll(`[data_id='${ child.getAttribute('data_id') }']`)).filter(c => c != child)
						children.map((c) => {
							c.parentElement.removeChild(c)
						})
						let comments = Array.from(zEl.childNodes).filter(node => node.nodeType == 8 && node.textContent.includes(child.getAttribute('data_id')))
						comments.map((c) => {
							c.parentElement.removeChild(c)
						})
						child.removeAttribute('end-z-for')
						child.style.display = ''
						child = Array.from(zEl.querySelectorAll('[end-z-for]')).reverse()[0]
					}
				}
				else {
					arr = zEl.getAttribute('z-for').split(' in ').map((z => z.trim()))
					nick = arr[0]
					zEl.nick = arr[0]

					array = arr.slice(1, arr.length)

					let matches = Array.from(parent.childNodes).filter(child => child.textContent.includes('data_id')).filter(child => child.nodeType == 8)
					matches.map(match => {
						if (match.textContent.includes(`data_id="${ zEl.getAttribute('data_id') }"`))
							startZfor = match
					})
					if (!startZfor)
						startZfor = document.createComment(zEl.outerHTML)
					parent.insertBefore(startZfor, zEl)

					// z-for="x in 100"
					let numbersArray
					numbersArray = Array.from({ length: Number(array[0]) }, (_, i) => i)

					try {
						let arr = numbersArray.length
							? numbersArray/*z-for="x in 100"*/
							: eval('self.' + array)/*z-for="x in someArray"*/

						arr.map((z, idx) => {
							let newEl = parent.insertBefore(document.createElement(zEl.tagName), zEl)
							Array.from(zEl.attributes).filter(at => at.nodeName != 'z-for').map((attr) => {
								newEl.setAttribute(attr.nodeName, attr.nodeValue)
							})

							Array.from(newEl.attributes).map((attr) => {
								let v = attr.nodeValue.replaceAll(`${ nick }.`, `${ array }[${ idx }].`)
								newEl.setAttribute(attr.nodeName, v)
							})

							let html = zEl.innerHTML

							let matches = html.match(/{{.+?}}/g)
							if (matches)
								matches.map((match) => {
									if (match.replace(/[{}]/g, '') == nick)
										html = html.replaceAll(match, typeof (z) == 'object' ? JSON.stringify(z) : z)
									else if (!zEl.parentElement.getAttribute('end-z-for')) {
										let property = match.replace(/[{}]/g, '').split('.')
										let shifted = property.shift()
										if (shifted == zEl.nick) {
											let obj = 'z'
											for (let i = 0; i < property.length; i++) {
												obj += `['${ property[i] }']`
											}
											html = html.replaceAll(match, eval(obj))
										}
										else {
											let m = match.replace(zEl.nick, z)
											html = html.replace(match, m)
										}
									}
								})

							html = html.replaceAll(`${ nick }.`, `${ array }[${ idx }].`)

							matches = html.match(`z-model="${ nick }"`)
							if (matches) {
								matches.map((match) => {
									html = html.replaceAll(match, match.replace(`${ nick }`, `${ array }[${ idx }]`))
								})
							}

							let evalMatches = html.match(/{{.+?}}/g)
							if (evalMatches) {
								evalMatches.map((match) => {
									try {
										html = html.replace(match, eval(match.replace(/[{}]/g, '')))
									}
									catch {}
								})
							}

							newEl.innerHTML = html

							if (newEl.tagName == 'FRAGMENT') {
								Array.from(newEl.children).map((child) => {
									newEl.parentElement.insertBefore(child, newEl)
								})
								newEl.parentElement.removeChild(newEl)
							}
						})
					}
					catch {
					}
				}

				if (newVal) {
					ZION(self, zEl.parentElement, true)
				}
				else {
					zEl.setAttribute('end-z-for', zEl.getAttribute('data_id'))
					zEl.style.display = 'none'
				}
			}

			updateList()

			//Z-FOR TWO WAY DATA BINDING
			if (self[array[0]]) {
				array = array[0].split('.')
				try {
					let scope = eval(`self${ array.length > 1 ? '.' + array.slice(0, array.length - 2) : '' }`)
					let prop = array[array.length - 1]
					let currVal = scope[prop]
					Object.defineProperty(scope, prop, {
						configurable: true,
						get: () => {
							return currVal
						},
						set: (newVal) => {
							currVal = newVal
							updateList(newVal)
						}
					})
				}
				catch (err) {
					//
				}
			}
		})
	}

	//Setting HTML events method callings (z-onclick = onclick, etc)
	eventDirectives.map((eDirective) => {
		let elements = Array.from(view.querySelectorAll(`[${ eDirective }]`))
		elements.map((el) => {
			try {
				let method = el.getAttribute(eDirective).replaceAll('this', 'self')
				let params = method.match(/\(.+?\)/g)
				if (params) {
					method = method.replace(params, '')
					params = params[0].replace(/[\(\)]/g, '').replace(/[`"']/g, '')
					if (params.includes(','))
						params = params.split(',')
					//The line below would look like: el.onclick = someMethod
					el[`${ eDirective.replace(/z-/gi, '') }`] = () => {
						if (self[method])
							return self[method](params)
						else
							return this[method](params)
					}
				}
				else {
					if (self[method])
						el[`${ eDirective.replace(/z-/gi, '') }`] = self[method]
					else if (this[method])
						el[`${ eDirective.replace(/z-/gi, '') }`] = this[method]
					else
						el[`${ eDirective.replace(/z-/gi, '') }`] = eval(method)
				}
			}
			catch {
				throw new ReferenceError(`ZionJS could not resolve ${ eDirective }`)
			}
		})
	})

	//Creating two way data binding to all elements with z-model attribute
	let elements = Array.from(view.querySelectorAll("[z-model]"))/*.filter(e => e.offsetParent != null)*/
	elements.map((el) => {
		let binded = el.getAttribute('z-model')
		let arr = binded.split('.')
		let prop = arr[arr.length - 1]
		let scope
		if (arr.length > 1) {
			scope = eval('self.' + [...arr.splice(0, arr.length - 1)].join('.'))
		}
		else
			scope = self

		let propIndex = prop.split('[')[1]
		if (propIndex) {
			propIndex = propIndex.replace(']', '')
		}

		prop = prop.split('[')[0]

		//if el is a zion component
		let elZmodel //used to remember the z-model until we set the getters and setters
		if (el.shadowRoot) {
			if (el.shadowRoot.querySelector(`input[type]`)) {
				elZmodel = el.getAttribute('z-model')
				el = el.shadowRoot.querySelector(`input[type]`)
			}
		}
		else if (el.getAttribute('zTag')) {
			elZmodel = el.getAttribute('z-model')
			el = el.shadowRoot.querySelector(el.getAttribute('zTag'))
		}

		try {
			//fills the element with the property value once the view is loaded
			if (!el.getAttribute('type')) {
				if ('value' in el)
					el.value = propIndex ? scope[prop][propIndex] : scope[prop]
				else
					el.textContent = propIndex ? scope[prop][propIndex] : scope[prop]
			}
			else if (el.getAttribute('type') != 'radio' && el.getAttribute('type') != 'checkbox') {
				el.value = propIndex ? scope[prop][propIndex] : scope[prop]
			}
			else if (el.getAttribute('type') == 'radio' || el.getAttribute('type') == 'checkbox') {
				el.checked = propIndex ? scope[prop][propIndex] == eval(el.value) : el.getAttribute('type') == 'radio' ? scope[prop] == eval(el.value) : scope[prop]
			}

			if (el.getAttribute('readonly') == null) {
				//update property on input key up event
				el.addEventListener('keyup', () => {
					if (el.getAttribute('type') == 'radio') {
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
					else if (el.getAttribute('type') == 'checkbox') {
						try {
							if (typeof el.checked === 'undefined' || eval(el.checked) != undefined)
								scope[prop] = eval(el.checked)
							else
								scope[prop] = el.checked
						}
						catch {
							scope[prop] = el.checked
						}
					}
					else
						scope[prop] = el.value
				})
				//update property on change
				el.addEventListener('change', () => {
					if (el.getAttribute('type') == 'radio') {
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
					else if (el.getAttribute('type') == 'checkbox') {
						try {
							if (typeof el.checked === 'undefined' || eval(el.checked) != undefined)
								scope[prop] = eval(el.checked)
							else
								scope[prop] = el.checked
						}
						catch {
							scope[prop] = el.checked
						}
					}
					else
						scope[prop] = el.value
				})
			}

			let currVal = scope[prop]
			//Set the property getter and setter
			let oldProp = Object.getOwnPropertyDescriptor(scope, prop) || {}
			Object.defineProperty(scope, prop, {
				configurable: true,
				get: () => {
					return currVal
				},
				set: (newVal) => {
					if (el.getAttribute('readonly') == null) {
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

						let zElements = elements.filter(e => e.getAttribute('z-model') == el.getAttribute('z-model') || (elZmodel && e.getAttribute('z-model') == elZmodel))
						//Once the property receives a new value, update all elements binded to it
						zElements.map((zEl) => {

							//if zEl is a zion component
							if (zEl.shadowRoot) {
								if (zEl.shadowRoot.querySelector(`input[type]`))
									zEl = zEl.shadowRoot.querySelector(`input[type]`)
							}
							else if (zEl.getAttribute('zTag'))
								zEl = zEl.shadowRoot.querySelector(zEl.getAttribute('zTag'))

							if (!zEl.getAttribute('type')) {
								if ('value' in zEl)
									zEl.value = newVal
								else
									zEl.textContent = newVal
							}
							else if (zEl.getAttribute('type') != 'radio' && zEl.getAttribute('type') != 'checkbox') {
								zEl.value = newVal
							}
							else if (zEl.getAttribute('type') == 'radio')
								zEl.checked = eval(newVal) == eval(zEl.value)
							else if (zEl.getAttribute('type') == 'checkbox') {
								zEl.checked = eval(newVal)
							}

							//Sending event to components so they are able to make custom changes to itself
							//See Taskboard components/textInput.js
							let event = new CustomEvent('updated', { detail: { component: zEl, newValue: newVal } })
							document.dispatchEvent(event)
						})
					}
				}
			})
		}
		catch {
			//
		}
	})

	//Set the watch function to all keys
	if (!refreshing) {
		let watchKeys = {}
		Object.keys(watch).map((watchKey) => {
			let arr = watchKey.split('.')
			let prop = arr[arr.length - 1]
			let scope
			if (arr.length > 1)
				scope = eval('self.' + [...arr.splice(0, arr.length - 1)].join('.'))
			else
				scope = self
			watchKeys[watchKey] = scope[prop]
			let oldProp = Object.getOwnPropertyDescriptor(scope, prop) || {}
			Object.defineProperty(scope, prop, {
				configurable: true,
				get: () => {
					return watchKeys[watchKey]
				},
				set: (newVal) => {
					watchKeys[watchKey] = newVal
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
	}

	//Proccess all z-if directives
	let zIfElements = Array.from(view.querySelectorAll('[z-if]')).filter((el) => {
		return !el.hasAttribute('end-z-for') && (el.offsetParent != null || window.getComputedStyle(el).getPropertyValue('position') == 'fixed')
	})
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
			let oldProp = Object.getOwnPropertyDescriptor(scope, prop) || {}
			Object.defineProperty(scope, prop, {
				configurable: true,
				get: () => {
					return currVal
				},
				set: (newVal) => {
					let changedCurrVal = false
					if (oldProp.set) {
						if (typeof newVal === 'undefined' && eval(newVal) != undefined) {
							if (currVal != eval(newVal))
								changedCurrVal = true
							currVal = eval(newVal)
							oldProp.set(eval(newVal))
						}
						else {
							if (currVal != newVal)
								changedCurrVal = true
							currVal = newVal
							oldProp.set(newVal)
						}
					}
					else {
						if (typeof newVal === 'undefined' && eval(newVal) != undefined) {
							if (currVal != eval(newVal))
								changedCurrVal = true
							currVal = eval(newVal)
						}
						else {
							if (currVal != newVal)
								changedCurrVal = true
							currVal = newVal
						}
					}

					if (changedCurrVal) {
						const nextZElVisibility = () => {
							zEl.nextElementSibling.removeEventListener('animationend', nextZElVisibility)
							zEl.nextElementSibling.style.display = newVal ? 'none' : ''
							zEl.nextElementSibling.style.animation = ''
							if (!newVal) {
								let enterAnimation = zEl.nextElementSibling.getAttribute('enter-animation')
								if (enterAnimation) {
									const rmAnim = () => {
										zEl.nextElementSibling.removeEventListener('animationend', rmAnim)
										zEl.nextElementSibling.style.animation = ''
									}
									zEl.nextElementSibling.style.animation = enterAnimation
									zEl.nextElementSibling.addEventListener('animationend', rmAnim)
								}
							}
							else
								zElVisibility()
						}

						const zElVisibility = () => {
							zEl.removeEventListener('animationend', zElVisibility)
							zEl.style.display = newVal ? '' : 'none'
							zEl.style.animation = ''
							if (newVal) {
								let enterAnimation = zEl.getAttribute('enter-animation')
								if (enterAnimation) {
									const rmAnim = () => {
										zEl.removeEventListener('animationend', rmAnim)
										zEl.style.animation = ''
									}
									zEl.style.animation = enterAnimation
									zEl.addEventListener('animationend', rmAnim)
								}
							}
							else {
								if (zEl.nextElementSibling) {
									if (zEl.nextElementSibling.hasAttribute('z-else')) {
										nextZElVisibility()
									}
								}
							}
						}

						if (zEl.style.display != 'none') {
							let leaveAnimation = zEl.getAttribute('leave-animation')
							if (leaveAnimation) {
								zEl.style.animation = leaveAnimation
								zEl.addEventListener('animationend', zElVisibility)
							}
							else
								zElVisibility()
						}
						else {
							if (zEl.nextElementSibling) {
								if (zEl.nextElementSibling.hasAttribute('z-else')) {
									let leaveAnimation = zEl.nextElementSibling.getAttribute('leave-animation')
									if (leaveAnimation) {
										zEl.nextElementSibling.style.animation = leaveAnimation
										zEl.nextElementSibling.addEventListener('animationend', nextZElVisibility)
									}
									else
										nextZElVisibility()
								}
								else
									zElVisibility()
							}
							else
								zElVisibility()
						}
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
				try {
					if (eval(scope)) {
						scope = eval(scope)
						zIf = arr[arr.length - 1]
					}
					else {
						scope = eval(`self${ arr.length > 2 ? '.' + arr.slice(0, arr.length - 2) : '' } `)
						zIf = arr[arr.length - 1]
					}
				}
				catch {
					scope = eval(`self${ arr.length > 2 ? '.' + arr.slice(0, arr.length - 2) : '' } `)
					zIf = arr[arr.length - 1]
				}

				let currVal
				if ((scope[zIf]))
					currVal = scope[zIf]
				else {
					let startsWithNegation = false
					if (originalZif.startsWith('!')) {
						startsWithNegation = true
						originalZif = originalZif.slice(1, originalZif.length)
					}
					currVal = eval((startsWithNegation ? '!' : '') + 'self.' + originalZif)
					zIf = zIf.split(' ')[0]
				}

				zEl.style.display = currVal ? '' : 'none'
				if (zEl.nextElementSibling) {
					if (zEl.nextElementSibling.hasAttribute('z-else'))
						zEl.nextElementSibling.style.display = currVal ? 'none' : ''
				}

				if (zIf.startsWith('!')) {
					zIf = zIf.slice(1, zIf.length)
					currVal = !scope[zIf]
				}
				else
					currVal = scope[zIf]

				let oldProp = Object.getOwnPropertyDescriptor(scope, zIf) || {}
				Object.defineProperty(scope, zIf, {
					configurable: true,
					get: () => {
						return currVal
					},
					set: (newVal) => {
						let changedCurrVal = false
						if (typeof newVal === 'undefined' && eval(newVal) != undefined) {
							if (currVal != eval(newVal))
								changedCurrVal = true
							currVal = eval(newVal)
							if (oldProp.set)
								oldProp.set(eval(newVal))
						}
						else {
							if (currVal != newVal)
								changedCurrVal = true
							currVal = newVal
							if (oldProp.set)
								oldProp.set(newVal)
						}

						if (changedCurrVal) {
							let logic = originalZif.split(zIf)[1]
							const nextZElVisibility = () => {
								zEl.nextElementSibling.removeEventListener('animationend', nextZElVisibility)
								// zEl.nextElementSibling.style.display = newVal ? 'none' : ''
								let newVal
								if (logic) {
									newVal = eval(`"${ scope[zIf] }" ${ logic }`)
									zEl.nextElementSibling.style.display = newVal ? 'none' : ''
								}
								else {
									newVal = eval(`"${ scope[zIf] }"`)
									zEl.nextElementSibling.style.display = newVal ? 'none' : ''
								}
								zEl.nextElementSibling.style.animation = ''
								if (!newVal) {
									let enterAnimation = zEl.nextElementSibling.getAttribute('enter-animation')
									if (enterAnimation) {
										const rmAnim = () => {
											zEl.nextElementSibling.removeEventListener('animationend', rmAnim)
											zEl.nextElementSibling.style.animation = ''
										}
										zEl.nextElementSibling.style.animation = enterAnimation
										zEl.nextElementSibling.addEventListener('animationend', rmAnim)
									}
								}
								else
									zElVisibility()
							}

							const zElVisibility = () => {
								zEl.removeEventListener('animationend', zElVisibility)
								let newVal
								if (logic) {
									newVal = eval(`"${ scope[zIf] }" ${ logic }`)
									zEl.style.display = newVal ? '' : 'none'
								}
								else {
									newVal = eval(`${ scope[zIf] }`)
									zEl.style.display = newVal ? '' : 'none'
								}
								zEl.style.animation = ''
								if (newVal) {
									let enterAnimation = zEl.getAttribute('enter-animation')
									if (enterAnimation) {
										const rmAnim = () => {
											zEl.removeEventListener('animationend', rmAnim)
											zEl.style.animation = ''
										}
										zEl.style.animation = enterAnimation
										zEl.addEventListener('animationend', rmAnim)
									}
								}
								else {
									if (zEl.nextElementSibling) {
										if (zEl.nextElementSibling.hasAttribute('z-else')) {
											nextZElVisibility()
										}
									}
								}
							}

							let oldVal = zEl.style.display != 'none'
							let changedResult = false
							if (logic) {
								changedResult = oldVal != eval(`"${ scope[zIf] }" ${ logic }`)
							}
							else {
								changedResult = oldVal != eval(`"${ scope[zIf] }"`)
							}

							if (changedResult) {
								if (zEl.style.display != 'none') {
									let leaveAnimation = zEl.getAttribute('leave-animation')
									if (leaveAnimation) {
										zEl.style.animation = leaveAnimation
										zEl.addEventListener('animationend', zElVisibility)
									}
									else
										zElVisibility()
								}
								else {
									if (zEl.nextElementSibling) {
										if (zEl.nextElementSibling.hasAttribute('z-else')) {
											let leaveAnimation = zEl.nextElementSibling.getAttribute('leave-animation')
											if (leaveAnimation) {
												zEl.nextElementSibling.style.animation = leaveAnimation
												zEl.nextElementSibling.addEventListener('animationend', nextZElVisibility)
											}
											else
												nextZElVisibility()
										}
										else
											zElVisibility()
									}
									else
										zElVisibility()
								}
							}
						}
					}
				})
			}
		}
	})
}

const zGet = async (url, headers) => {
	let event = new CustomEvent('zBeforeRequest', { detail: { url: url, headers: headers } })
	document.dispatchEvent(event)
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
				let event = new CustomEvent('zAfterRequest', { detail: { res: res } })
				document.dispatchEvent(event)
			})
	})
}

const zPost = async (url, body, headers) => {
	let event = new CustomEvent('zBeforeRequest', { detail: { url: url, body: body, headers: headers } })
	document.dispatchEvent(event)
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
				let event = new CustomEvent('zAfterRequest', { detail: { res: res } })
				document.dispatchEvent(event)
			})
	})
}

const zPut = async (url, body, headers) => {
	let event = new CustomEvent('zBeforeRequest', { detail: { url: url, body: body, headers: headers } })
	document.dispatchEvent(event)
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
				let event = new CustomEvent('zAfterRequest', { detail: { res: res } })
				document.dispatchEvent(event)
			})
	})
}

const zDelete = async (url, headers) => {
	let event = new CustomEvent('zBeforeRequest', { detail: { url: url, headers: headers } })
	document.dispatchEvent(event)
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
				let event = new CustomEvent('zAfterRequest', { detail: { res: res } })
				document.dispatchEvent(event)
			})
	})
}