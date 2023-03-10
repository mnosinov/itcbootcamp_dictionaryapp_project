const themeSwitcherBtn = document.getElementById('themeSwitcherBtn');
const fontsSelect = document.getElementById('fontsSelect');
const searchInputTxt = document.getElementById('searchInputTxt');
const wordInfoSection = document.getElementById('wordInfoSection');



/* style themes ----------------------------BEGIN */
let themes = [
	{ name: 'theme-light', cssFile: 'css/style-theme-light.css' },
	{ name: 'theme-dark', cssFile: 'css/style-theme-dark.css' }
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

function applyFont(font='serif') {
	document.getElementsByTagName('body')[0].style.fontFamily = font;
}

function fetchData(word) {
	fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
		.then(response => {
			if (response.ok){
				return response.json()
			} else if (response.status === 404) {
				showWordNotFound(word);
				return Promise.reject('error 404');
			} else {
				return Promise.reject('some error', response.status);
			}
		})
		.then(responseData => {
			showWordInfo(responseData);
		});
}

function showWordInfo(data) {
	preprocessInfo(data);
}

function isObjInList(obj, list) {
	// create list if it's undefined
	let result = false;
	for (let o of list) {
		if (JSON.stringify(o) === JSON.stringify(obj)) {
			result = true;
			break;
		}
	}
	return result;
}

function preprocessInfo(data) {
	console.log(data);
	let rslt = {};
	for (let wordData of data) {
		console.log(wordData);
		rslt.word = wordData.word;
		// phonetics
		for (let ph of wordData.phonetics) {
			if (!rslt.phonetics) rslt.phonetics = [];
			if (!isObjInList(ph, rslt.phonetics)) rslt.phonetics.push(ph);
		}
		// meanings by language part
		for (let mn of wordData.meanings) {
			if (!rslt.meanings) rslt.meanings = {};
			if (!rslt.meanings[mn.partOfSpeech]) rslt.meanings[mn.partOfSpeech] = {};
			// synonyms - meaning level
			for (let syn of mn.synonyms) {
				if (!rslt.meanings[mn.partOfSpeech].synonyms) rslt.meanings[mn.partOfSpeech].synonyms = [];
				if (!isObjInList(syn, rslt.meanings[mn.partOfSpeech].synonyms)) rslt.meanings[mn.partOfSpeech].synonyms.push(syn);
			}
			// antonyms - meaning level
			for (let syn of mn.antonyms) {
				if (!rslt.meanings[mn.partOfSpeech].antonyms) rslt.meanings[mn.partOfSpeech].antonyms = [];
				if (!isObjInList(syn, rslt.meanings[mn.partOfSpeech].antonyms)) rslt.meanings[mn.partOfSpeech].antonyms.push(syn);
			}
			// definitions
			for (let df of mn.definitions) {
				// synonyms - definition level
				// antonyms - definition level
				if (!rslt.meanings[mn.partOfSpeech].definitions) rslt.meanings[mn.partOfSpeech].definitions = [];
				if (!isObjInList(df, rslt.meanings[mn.partOfSpeech].definitions)) rslt.meanings[mn.partOfSpeech].definitions.push(df);
			}

		}
		// source URLs

	}
	console.log('result', rslt);
}

function showWordNotFound(word) {
	wordInfoSection.innerHTML = `
		The word "${word}" has been not found in the dictionary.
	`;
}
/* style themes ----------------------------END */
/* data fetching ---------------------------BEGIN */
/* data fetching ---------------------------END */
/* event handlers -------------------------BEGIN */
themeSwitcherBtn.addEventListener('click', e => {
	setNextTheme();
});
fontsSelect.addEventListener('change', e => {
	applyFont(e.target.value);
});
searchInputTxt.addEventListener('keydown', e => {
	if (e.key === 'Enter') {
		fetchData(e.target.value);
		console.log(e.target.value);
	}
});
/* event handlers -------------------------END */

applyFont();
let defaultTheme = themes.find( element => element.name === 'theme-light');
initThemes(defaultTheme);
