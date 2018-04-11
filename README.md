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

## [Live Demos](https://codepen.io/collection/AEWWkz/)

---

## Install

### npm
```
npm install rangeable --save
```

---

### Browser

Grab the files from one of the CDNs and include it in your page:

```
https://unpkg.com/rangeable@latest/dist/rangeable.min.css
https://unpkg.com/rangeable@latest/dist/rangeable.min.js
```

or

```
https://cdn.jsdelivr.net/npm/rangeable@latest/dist/rangeable.min.css
https://cdn.jsdelivr.net/npm/rangeable@latest/dist/rangeable.min.js
```

You can replace `latest` with the required release number if needed.

---

### Default

Create a new instance:

```javascript
const rangeable = new Rangeable(input, {
    type: "single",
    tooltips: "always",
    onInit: function() {
        // do something when the instance has loaded
    },
    onStart: function() {
        // do something on mousedown/touchstart
    },
    onChange: function() {
        // do something on mousemove/touchmove or
        // when the value changes by other means
    },
    onEnd: function() {
        // do something on mouseup/touchend
    },
    classes: {
        input: "rangeable-input",
        container: "rangeable-container",
        vertical: "rangeable-vertical",
        progress: "rangeable-progress",
        handle: "rangeable-handle",
        tooltip: "rangeable-tooltip",
        track: "rangeable-track",
        multiple: "rangeable-multiple",
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