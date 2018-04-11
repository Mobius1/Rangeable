/**
 * Create DOM element helper
 * @param  {String}   a nodeName
 * @param  {String|Object}   b className or properties / attributes
 * @return {Object}
 */
const createElement = (type, obj) => {
	const el = document.createElement(type);

	if (typeof obj === "string") {
		el.classList.add(obj);
	} else if ( obj === Object(obj) ) {
		for ( let prop in obj ) {
			if ( prop in el ) {
				el[prop] = obj[prop];
			} else {
				el.setAttribute(el[prop], obj[prop]);
			}
		}
	}

	return el;
}

const isFunction = (func) => {
	return func && typeof func === "function";
}

// throttler
const throttle = (fn, limit, context) => {
	let wait;
	return function() {
		context = context || this;
		if (!wait) {
			fn.apply(context, arguments);
			wait = true;
			return setTimeout(function() {
				wait = false;
			}, limit);
		}
	};
}

export { createElement, isFunction, throttle }