# climate-data-extraction-tool

Canadian Centre for Climate Services [Climate Data Extraction Tool](https://climate-change.canada.ca/climate-data)

Use the climate data extraction tool to download climate data from the selected
Environment and Climate Change Canada' datasets. You can specify the date
ranges, variables, download format and other options.


## Build Setup

- Install [nodejs](https://nodejs.org).

- Install npm packages.

```bash
git clone https://github.com/ECCC-CCCS/climate-data-extraction-tool.git
cd climate-data-extraction-tool
npm install

# run a localhost instance of web application
npm run dev
```

Other commands:

```bash
# serve with hot reload at localhost:8080
# be sure to restart this if /build or /config has been updated to reflect changes
npm run dev

# run dev with a specific config file; default is set to /config/dev.env.js
npm run dev --config=config/dev.env.js

# build for deployment using a specific config file [required]
npm run build --config=config/default.env.js

# build with uglifyJS on
npm run build --uglify

# build and view the bundle analyzer report
npm run build --report

# run unit tests
# can pass in --config as well
npm run unit

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Translations

Translation is done through a plugin: https://github.com/eldarc/vue-i18n-gettext
This plugin is not officially released yet. But the advantage is that it provides an all-in-one package for gettext extraction and compiling. There is no guide released yet.

### Annotating

JS annotation (text within `<script>` of `*.vue` files or text in `*.js` files) follows this for the most part: https://www.npmjs.com/package/vue-gettext#1b-annotating-strings-in-javascript-code--js-or-vue-files

```js
// Singular text
$gettext('Hello')

// Adding a comment to singular text; add a litteral JS comment above $gettext() like so:

// $t: This is a comment for good morning
$gettext('Good morning')

// Add "this" within <script> or in *.js files; "this" in VueJS references the root Vue component, which has plugins, libraries, routers and other APIs loaded in; gettext is a VueJS plugin.
this.$gettext('Hello')

// Add context to a text for a translator
$pgettext('Verb', 'Book') // eg. book an appointment
$pgettext('Noun', 'Book') // eg. read a book

// Plural text with interpolation. Format in: 'singular phrase', 'plural phrase', counter
// See StationSelect.vue as example
$ngettext('There is %{count} car', 'There are %{count} cars', count)

// Context and plural
$npgettext('Context description', 'I have %{n} book.', 'I have %{n} books', n)

// Interpolation + Translate; must use with $gettext to tag for translation
this.$_i(this.$gettext('The date range you have specified contains {numBands} bands and is too large to fit within the file limit (255).'), {numBands: this.dateRangeNumMonths})
// or passing in "this" as the interpolation object
this.$_i(this.$gettext('Showing {startEntryOfPage} to {lastEntryOfPage} of {filteredNumEntries} (filtered from {totalSize} total entries)'), this)
```

Text annotation in HTML or within `<template>` parts of `*.vue` files.
```html
<!-- Singular -->
<translate>Hello</translate>

<!-- Singular text in existing HTML tags: v-translate -->
<p v-translate>Hello</p>

<!-- Add comments for translator -->
<p v-translate :t-comment="This is a greeting">Good morning</p>
<translate :t-comment="This is a greeting">Good morning</translate>

<!-- Add context for translator -->
<button v-translate :t-context="Verb" :t-comment="Button to book an appointment">Book</button>
<button v-translate :t-context="Noun" :t-comment="Button to download a book">Book</button>

<!-- Plural text -->
<!-- ":" is short for "v-bind:" -->
<span v-translate :t-n="count" :t-plural="%{count} cars">%{count} car</span>
<translate :t-n="count" :t-plural="%{count} cars">%{count} car</translate>
```

Refer to this issue report for further discussion on using the plugin: https://github.com/eldarc/vue-i18n-gettext/issues/50

### Extracting and Compiling

```bash
# Extracting vue templates (.vue) and js files (.js) to locales/po/dictionary.pot file
npm run gettext-extract

# Compiling locales/po/*.po file(s) into a sanitized JSON file in locales/json/translations.json
npm run gettext-compile
```

You can also the source code examples specified in https://github.com/eldarc/test-vue-i18n-gettext for further annotation and scripting details.

### Converting fr.po Files to CSV

- Delete the `locales/po/untranslated.csv` file if exists

```bash
# Reads locales/po/fr.po and converts to locales/po/untranslated.csv
npm run po2csv
```

- Send `untranslated.csv` to translations.

### Converting fr.csv to fr.po

- Delete the `locales/po/fr_new.po` file if exists
- Delete the `locales/po/fr.csv` file if exists
- Receive the completed translations CSV file
- Rename the completed CSV translation file to `fr.csv` and place in `locales/po/`

```bash
# Converts the locales/po/fr.csv to locales/po/fr_new.po
npm run csv2po
```

- Open `fr_new.po` in Poedit to verify the translations
- If all looks good, replace existing `fr.po` with `fr_new.po`

### Updating .po Files With New Changes

1. Make translation edits in the UI (`*.vue` and `*.js` files) and annotate as mentioned above.
2. Extract the latest text marked for translations: `npm run gettext-extract`
3. Open the current existing `locales/po/fr.po` file in Poedit
4. Use Poedit program to merge the latest text from `locales/po/dictionary.pot` file
    - Catalog -> Update from POT file...
    - Save
5. Send the `fr.po` file to translator, or perform translations yourself as required in Poedit
6. Save the updated `fr.po` file to your repository
7. Compile the translations into the UI: `npm run gettext-compile`
8. Rebuild: `npm run build`
