const themeSwitcherBtn = document.getElementById('themeSwitcherBtn');
const fontsSelect = document.getElementById('fontsSelect');
const searchInputTxt = document.getElementById('searchInputTxt');
const wordInfoSection = document.getElementById('wordInfoSection');
const searchBtn = document.getElementById('searchBtn');


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
	let dataToShow = preprocessInfo(data);
	// show info TODO
}

function isObjInList(obj, list) {
	// create list if it's undefined
	if (!list) list = [];
	let isInList = false;
	for (let o of list) {
		if (JSON.stringify(o) === JSON.stringify(obj)) {
			isInList = true;
			break;
		}
	}
	// add object to list if it is not in already
	if (!isInList) list.push(obj);
	return list;
}

function preprocessInfo(data) {
	console.log(data);
	let rslt = {};
	for (let wordData of data) {
		console.log(wordData);
		rslt.word = wordData.word;
		// phonetics
		for (let ph of wordData.phonetics)
			rslt.phonetics = isObjInList(ph, rslt.phonetics);
		// meanings by language part
		for (let mn of wordData.meanings) {
			if (!rslt.meanings) rslt.meanings = {};
			if (!rslt.meanings[mn.partOfSpeech]) rslt.meanings[mn.partOfSpeech] = {};
			// synonyms - meaning level
			for (let syn of mn.synonyms)
				rslt.meanings[mn.partOfSpeech].synonyms = isObjInList(syn, rslt.meanings[mn.partOfSpeech].synonyms);
			// antonyms - meaning level
			for (let ant of mn.antonyms)
				rslt.meanings[mn.partOfSpeech].antonyms = isObjInList(ant, rslt.meanings[mn.partOfSpeech].antonyms);
			// definitions
			for (let df of mn.definitions) {
				// synonyms - definition level
				for (let syn of df.synonyms)
					rslt.meanings[mn.partOfSpeech].synonyms = isObjInList(syn, rslt.meanings[mn.partOfSpeech].synonyms);
				delete df.synonyms;
				// antonyms - definition level
				for (let ant of df.antonyms)
					rslt.meanings[mn.partOfSpeech].antonyms = isObjInList(ant, rslt.meanings[mn.partOfSpeech].antonyms);
				delete df.antonyms;
				// add definition
				rslt.meanings[mn.partOfSpeech].definitions = isObjInList(df, rslt.meanings[mn.partOfSpeech].definitions);
			}
		}
		// source URLs
		for (let su of wordData.sourceUrls)
			rslt.sourceUrls = isObjInList(su, rslt.sourceUrls);
	}
	console.log('result', rslt);
	return rslt;
}

function showWordNotFound(word) {
	wordInfoSection.innerHTML = `
		The word "${word}" has been not found in the dictionary.
	`;
}

function toggleAudio(audio, playImg) {
	if (audio.paused) {
		audio.play();
		playImg.src = 'images/stop.png';
	} else {
		// stop playing the sound
		audio.pause();
		audio.currentTime = 0;
		playImg.src = 'images/play.png';
	}
}

function initAudioBtns() {
	let phoneticDivs = document.querySelectorAll('.phonetic');
	phoneticDivs.forEach( div => {
		let spellText = div.querySelector('.spell-text');
		let spellAudio = div.querySelector('.spell-audio');
		let audio = div.querySelector('audio');
		let playStopImg = div.querySelector('img');
		spellAudio.addEventListener('click', e => {
			toggleAudio(audio, playStopImg);
		});
		spellText.addEventListener('click', e => {
			toggleAudio(audio, playStopImg);
		});
		audio.addEventListener('ended', e => {
			playStopImg.src = 'images/play.png';
		});
	});
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
searchBtn.addEventListener('click', e => {
		fetchData(e.target.value);
});
/* event handlers -------------------------END */

applyFont();

let defaultTheme = themes.find( element => element.name === 'theme-light');
initThemes(defaultTheme);
initAudioBtns();
