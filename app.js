import Home from './views/home.js'
import About from './views/about.js'

const routes = {
	'#/': Home,
	'#/about': About
}

function onRouteChanged() {
	const hash = window.location.hash

	localStorage.setItem('app.lastHash', hash)

	if (!(app instanceof HTMLElement)) {
		throw new ReferenceError('No router view element available for rendering')
	}

	const view = new routes[hash.split('?')[0]]()
	while(app.firstChild)
	  app.removeChild(app.firstChild)
	app.appendChild(view)
}

if (!window.location.hash)
	window.location.hash = '#/'

onRouteChanged()
window.addEventListener('hashchange', onRouteChanged)