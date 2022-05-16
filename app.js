import Home from './views/home.js'
import About from './views/about.js'

import Menu from './components/menu.js'

const routes = {
	'#/': Home,
	'#/about': About
}

async function onRouteChanged() {
	const hash = window.location.hash

	localStorage.setItem('app.lastHash', hash)

	if (!(appView instanceof HTMLElement)) {
		throw new ReferenceError('No router view element available for rendering')
	}

	const view = new routes[hash.split('?')[0]]()

	let globalStyle = await fetch('./style.css')
	globalStyle = await globalStyle.text()
	let viewStyle = view.shadowRoot.querySelector('style')
	if (viewStyle) {
		viewStyle.textContent = globalStyle + viewStyle.textContent
	}
	else {
		viewStyle = view.shadowRoot.insertBefore(document.createElement('style'), view.shadowRoot.firstElementChild)
		viewStyle.textContent = globalStyle
	}

	while (appView.firstChild)
		appView.removeChild(appView.firstChild)
	appView.appendChild(view)

	//Use the lines below only while in development! It makes easier to change app variables on DevTools.
	window.app = appView.firstElementChild

	//This will proccess all Zion directives in our HTML
	ZION(window.app)
}

if (!window.location.hash)
	window.location.hash = '#/'

onRouteChanged()
window.addEventListener('hashchange', onRouteChanged)
