# climate-data-extraction-tool

Canadian Centre for Climate Services [Climate Data Extraction Tool](https://climate-change.canada.ca/climate-data)

Use the climate data extraction tool to download climate data from the selected
Environment and Climate Change Canada datasets. You can specify the date
ranges, variables, download format and other options.


## Build Setup

- Install [nodejs](https://nodejs.org)
- Install npm packages

```sh
git clone https://github.com/ECCC-CCCS/climate-data-extraction-tool.git
cd climate-data-extraction-tool
npm install
```

- Edit your `.env` file with your application settings

```sh
vi .env

# Optionally, save the file as .env.{modeName} and build for specific modes
npx vue-cli-service build --mode {modeName}

# You can specify env variables by placing the following files in your project root:
.env                # loaded in all cases
.env.local          # loaded in all cases, ignored by git
.env.[mode]         # only loaded in specified mode
.env.[mode].local   # only loaded in specified mode, ignored by git
```

See the [CLI Service guide](https://cli.vuejs.org/guide/cli-service.html) for additional Vue CLI commands and options

### Compiles and hot-reloads for development
```sh
# http://localhost:8080/ using .env (and .env.development if exists)
npm run serve

# OR use npx vue-cli-service for expanded command line functionality
npx vue-cli-service serve
```

### Compiles and minifies for production
```sh
# Simple output to /dist with default settings (.env)
npm run build

# If you have a specific environment config you want to build with (ie. a .env.stage file)
npx vue-cli-service build --mode stage
```

### Lints and fixes files
```sh
npm run lint
```

## Vue UI
For a dashboard interface on your local web browser, run:

```sh
vue ui
```

## Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Environment variables
See [Modes and Environment Variables](https://cli.vuejs.org/guide/mode-and-env.html#modes)


For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Translations

Translation is done through a plugin: https://github.com/eldarc/vue-i18n-gettext
This plugin is not officially released yet. But the advantage is that it provides an all-in-one package for gettext extraction and compiling. There is no guide released yet.

```sh
# npm packages for vue-i18n-gettext
npm install vue-i18n-gettext vue-gettext vue-gettext-tools
npm install babel-runtime --save-dev
```

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
$pgettext('This word is a verb', 'Book') // eg. book an appointment
$pgettext('This word is a noun', 'Book') // eg. read a book

// Plural text with interpolation. Format in: 'singular phrase', 'plural phrase', counter
// See StationSelect.vue as example
$ngettext('There is %{count} car', 'There are %{count} cars', count)

// Context and plural
$npgettext('Context: %{n} represents the number of books', 'I have %{n} book.', 'I have %{n} books', n)

// Interpolation + Translate; must use with $gettext to tag for translation
this.$_i(this.$gettext('The date range you have specified contains {numBands} bands and is too large to fit within the file limit (255).'), {numBands: this.dateRangeNumMonths})
// or passing in "this" from your Vue component as the interpolation object
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

## Tagging and Releases

Releases are created in Github with a tag (X.Y.Z). Descriptions of each release must be in English and French where it is seperated by 2 new lines (carriage returns). The header of each version must be included as the first line in each language.

Here is an example format:
```
Release version 1.12.2:
- Fix to single location download by CSV


Version 1.12.2:
- Correction du téléchargement des données pour un point de grille unique sous forme CSV
```

## Testing

Cypress E2E testing is used as the UI heavily relies on the web services to work.

Start up Cypress E2E test UI:
```sh
# test with .env only
npm run test:e2e

# test with .env.testing (and .env)
npx vue-cli-service test:e2e --mode testing

# headless mode
npx vue-cli-service test:e2e --mode testing --headless
```

When initiated, it will start up a dev instance on localhost, which relies on your `.env.testing` (and `.env`) file. Modify your `.env` files accordingly for testing.
