const themeSwitcherBtn = document.getElementById('themeSwitcherBtn');

/* style themes ----------------------------BEGIN */
let themes = [
	{ name: 'theme-light', cssFile: 'css/style-theme-light.css', themeIcon: 'images/icon-theme-light.svg', title: 'Light Mode' },
	{ name: 'theme-dark', cssFile: 'css/style-theme-dark.css', themeIcon: 'images/icon-theme-dark.svg', title: 'Dark Mode'  }
];

function initThemes(defaultTheme) { // should be called once on page load.
	// add css files of all themes
	let head  = document.getElementsByTagName('head')[0];
	themes.forEach( theme => {
		let link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = theme.cssFile;
		head.appendChild(link);
	});
	// set default theme
	let currentTheme = getCurrentTheme(defaultTheme); 
	// remove all themes from body's class list
	removeAllThemesFromBodyClasses();
	// add the next theme class to body's class list
	setThemeToBodyClasses(currentTheme);
}

function getCurrentTheme(defaultTheme=undefined) {
	let currentTheme;
	for (let cls of document.body.classList) {
		currentTheme = themes.find( element => element.name === cls );
		if (currentTheme) return currentTheme;
	}
	// theme is not set
	// if no default theme had been passed in, then default is 1st in themese list
	// and check if defaultTheme is in themes
	if (defaultTheme && themes.find( theme => theme === defaultTheme ))
		currentTheme = defaultTheme;
	else
		currentTheme = themes[0];
	// set initial theme
	return currentTheme;
}

// add the next theme class to body's class list
function setThemeToBodyClasses(theme) {
	document.body.classList.add(theme.name);
}

// remove all themes from body's class list
function removeAllThemesFromBodyClasses() {
	themes.forEach( theme => { document.body.classList.remove(theme.name); });
}

function getNextTheme(currentTheme) {
	// get the next theme in list cyclically
	let indexOfCurrentTheme = themes.indexOf(currentTheme);
	let nextThemeIndex = (indexOfCurrentTheme + 1) % themes.length;
	let nextTheme = themes[nextThemeIndex];
	return nextTheme;
}

function setNextTheme(defaultTheme=undefined) {
	let currentTheme = getCurrentTheme(defaultTheme); 
	
	let nextTheme = getNextTheme(currentTheme);
	// remove all themes from body's class list
	removeAllThemesFromBodyClasses();
	// add the next theme class to body's class list
	setThemeToBodyClasses(nextTheme);
}
/* style themes ----------------------------END */
/* data fetching ---------------------------BEGIN */
/* data fetching ---------------------------END */
/* event handlers -------------------------BEGIN */
themeSwitcherBtn.addEventListener('click', e => {
	setNextTheme();
});
fontsSelect.addEventListener('change', e => {
	document.getElementsByTagName('body')[0].style.fontFamily = e.target.value;
});
/* event handlers -------------------------END */

let defaultTheme = themes.find( element => element.name === 'theme-light');
initThemes(defaultTheme);
