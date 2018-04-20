# Rangeable
[![npm version](https://badge.fury.io/js/rangeable.svg)](https://badge.fury.io/js/rangeable) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/Mobius1/Rangeable/blob/master/LICENSE) [![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/Mobius1/Rangeable.svg)](http://isitmaintained.com/project/Mobius1/Rangeable "Average time to resolve an issue") [![Percentage of issues still open](http://isitmaintained.com/badge/open/Mobius1/Rangeable.svg)](http://isitmaintained.com/project/Mobius1/Rangeable "Percentage of issues still open") ![](http://img.badgesize.io/Mobius1/Rangeable/master/dist/rangeable.min.js) ![](http://img.badgesize.io/Mobius1/Rangeable/master/dist/rangeable.min.js?compression=gzip&label=gzipped)

A dependency-free, responsive and touch-enabled vanilla javascript range slider to make `<input type="range">` elements prettier and more configurable.

- [x] No dependencies
- [x] 3kb gzipped
- [x] Touch enabled
- [x] Responsive
- [x] Single or double range layouts.
- [x] Horizontal and vertical orientations.
- [x] Fully stylable to fit your app.

![Rangeable](/docs/rangeable.png?raw=true "Rangeable")

** Rangeable is still in active development and therefore the API is in constant flux until `v1.0.0`. Check back regularly for any changes and make sure you have the latest version installed.**

## [Live Demos](https://codepen.io/collection/AEWWkz/)

---

## Install

### npm
```
npm install rangeable --save
```

---

### Browser

Grab the files from one of the CDNs and include them in your page:

```
https://unpkg.com/rangeable@latest/dist/rangeable.min.css
https://unpkg.com/rangeable@latest/dist/rangeable.min.js
```

You can replace `latest` with the required release number if needed.

---

### Default

Create a new instance:

```javascript
const rangeable = new Rangeable(input, {
    type: "single",
    tooltips: "always",
    min: 0,
    max: 100,
    step: 1,
    value: 50,
    vertical: false,
    controls: undefined,
    onInit: function() {
        // do something when the instance has loaded
    },
    onStart: function() {
        // do something on mousedown/touchstart
    },
    onChange: function() {
        // do something when the value changes
    },
    onEnd: function() {
        // do something on mouseup/touchend
    }
});
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