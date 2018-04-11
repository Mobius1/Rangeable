# Rangeable

A small dependency-free lib to transform `<input type="range">` elements into something prettier and more configurable.

- [x] No dependencies
- [x] <3kb gzipped
- [x] IE10+
- [x] Touch enabled
- [x] Responsive
- [x] Single or double handles.
- [x] Fully stylable to fit your apps needs.

** Rangeable is still in active development and therefore the API is in constant flux until `v1.0.0`. Check back regularly for any changes and make sure you have the latest version installed.**

## [Demo](https://s.codepen.io/Mobius1/debug/WzNLLz)

---

## Install

### npm
```
npm install rangeable --save
```

---

### Browser

Grab the file from one of the CDNs and include it in your page:

```
https://unpkg.com/rangeable@latest/dist/rangeable.min.js
```
or

```
https://cdn.jsdelivr.net/npm/rangeable@latest/dist/rangeable.min.js
```

You can replace `latest` with the required release number if needed.

---

### Default

Create a new instance:

```javascript
const rangeable = new Rangeable(input, options);
```

You can pass either a reference to the input or a CSS3 selector string:

```javascript
const myRangeInput = document.getElementById('myRangeInput');
const rangeable = new Rangeable(myRangeInput);

// or

const rangeable = new Rangeable('#myRangeInput');
```

## Options

[See Options](https://github.com/Mobius1/Rangeable/wiki/Options)

---

## Public Methods

[See Public Methods](https://github.com/Mobius1/Rangeable/wiki/Public-Methods)

---

Copyright © 2018 Karl Saunders | BSD & MIT license