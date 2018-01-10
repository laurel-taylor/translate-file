// Example usage: node translate.js ./test.json es ./es-US.json

const READ_FILE = process.argv[2] || './test.json';
const NEW_LANGUAGE = process.argv[3] || 'es';
const NEW_FILENAME = process.argv[4] ||'./es-US.json';

const translate = require('google-translate-api');
const { Map } = require('immutable');
const languageFile = require(READ_FILE);
const fs = require('fs');

let newFile = Map({});

const writeToFile = (contents) => {
    fs.writeFile(NEW_FILENAME, contents, (err) => {
        if(err) {
            return console.log(err);
        }

        console.log('The file was saved!', NEW_FILENAME);
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

const getBracketText = (text) => {
    const found = [];
    const rxp = /{([^}]+)}/g;
    let curMatch;

    while( curMatch = rxp.exec( text ) ) {
        found.push( curMatch[1] );
    }

    return found;
}

const replaceBrackets = (foundArr, text) => {
    if (foundArr.length && text) {
        let count = -1;
        text = text.replace(/\{(.*?)\}/g, (thing) => {
            count++;
            return `{${foundArr[count]}}`;
        });
    }
    return text;
}

const processFile = () => {
    const promisesArray = [];

    const processObject = (path, obj) => {
        Object.keys(obj).forEach((key) => {
            const phrase = obj[key];

            if (typeof phrase === 'string') {
                const bracketArr = getBracketText(phrase);
                promisesArray.push(translatePhrase(phrase, NEW_LANGUAGE).then(text => {
                    newFile = newFile.setIn([...path, key], replaceBrackets(bracketArr, text));
                }));
            } else {
                processObject([...path, key], phrase);
            }
        });
    };

    processObject([], languageFile);

    Promise.all(promisesArray).then(() => {
        console.log('done!', newFile.toJS());
        writeToFile(JSON.stringify(newFile.toJS(), null, 4));
    });
}

processFile();

