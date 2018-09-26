# default node.js assets for frontend development

---

## What's this?

Default settings for new website project using node.js/gulp.

## How to use

* Install `Node.js`
* Move to project directory.
* Install with `npm install`
* Launch with `npm start`

## Requirement

* `Node.js`

## Available Features

* SCSS compile
* EJS compile
* ES6 transpile using `babel`
* css/js/image minify
* Browser sync

## Available Scripts

### `npm start`

Build everything and launch development server.
Default port is 3000.
Uses external ip as default address.

### `npm run build`

Build every sources only with development mode.

### `npm run clean`

Remove `dist` directories.

### `npm run release` / `npm run winrelease`

Remove `dist` direcrotories and build sources with production mode.
`npm run release` is for macOS user.
`npm run winrelease` is for Windows user.