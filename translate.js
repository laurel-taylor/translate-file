// Example usage: node translate.js ./test.json es ./es-US.json

const READ_FILE = process.argv[2] || './test.json';
const NEW_LANGUAGE = process.argv[3] || 'es';
const NEW_FILENAME = process.argv[4] ||'./es-US.json';

const translate = require('google-translate-api');
const { Map } = require('immutable');
const fs = require('fs');

let newFile = Map({});

const writeToFile = (contents) => {
    fs.writeFile(NEW_FILENAME, contents, (err) => {
        if(err) {
            return console.log(err);
        }

        console.log('The file was saved:', NEW_FILENAME);
    });
};

const translatePhrase = (phrase, toLanguage) => {
    return new Promise((resolve, reject) => {
        translate(phrase, { to: toLanguage }).then(res => {
            resolve(res.text);
        }).catch(err => {
            reject(err);
        });
    });
};

const getHtmlText = (text) => {
    const found = [];
    const rxp = /<([^>]+)>/g;
    let curMatch;

    while( curMatch = rxp.exec( text ) ) {
        found.push( curMatch[1] );
    }

    return found;
}

const replaceHtml = (foundArr, text) => {
    if (foundArr.length && text) {
        let count = -1;
        text = text.replace(/<(.*?)>/g, () => {
            count++;
            return `<${foundArr[count]}>`;
        });
    }
    return text;
}

const getBracketText = (text) => {
    const found = [];
    const rxp = /{([^}]+)}/g;
    let curMatch;

    while( curMatch = rxp.exec( text ) ) {
        found.push(curMatch[1]);
    }

    return found;
}

const replaceBrackets = (foundArr, text) => {
    if (foundArr.length && text) {
        let count = -1;
        text = text.replace(/\{(.*?)\}/g, () => {
            count++;
            return `{${foundArr[count]}}`;
        });
    }
    return text;
}

const processFile = () => {
    let languageFile;

    try {
        languageFile = require(READ_FILE);
    } catch (e) {
        console.error('ERROR: File', READ_FILE, 'not found. Exiting.');
        return;
    }

    console.log('Translating', READ_FILE, 'to', NEW_LANGUAGE, '...');
    const promisesArray = [];

    const processObject = (path, obj) => {
        Object.keys(obj).forEach((key) => {
            const phrase = obj[key];

            if (typeof phrase === 'string') {
                const bracketArr = getBracketText(phrase);
                const htmlArr = getHtmlText(phrase);
                promisesArray.push(translatePhrase(phrase, NEW_LANGUAGE).then(text => {
                    let replacedText = replaceBrackets(bracketArr, text);
                    replacedText = replaceHtml(htmlArr, replacedText);
                    newFile = newFile.setIn([...path, key], replacedText);
                }));
            } else {
                processObject([...path, key], phrase);
            }
        });
    };

    processObject([], languageFile);

    Promise.all(promisesArray).then(() => {
        const jsFile = newFile.toJS();
        // console.log(JSON.stringify(jsFile, null, 2));
        writeToFile(JSON.stringify(jsFile, null, 4));
    });
}

processFile();

