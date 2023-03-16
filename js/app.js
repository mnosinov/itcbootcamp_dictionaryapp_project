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
/* style themes ----------------------------END */


/* data fetching ---------------------------BEGIN */
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
			console.log(responseData);
			showWordInfo(responseData);
		});
}
/* data fetching ---------------------------END */

/* logic -----------------------------------BEGIN */
function applyFont(font='serif') {
	document.getElementsByTagName('body')[0].style.fontFamily = font;
}
function showWordInfo(data) {
	let { word, phonetics, meanings, sourceUrls } = preprocessInfo(data);

	// phonetics
	phoneticsBlock = '';
	if (phonetics) {
		phonetics.forEach( ({ text, audio:audioUrl }) => {
			console.log(audioUrl);
			phoneticsBlock += `
				<div class="phonetic">
					<p class="spell-text"><a href="#">${text}</a></p>
					<p class="spell-audio">
						<img src="images/play.png" alt="Play/Stop Button">
						<audio src="${audioUrl}"></audio>
					</p>
				</div>
			`;
		});
	}

	meaningsBlock = '';

	for (let partOfSpeech in meanings) {
		// meaning definitions
		let meaningsLis = '';
		meanings[partOfSpeech].definitions.forEach( ({ definition, example }) => {
			meaningsLis += `
				<li>
					<div class="meaning-text">${definition}</div>
					<div class="meaning-example">${example}</div>
				</li>`;
		});

		// synonyms
		let synonymsMiniBlock = '';
		if (meanings[partOfSpeech].synonyms) {
			let synonymsInfo = '';
			meanings[partOfSpeech].synonyms.forEach( syn => {
				synonymsInfo += `<li><a href="#" class="goto-word">${syn}</a></li>`;
			});
			let synonymsMiniBlock = `
				<div class="synonyms-list">
					<h3>Synonyms</h3>
						<ul>${synonymsInfo}</ul>
				</div>
			`;
		}

		// antonyms
		let antonymsMiniBlock = '';
		if (meanings[partOfSpeech].antonyms) {
			let antonymsInfo = '';
			meanings[partOfSpeech].antonyms.forEach( ant => {
				antonymsInfo += `<li><a href="#" class="goto-word">${ant}</a></li>`;
			});
			antonymsMiniBlock = `
				<div class="antonyms-list">
					<h3>Antonyms</h3>
						<ul>${antonymsInfo}</ul>
				</div>
			`;
		}

		meaningsBlock += `
			<div class="meaning-part-of-speech">
				<div class="part-of-speech"><span>${partOfSpeech}</span><div class="horizontal-bar"></div></div>
				<div class="meanings-div">
					<h3>Meaning</h3>
					<ul>${meaningsLis}</ul>
				</div>
				${synonymsMiniBlock}
				${antonymsMiniBlock}
			</div>
		`;
	}

	// source urls
	sourceUrlsBlock = '';
	if (sourceUrls) {
		sourceUrlsInfo = '';
		sourceUrls.forEach( url => {
			sourceUrlsInfo += `<li><a href="${url}" target="_blank">${url}</a></li>`;
		});
		sourceUrlsBlock = `
			<div class="horizontal-bar"></div>
			<div class="source-urls">
				<h3>Source</h3>
				<ul>${sourceUrlsInfo}</ul>
			</div>
		`;
	}

	info = `
		<h2>${word}</h2>
		<div class="phonetics-list">
			${phoneticsBlock}
		</div>
		<div class="meanings-list">
			${meaningsBlock}
		</div>
		${sourceUrlsBlock}
	`;

	// final result
	wordInfoSection.innerHTML = info;
	initAudioBtns();
	initGotoWordLinks();
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
	// console.log(data);
	let rslt = {};
	for (let wordData of data) {
		//console.log(wordData);
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
		<center>The word "${word}" has been not found in the dictionary.</center>
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
			e.preventDefault();
			toggleAudio(audio, playStopImg);
		});
		audio.addEventListener('ended', e => {
			playStopImg.src = 'images/play.png';
		});
	});
}

function initGotoWordLinks() {
	const gotoWordLinks = document.querySelectorAll('.goto-word');
	gotoWordLinks.forEach( link => {
		link.addEventListener('click', e => {
			let linkWord = link.innerHTML;
			searchInputTxt.value = linkWord;
			fetchData(linkWord);
		});
	});
}
/* logic -----------------------------------END */

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
		fetchData(searchInputTxt.value);
});
/* event handlers -------------------------END */

applyFont();

let defaultTheme = themes.find( element => element.name === 'theme-light');
initThemes(defaultTheme);
initAudioBtns();
