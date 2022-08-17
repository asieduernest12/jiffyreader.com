const { readFileSync, writeFileSync, existsSync, mkdirSync } = require('fs');
const axios = require('axios');
const path = require('path');

const localeEnglish = '../../assets/_locales/en/messages.json';

const targetLanguages = [
	'fr',
	'es',
	'pt',
	'ru',
	'it',
	'hu',
	'he',
	'fa',
	'et',
	'el',
	'de',
	'da',
	'cy',
	'ca',
	'af',
	'ar',
	'sw',
	'sv',
	'ms',
	'ko',
	'ja',
	'id',
	'hi',
	'ur',
	'uk',
	'th',
	'zh-Hans',
];
const englishSource = JSON.parse(loadFile());

/**
 * @description
 * import file
 * read as array
 * map entry and transform message and description
 * write to file
 */

function loadFile(filePath = localeEnglish) {
	return readFileSync(filePath, { encoding: 'utf-8' });
}

async function translationService(messages, _targetLanguages) {
	for (const language of _targetLanguages) {
		const translationResults = Object.entries(messages).map(async ([key, value]) => {
			const translation = {
				message: await translateSentence(value.message, language),
				description: await translateSentence(value.description, language),
			};
			return [key, translation];
		});

		Promise.all(translationResults).then((_res) => {
			const fp = `./../../assets/_locales/${language}/messages.json`;
			const dirPath = path.dirname(fp);

			if (!existsSync(dirPath)) {
				mkdirSync(dirPath, { recursive: true });
			}
			writeFileSync(fp, JSON.stringify(Object.fromEntries(_res)), { encoding: 'utf-8', flag: 'w' });
		});
	}
}

async function translateSentence(_sentence, language) {
	console.log('translation started', _sentence, language);
	// word = getContextTranslationSourceWord();
	const sentence = _sentence.trim();

	const translator = TranlationFactory().azureTranlate();
	const response = await fetchTranslation(translator.makeRequestObj(sentence, language));
	const parsedResponse = translator.parseResponse(response);
	console.log('all clear and response is', parsedResponse);

	return parsedResponse;
}

function isSingleWord(word) {
	return ['', word].join('').split(' ').length === 1;
}

function fetchTranslation({ url, config }) {
	try {
		return axios(url, config).then((res) => res.data);
	} catch (error) {
		console.error(error);
	}
}

function TranlationFactory() {
	return {
		googleTranlate,
		azureTranlate,
	};

	function azureTranlate() {
		return {
			makeRequestObj,
			parseResponse,
		};

		function makeRequestObj(sentence, outputLang) {
			return {
				url: `https://microsoft-translator-text.p.rapidapi.com/translate?api-version=3.0&to=${outputLang}&%3CREQUIRED%3E&textType=plain&profanityAction=NoAction`,
				config: {
					method: 'POST',
					headers: {
						'content-type': 'application/json',
						'x-rapidapi-key': process.env.RAPIDAPI_KEY,
						'x-rapidapi-host': 'microsoft-translator-text.p.rapidapi.com',
					},
					data: JSON.stringify([{ Text: sentence }]),
				},
			};
		}
		function parseResponse(response) {
			return response[0].translations[0].text;
		}
	}

	function googleTranlate(sentence, outputLang) {
		return {
			url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
			config: {
				method: 'POST',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'accept-encoding': 'application/gzip',
					'x-rapidapi-key': process.env.RAPIDAPI_KEY,
					'x-rapidapi-host': 'google-translate1.p.rapidapi.com',
				},
				body: JSON.stringify({
					q: sentence,
					target: outputLang,
					// source: "en",
				}),
			},
		};
	}
}

try {
	translationService(englishSource, targetLanguages);
} catch (error) {
	console.error(error);
}
