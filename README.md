A util for translating an English json file into the language of your choice.

# Usage:
```
npm install
node translate.js <readFilePath> <languageCode> <writeFilePath>
```

# Examples:
```
node translate.js ./en-US.json es ./es-US.json
node translate.js ./en-US.json ar ./ar-IQ.json
```

### Shortcuts:
`npm run standard` will translate `./en-us.json` into a `es-us.json` and `ar-iq.json` file.

# Useful language codes
[Supported Google translate language codes](https://cloud.google.com/translate/docs/languages)

LTR:

* `es` Spanish
* `fr` French
* `ja` Japanese

RTL:

* `ar` Arabic
* `iw` Hebrew


# FAQ:
### What's up with the extra spaces?
The translation process adds spaces around whole words, so you might get some extra spaces around your text. For example, something that starts out like this: `<span>html</span>` will be translated like this: `<span> html </span>`.

### The file isn't saved in the same order as my original file
That's because the script uses promises to asynchronously translate, so the process doesn't take so long.
