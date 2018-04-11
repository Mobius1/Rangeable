/*!
 *
 * Rangeable
 * Copyright (c) 2018 Karl Saunders
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 0.0.7
 *
 */
class Rangeable {
	constructor(input, config) {
		const defaultConfig = {
			type: "single",
			tooltips: "always",
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
		};

		// user has passed a CSS3 selector string
		if (typeof input === "string") {
			input = document.querySelector(input);
		}

		this.input 		= input;
		this.config 	= Object.assign({}, defaultConfig, config);

		this.mouseAxis 	= { x: "clientX", y: "clientY" };
		this.trackSize 	= { x: "width", y: "height" };
		this.trackPos 	= { x: "left", y: "top" };

		this.double = this.config.type === "double" || Array.isArray(this.config.value);

		this.touch 		= "ontouchstart" in window || (window.DocumentTouch && document instanceof DocumentTouch);

		this.init();

		this.onInit();
	}

	/**
	 * Initialise the instance
	 * @return {Void}
	 */
	init() {
		if ( !this.input.rangeable ) {
			const props = { min: 0, max: 100, step: 1, value: this.input.value };

			for (let prop in props) {
				// prop is missing, so add it
				if (!this.input[prop]) {
					this.input[prop] = props[prop];
				}

				// prop set in config
				if (this.config[prop] !== undefined) {
					this.input[prop] = this.config[prop];
				}
			}

			if (!this.input.defaultValue) {
				this.input.defaultValue = this.input.value;
			}

			this.axis = !this.config.vertical ? "x" : "y";

			this.input.rangeable = this;

			if ( this.double ) {
				this.input.values = this.config.value ? this.config.value : [this.input.min, this.input.max];
			}

			this.render();

			this.initialised = true;
		}
	}

	/**
	 * Render the instance
	 * @return {Void}
	 */
	render() {
		const o = this.config;
		const c = o.classes;

		const container = this.createElement("div", c.container);
		const track = this.createElement("div", c.track);
		const progress = this.createElement("div", c.progress);

		let handle = this.createElement("div", c.handle);
		let tooltip = this.createElement("div", c.tooltip);

		track.appendChild(progress);

		if ( this.double ) {
			handle = [this.createElement("div", c.handle),	this.createElement("div", c.handle)];
			tooltip = [
				this.createElement("div", c.tooltip),
				this.createElement("div", c.tooltip),
				this.createElement("div", c.tooltip)
			];

			handle.forEach((node, i) => {
				node.index = i;
				progress.appendChild(node);
				node.appendChild(tooltip[i]);
			});

			if ( o.vertical ) {
				progress.appendChild(handle[0]);
			}

			progress.appendChild(tooltip[2]);

			container.classList.add(c.multiple);
		} else {
			progress.appendChild(handle);
			handle.appendChild(tooltip);
		}

		this.nodes = { container, track, progress, handle, tooltip };

		container.appendChild(track);

		if (o.vertical) {
			container.classList.add(c.vertical);
		}

		if (o.size) {
			container.style[this.trackSize[this.axis]] = !isNaN(o.size)
				? `${o.size}px`
				: o.size;
		}

		if (o.tooltips) {
			container.classList.add("has-tooltip");

			if ( typeof o.tooltips === "string" && o.tooltips === "always" ) {
				container.classList.add("show-tooltip");
			}
		}

		this.input.parentNode.insertBefore(container, this.input);
		container.insertBefore(this.input, track);

		this.input.classList.add(c.input);

		this.bind();

		this.update();
	}

	reset() {
		this.setValue(this.input.defaultValue);
		this.onEnd();
	}

	setValueFromPosition(e) {
		const min = parseFloat(this.input.min);
		const max = parseFloat(this.input.max);
		const step = parseFloat(this.input.step);
		const rect = this.rects;
		const axis = this.touch ? e.touches[0][this.mouseAxis[this.axis]] : e[this.mouseAxis[this.axis]];
		const pos = axis - this.rects.container[this.trackPos[this.axis]];
		const size = rect.container[this.trackSize[this.axis]];

		// get the position of the cursor over the bar as a percentage
		let position = this.config.vertical
			? (size - pos) / size * 100
			: pos / size * 100;

		// work out the value from the position
		let value = position * (max - min) / 100 + min;

		// apply granularity (step)
		value = Math.ceil(value / step) * step;

		let index = false;

		if ( this.double ) {
			index = this.activeHandle.index;

			switch(index) {
				case 0:
					if ( value >= this.input.values[1] ) {
						value = this.input.values[1];
					}
					break;
				case 1:
					if ( value <= this.input.values[0] ) {
						value = this.input.values[0];
					}
					break;
			}
		}

		// Only update the value if it's different.
		// This allows the onChange event to be fired only on a step
		// and not all the time.
		if (e.type === "mousedown" || parseFloat(value) !== parseFloat(this.input.value)) {
			this.setValue(value, index);
		}
	}

	change() {
		// this.onChange();
	}

	touchstart(e) {
		// this.nodes.container.removeEventListener("mousedown", this.events.down);

		this.down(e);
	}

	/**
	 * Mousesown / touchstart method
	 * @param  {Object} e
	 * @return {Void}
	 */
	down(e) {
		e.preventDefault();

		this.startValue = this.getValue();

		this.onStart();
		// show the tip now so we can get the dimensions later
		this.nodes.container.classList.add("dragging");

		this.recalculate();

		this.activeHandle = this.getHandle(e);

		this.activeHandle.classList.add('active');

		this.setValueFromPosition(e);

		if ( this.touch ) {
			document.addEventListener("touchmove", this.listeners.move, false);
			document.addEventListener("touchend", this.listeners.up, false);
			document.addEventListener("touchcancel", this.listeners.up, false);
		} else {
			document.addEventListener("mousemove", this.listeners.move, false);
			document.addEventListener("mouseup", this.listeners.up, false);
		}
	}

	/**
	 * Mousemove / touchmove method
	 * @param  {Object} e
	 * @return {Void}
	 */
	move(e) {
		this.setValueFromPosition(e);
	}

	/**
	 * Mouseup / touchend method
	 * @param  {Object} e
	 * @return {Void}
	 */
	up(e) {
		this.stopValue = this.getValue();

		this.nodes.container.classList.remove("dragging");

		this.onEnd();

		this.activeHandle.classList.remove('active');
		this.activeHandle = false;

		document.removeEventListener("mousemove", this.listeners.move);
		document.removeEventListener("mouseup", this.listeners.up);

		document.removeEventListener("touchmove", this.listeners.move);
		document.removeEventListener("touchend", this.listeners.up);
		document.removeEventListener("touchcancel", this.listeners.up);

		if ( this.startValue !== this.stopValue ) {
			this.input.dispatchEvent(new Event("change"));
		}

		this.startValue = null;
	}

	/**
	 * Recache the dimensions
	 * @return {Void}
	 */
	recalculate() {
		let handle = [];

		if ( this.double ) {
			this.nodes.handle.forEach((node, i) => {
				handle[i] = node.getBoundingClientRect();
			});
		} else {
			handle = this.nodes.handle.getBoundingClientRect()
		}

		this.rects = {
			handle: handle,
			container: this.nodes.container.getBoundingClientRect()
		};
	}

	/**
	 * Update the instance
	 * @return {Void}
	 */
	update() {
		this.recalculate();

		this.accuracy = 0;

		// detect float
		if ( this.input.step.includes(".") ) {
			this.accuracy = (this.input.step.split('.')[1] || []).length;
		}

		if ( this.double ) {
			this.input.values.forEach((val, i) => {
				this.setValue(val, i);
			});
		} else {
			this.setValue();
		}
	}

	getValue() {
		return this.double ? this.input.values : this.input.value;
	}

	parseValue(value) {
		const min = parseFloat(this.input.min);
		const max = parseFloat(this.input.max);

		if (value === undefined) {
			value = this.input.value;
		}

		value = parseFloat(value);

		value = value.toFixed(this.accuracy);

		if (value < min) {
			value = min.toFixed(this.accuracy);
		} else if (value > max) {
			value = max.toFixed(this.accuracy);
		}
		return value;
	}

	/**
	 * Set the input value
	 * @param {Number} value
	 * @param {Number} index
	 */
	setValue(value, index) {
		const rects = this.rects;
		const nodes = this.nodes;

		let handle = nodes.handle;

		value = this.parseValue(value);

		if ( this.double && index === undefined ) {
			return false;
		}

		if ( this.double ) {
			handle = this.activeHandle ? this.activeHandle : nodes.handle[index];
		}

		const doChange = this.initialised && value !== this.input.value;

		// update the value
		if ( this.double ) {
			const values = this.input.values;
			values[index] = value;

			if ( this.config.tooltips ) {
				// update the node so we can get the width / height
				nodes.tooltip[index].textContent = value;

				// check if tips are intersecting...
				const intersecting = this.tipsIntersecting();

				// ... and set the className where appropriate
				nodes.container.classList.toggle("combined-tooltip", intersecting);

				if ( intersecting ) {
					// Format the combined tooltip.
					// Only show single value if they both match, otherwise show both seperated by a hyphen
					nodes.tooltip[2].textContent = values[0] === values[1] ? values[0] : `${values[0]} - ${values[1]}`;
				}
		}
		} else {
			this.input.value = value;
			nodes.tooltip.textContent = value;
		}

		// set bar size
		this.setPosition(value, index);

		if ( doChange ) {
			this.onChange();

			this.input.dispatchEvent(new Event("input"));
		}
	}

	/**
	 * Set the bar size / position based on the value
	 * @param {Number} value
	 */
	setPosition(value) {
		let width;

		if ( this.double ) {
			let start = this.getPosition(this.input.values[0]);
			let end = this.getPosition(this.input.values[1]);

			// set the start point of the bar
			this.nodes.progress.style[this.config.vertical?"bottom":"left"] = `${start}px`;

			width = end - start;
		} else {
			width = this.getPosition();
		}

		// set the end point of the bar
		this.nodes.progress.style[this.trackSize[this.axis]] = `${width}px`;
	}

	/**
	 * Get the position of handle from the value
	 * @param  {Number} value The val to calculate the handle position
	 * @return {Number}
	 */
	getPosition(value = this.input.value) {
		const min = parseFloat(this.input.min);
		const max = parseFloat(this.input.max);

		return (value - min) / (max - min) * this.rects.container[this.trackSize[this.axis]];
	}

	/**
	 * Check whether the tooltips are colliding
	 * @return {Boolean}
	 */
	tipsIntersecting() {
		const nodes = this.nodes.tooltip;
		const a = nodes[0].getBoundingClientRect();
		const b = nodes[1].getBoundingClientRect();

		return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
	}

	/**
	 * Get the correct handle on mousedown / touchstart
	 * @param  {Object} e Event
	 * @return {Obejct} HTMLElement
	 */
	getHandle(e) {
		if ( !this.double ) {
			return this.nodes.handle;
		}

		const r = this.rects;
		const distA = Math.abs(e[this.mouseAxis[this.axis]] - r.handle[0][this.trackPos[this.axis]]);
		const distB = Math.abs(e[this.mouseAxis[this.axis]] - r.handle[1][this.trackPos[this.axis]]);
		const handle = e.target.closest(`.${this.config.classes.handle}`);

		if ( handle ) {
			return handle;
		} else {
			if ( distA > distB ) {
				return this.nodes.handle[1];
			} else {
				return this.nodes.handle[0];
			}
		}
	}

	/**
	 * Destroy the instance
	 * @return {Void}
	 */
	destroy() {
		if ( this.input.rangeable ) {
			// remove all event listeners
			this.unbind();

			// remove the className from the input
			this.input.classList.remove(this.config.classes.input);

			// kill all nodes
			this.nodes.container.parentNode.replaceChild(this.input, this.nodes.container);

			// remove the reference from the input
			delete(this.input.rangeable);

			this.initialised = false;
		}
	}

	onInit() {
		if (this.isFunction(this.config.onInit)) {
			this.config.onInit.call(this, this.getValue());
		}
	}

	onStart() {
		if (this.isFunction(this.config.onStart)) {
			this.config.onStart.call(this, this.getValue());
		}
	}

	onChange() {
		if (this.isFunction(this.config.onChange)) {
			this.config.onChange.call(this, this.getValue());
		}
	}

	onEnd() {
		if (this.isFunction(this.config.onEnd)) {
			this.config.onEnd.call(this, this.getValue());
		}
	}

	bind() {
		this.listeners = {
			down: this.down.bind(this),
			touchstart: this.touchstart.bind(this),
			move: this.move.bind(this),
			up: this.up.bind(this),
			update: this.update.bind(this),
			change: this.change.bind(this),
			reset: this.reset.bind(this)
		};

		this.listeners.scroll = this.throttle(this.listeners.update, 100);
		this.listeners.resize = this.throttle(this.listeners.update, 50);

		// throttle the scroll callback for performance
		document.addEventListener("scroll", this.listeners.scroll, false);

		// throttle the resize callback for performance
		window.addEventListener("resize", this.listeners.resize, false);

		// detect native change event
		this.input.addEventListener("change", this.listeners.change, false);

		if ( this.touch ) {
			this.nodes.container.addEventListener("touchstart", this.listeners.touchstart, false);
		} else {
			this.nodes.container.addEventListener("mousedown", this.listeners.down);
		}

		// detect form reset
		if (this.input.form) {
			this.input.form.addEventListener("reset", this.listeners.reset, false);
		}
	}

	unbind() {

		if ( this.touch ) {
			this.nodes.container.removeEventListener("touchstart", this.listeners.touchstart);
		} else {
			this.nodes.container.removeEventListener("mousedown", this.listeners.down);
		}

		// remove scroll listener
		document.removeEventListener("scroll", this.listeners.scroll);

		// remove resize listener
		window.removeEventListener("resize", this.listeners.resize);

		// remove input listener
		this.input.removeEventListener("change", this.listeners.change);

		// remove form listener
		if (this.input.form) {
			this.input.form.removeEventListener("reset", this.listeners.reset);
		}

		this.listeners = null;
	}
	/**
	 * Create DOM element helper
	 * @param  {String}   a nodeName
	 * @param  {String|Object}   b className or properties / attributes
	 * @return {Object}
	 */
	createElement(type, obj) {
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

	isFunction(func) {
		return func && typeof func === "function";
	}

	// throttler
	throttle(fn, limit, context) {
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
}