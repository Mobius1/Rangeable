/*!
 *
 * Rangeable
 * Copyright (c) 2018 Karl Saunders (mobius1(at)gmx(dot)com)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 0.1.2
 *
 */
(function(root, factory) {
    var plugin = "Rangeable";

    if (typeof exports === "object") {
        module.exports = factory(plugin);
    } else if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root[plugin] = factory(plugin);
    }
})(typeof global !== 'undefined' ? global : this.window || this.global, function() {
    "use strict";

    const version = "0.1.2";

    /* HELPERS*/

    /**
     * addEventListener shortcut
     * @param  {HTMLElement}   	el
     * @param  {String}   		type
     * @param  {Function} 		callback
     * @return {Void}
     */
    const on = (el, type, callback) => {
        el.addEventListener(type, callback, false);
    };

    /**
     * removeEventListener shortcut
     * @param  {HTMLElement}   	el
     * @param  {String}   		type
     * @param  {Function} 		callback
     * @return {Void}
     */
    const off = (el, type, callback) => {
        el.removeEventListener(type, callback);
    };

    /**
     * createElement helper
     * @param  {String} 	type
     * @param  {String} 	obj
     * @return {HTMLElement}
     */
    const createElement = function(type, obj) {
        const el = document.createElement(type);
        if (obj) {
            el.classList.add(obj);
        }
        return el;
    };

    /**
     * Check prop is defined and it is a function
     * @param  {Mixed}  func
     * @return {Boolean}
     */
    const isFunction = function(func) {
        return func && typeof func === "function";
    };

    /**
     * Throttle for resize / scroll
     * @param  {Function} fn
     * @param  {Number}   limit
     * @param  {Object}   context
     * @return {Function}
     */
    const throttle = function(fn, limit, context) {
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
    };

    /**
     * Rangeable
     * @param {String|HTMLElement} input
     * @param {Object} config
     */
    const Rangeable = function(input, config) {
        this.plugins = ["ruler"];
        const defaultConfig = {
            type: "single",
            tooltips: "always",
            updateThrottle: 30,
            classes: {
                input: "rangeable-input",
                container: "rangeable-container",
                vertical: "rangeable-vertical",
                progress: "rangeable-progress",
                handle: "rangeable-handle",
                track: "rangeable-track",
                multiple: "rangeable-multiple",
                disabled: "rangeable-disabled",
                tooltips: "rangeable-tooltips",
                tooltip: "rangeable-tooltip",
                visible: "rangeable-tooltips--visible",
            }
        };

        // user has passed a CSS3 selector string
        if (typeof input === "string") {
            input = document.querySelector(input);
        }

        this.input = input;
        this.config = Object.assign({}, defaultConfig, config);

        this.mouseAxis = {
            x: "clientX",
            y: "clientY"
        };
        this.trackSize = {
            x: "width",
            y: "height"
        };
        this.trackPos = {
            x: "left",
            y: "top"
        };
        this.lastPos = 0;
        this.double =
            this.config.type === "double" || Array.isArray(this.config.value);
        this.touch =
            "ontouchstart" in window ||
            (window.DocumentTouch && document instanceof DocumentTouch);
        this.version = version;

        this.init();

        this.onInit();
    };

    /**
     * Initialise the instance
     * @return {Void}
     */
    Rangeable.prototype.init = function() {
        if (!this.input.rangeable) {
            const props = {
                min: 0,
                max: 100,
                step: 1,
                value: this.input.value
            };

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

            this.axis = !this.config.vertical ? "x" : "y";

            this.input.rangeable = this;

            if (this.double) {
                this.input.values = this.config.value ?
                    this.config.value :
                    [this.input.min, this.input.max];
                this.input.defaultValues = this.input.values.slice();
            } else {
                if (!this.input.defaultValue) {
                    this.input.defaultValue = this.input.value;
                }
            }

            this.render();

            this.initialised = true;
        }
    }

    /**
     * Render the instance
     * @return {Void}
     */
    Rangeable.prototype.render = function() {
        const o = this.config;
        const c = o.classes;

        const container = createElement("div", c.container);
        const track = createElement("div", c.track);
        const progress = createElement("div", c.progress);

        let handle = createElement("div", c.handle);
        let tooltip = createElement("div", c.tooltip);

        this.input.tabIndex = -1;

        if (this.double) {
            handle = [
                createElement("div", c.handle),
                createElement("div", c.handle)
            ];
            tooltip = [
                createElement("div", c.tooltip),
                createElement("div", c.tooltip),
                createElement("div", c.tooltip)
            ];

            handle.forEach((node, i) => {
                node.index = i;
                progress.appendChild(node);
                node.appendChild(tooltip[i]);
                node.tabIndex = 1;

                // locked handles?
                if (o.handles && o.handles[i]) {
                    if (o.handles[i].locked && o.handles[i].locked === true) {
                        node.locked = true;
                    }
                }
            });

            if (o.vertical) {
                progress.appendChild(handle[0]);
            }

            progress.appendChild(tooltip[2]);

            container.classList.add(c.multiple);
        } else {
            progress.appendChild(handle);
            handle.appendChild(tooltip);

            handle.tabIndex = 1;

            // locked handle?
            if (o.handle) {
                if (o.handle.locked && o.handle.locked === true) {
                    handle.locked = true;
                }
            }
        }

        container.appendChild(track);

        if (o.vertical) {
            container.classList.add(c.vertical);
        }

        if (o.size) {
            container.style[this.trackSize[this.axis]] = !isNaN(o.size) ?
                `${o.size}px` :
                o.size;
        }

        if (o.tooltips) {
            container.classList.add(c.tooltips);

            if (typeof o.tooltips === "string" && o.tooltips === "always") {
                container.classList.add(c.visible);
            }
        }

        this.nodes = {
            container,
            track,
            progress,
            handle,
            tooltip
        };

        if (this.double) {
            if (o.handles) {
                this.nodes.buffers = [];
                this.limits = [];
                const buffers = createElement("div", "rangeable-buffers");

                o.handles.forEach((obj, i) => {
                    if (obj.min !== undefined && obj.max !== undefined) {
                        const buffer = createElement("div", "rangeable-buffer");

                        buffers.appendChild(buffer);

                        this.nodes.buffers.push(buffer);

                        this.limits[i] = {
                            min: obj.min,
                            max: obj.max
                        };
                    }
                });

                track.appendChild(buffers);
            }
        } else {
            if (o.handle) {
                if (o.handle.min !== undefined && o.handle.max !== undefined) {
                    const buffer = createElement("div", "rangeable-buffer");

                    track.appendChild(buffer);

                    this.nodes.buffer = buffer;

                    this.limits = {
                        min: o.handle.min,
                        max: o.handle.max
                    };
                }
            }
        }

        track.appendChild(progress);

        this.input.parentNode.insertBefore(container, this.input);
        container.insertBefore(this.input, track);

        this.input.classList.add(c.input);

        this.bind();

        this.setLimits();

        this.update();
    }

    /**
     * Reset the value(s) to default
     * @return {Void}
     */
    Rangeable.prototype.reset = function() {
        if (this.double) {
            this.input.defaultValues.forEach(this.setValue, this);
        } else {
            this.setValue(this.input.defaultValue);
        }
        this.onEnd();
    }

    /**
     * Set the value from the position of pointer over the track
     * @param {Object} e
     */
    Rangeable.prototype.setValueFromPosition = function(e) {
        const limits = this.getLimits();
        const step = parseFloat(this.input.step);
        const rect = this.rects;
        const axis = this.touch ?
            e.touches[0][this.mouseAxis[this.axis]] :
            e[this.mouseAxis[this.axis]];
        const point = axis - this.rects.container[this.trackPos[this.axis]];
        const size = rect.container[this.trackSize[this.axis]];

        if (e.type === "mousedown") {
            if (
                (!this.double && this.nodes.handle.contains(e.target)) ||
                (this.double &&
                    (this.nodes.handle[0].contains(e.target) ||
                        this.nodes.handle[1].contains(e.target)))
            ) {
                return false;
            }
        }

        // get the position of the cursor over the bar as a percentage
        let position = this.config.vertical ?
            (size - point) / size * 100 :
            point / size * 100;

        // work out the value from the position
        let val = position * (limits.max - limits.min) / 100 + limits.min;

        // apply granularity (step)
        val = Math.ceil(val / step) * step;

        if (axis >= this.lastPos) {
            val -= step;
        }

        // prevent change event from firing if slider hasn't moved
        if (parseFloat(val) === parseFloat(this.startValue)) {
            return false;
        }

        let index = false;

        if (this.double) {
            index = this.activeHandle.index;
        }

        val = this.limit(val, index);

        this.setValue(val, index);
    }

    /**
     * Mousedown / touchstart callback
     * @param  {Object} e
     * @return {Void}
     */
    Rangeable.prototype.start = function(e) {
        e.preventDefault();

        this.startValue = this.getValue();

        this.onStart();
        // show the tip now so we can get the dimensions later
        this.nodes.container.classList.add("dragging");

        this.recalculate();

        this.activeHandle = this.getHandle(e);

        if (!this.activeHandle) {
            return false;
        }

        this.activeHandle.classList.add("active");

        this.setValueFromPosition(e);

        if (this.touch) {
            on(document, "touchmove", this.events.move);
            on(document, "touchend", this.events.stop);
            on(document, "touchcancel", this.events.stop);
        } else {
            on(document, "mousemove", this.events.move);
            on(document, "mouseup", this.events.stop);
        }
    }

    /**
     * Mousemove / touchmove callback
     * @param  {Object} e
     * @return {Void}
     */
    Rangeable.prototype.move = function(e) {
        this.setValueFromPosition(e);
        this.lastPos = this.touch ?
            e.touches[0][this.mouseAxis[this.axis]] :
            e[this.mouseAxis[this.axis]];
    }

    /**
     * Mouseup / touchend callback
     * @param  {Object} e
     * @return {Void}
     */
    Rangeable.prototype.stop = function(e) {
        this.stopValue = this.getValue();

        this.nodes.container.classList.remove("dragging");

        this.onEnd();

        this.activeHandle.classList.remove("active");
        this.activeHandle = false;

        if (this.touch) {
            off(document, "touchmove", this.events.move);
            off(document, "touchend", this.events.stop);
            off(document, "touchcancel", this.events.stop);
        } else {
            off(document, "mousemove", this.events.move);
            off(document, "mouseup", this.events.stop);
        }

        if (this.startValue !== this.stopValue) {
            this.input.dispatchEvent(new Event("change"));
        }

        this.startValue = null;
    }

    /**
     * Keydown callback
     * @param  {Object} e
     * @return {Void}
     */
    Rangeable.prototype.keydown = function(e) {
        const step = (index) => {
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowUp':
                    this.stepUp(index);
                    break;
                case 'ArrowLeft':
                case 'ArrowDown':
                    this.stepDown(index);
                    break;
            }
        };

        if (this.double) {
            this.nodes.handle.forEach(node => {
                if (node === document.activeElement) {
                    step(node.index);
                }
            });
        } else {
            if (this.nodes.handle === document.activeElement) {
                step();
            }
        }
    }

    /**
     * Increase the value by step
     * @param  {Number} index
     * @return {Void}
     */
    Rangeable.prototype.stepUp = function(index) {
        const step = parseFloat(this.input.step);

        let val = this.getValue();

        if (this.double && index !== undefined) {
            val = val[index];
        }

        let newval = this.limit(parseFloat(val) + step, index);

        this.setValue(newval, index);
    }

    /**
     * Decrease the value by step
     * @param  {Number} index
     * @return {Void}
     */
    Rangeable.prototype.stepDown = function(index) {
        const step = parseFloat(this.input.step);

        let val = this.getValue();

        if (this.double && index !== undefined) {
            val = val[index];
        }

        let newval = this.limit(parseFloat(val) - step, index);

        this.setValue(newval, index);
    }

    /**
     * Check the value is within the limits
     * @param  {Number} value
     * @param  {Number} index
     * @return {Number}
     */
    Rangeable.prototype.limit = function(value, index) {
        const el = this.input;
        const limits = this.getLimits();

        if (this.double && index !== undefined) {
            if (!index && value > el.values[1]) {
                value = el.values[1];
            } else if (index && value < el.values[0]) {
                value = el.values[0];
            }

            if (this.limits) {
                if (!index) {
                    if (value > this.limits[0].max) {
                        value = this.limits[0].max;
                    } else if (value < this.limits[0].min) {
                        value = this.limits[0].min;
                    }
                } else {
                    if (value > this.limits[1].max) {
                        value = this.limits[1].max;
                    } else if (value < this.limits[1].min) {
                        value = this.limits[1].min;
                    }
                }
            }
        } else {
            if (this.limits) {
                if (value > this.limits.max) {
                    value = this.limits.max;
                } else if (value < this.limits.min) {
                    value = this.limits.min;
                }
            }
        }

        if (value > limits.max) {
            value = limits.max;
        } else if (value < limits.min) {
            value = limits.min;
        }

        value = parseFloat(value);

        value = value.toFixed(this.accuracy);

        return value;
    }

    /**
     * Recache dimensions
     * @return {Void}
     */
    Rangeable.prototype.recalculate = function() {
        let handle = [];

        if (this.double) {
            this.nodes.handle.forEach((node, i) => {
                handle[i] = node.getBoundingClientRect();
            });
        } else {
            handle = this.nodes.handle.getBoundingClientRect();
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
    Rangeable.prototype.update = function() {
        this.recalculate();

        this.accuracy = 0;

        // detect float
        if (this.input.step.includes(".")) {
            this.accuracy = (this.input.step.split(".")[1] || []).length;
        }

        const value = this.getValue();
        const limits = this.getLimits();
        const size = this.rects.container[this.trackSize[this.axis]];

        const setStyle = (el, offset, m) => {
            el.style[this.config.vertical ? "bottom" : "left"] = `${offset}px`;
            el.style[this.trackSize[this.axis]] = `${(m / limits.max * size) - offset}px`;
        };

        if (this.double) {
            // set buffers
            if (this.config.handles && this.nodes.buffers) {
                this.limits.forEach((o, i) => {
                    setStyle(this.nodes.buffers[i], (o.min / limits.max * size), o.max);
                });
            }

            this.input.values.forEach((val, i) => {
                this.setValue(this.limit(val, i), i);
            });
        } else {
            // set buffer
            if (this.config.handle) {
                setStyle(this.nodes.buffer, (this.limits.min / limits.max * size), this.limits.max);
            }
            this.setValue(this.limit(value));
        }
    }

    /**
     * Get the current value(s)
     * @return {Number|Array}
     */
    Rangeable.prototype.getValue = function() {
        return this.double ? this.input.values : this.input.value;
    }

    /**
     * Set the current value(s)
     * @param {Number} value
     * @param {Number} index
     */
    Rangeable.prototype.setValue = function(value, index) {
        const rects = this.rects;
        const nodes = this.nodes;

        let handle = nodes.handle;

        if (this.double) {
            if (index === undefined) {
                return false;
            }

            handle = this.activeHandle ? this.activeHandle : nodes.handle[index];
        }

        if (value === undefined) {
            value = this.input.value;
        }

        value = this.limit(value, index);

        const doChange =
            this.initialised && (value !== this.input.value || this.nativeEvent);

        // update the value
        if (this.double) {
            const values = this.input.values;
            values[index] = value;

            if (this.config.tooltips) {
                // update the node so we can get the width / height
                nodes.tooltip[index].textContent = value;

                // check if tips are intersecting...
                const a = nodes.tooltip[0].getBoundingClientRect();
                const b = nodes.tooltip[1].getBoundingClientRect();
                const intersect = !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);

                // ... and set the className where appropriate
                nodes.container.classList.toggle("combined-tooltip", intersect);

                if (intersect) {
                    // Format the combined tooltip.
                    // Only show single value if they both match, otherwise show both seperated by a hyphen
                    nodes.tooltip[2].textContent =
                        values[0] === values[1] ? values[0] : `${values[0]} - ${values[1]}`;
                }
            }
        } else {
            this.input.value = value;
            nodes.tooltip.textContent = value;
        }

        // set bar size
        this.setPosition(value, index);

        if (doChange) {
            this.onChange();

            if (!this.nativeEvent) {
                this.input.dispatchEvent(new Event("input"));
            }

            this.nativeEvent = false;
        }
    }

    /**
     * Native callback
     * @return {Void}
     */
    Rangeable.prototype.native = function() {
        this.nativeEvent = true;

        this.setValue();
    }

    Rangeable.prototype.getLimits = function() {
        return {
            min: parseFloat(this.input.min),
            max: parseFloat(this.input.max)
        };
    };

    /**
     * Set the buffer
     * @param {[type]} value [description]
     */
    Rangeable.prototype.setLimits = function(config) {
        if (config === undefined) {
            config = this.double ? this.config.handles : this.config.handle;
        }

        const setLimit = (limit, o) => {
            if (o.min !== undefined) {
                limit.min = o.min;
            }
            if (o.max !== undefined) {
                limit.max = o.max;
            }
        };

        if (this.double) {
            config.forEach((o, i) => {
                setLimit(this.limits[i], o);
            });
        } else {
            setLimit(this.limits, config);
        }

        this.update();
    }

    /**
     * Set the postion / size of the progress bar.
     * @param {[type]} value [description]
     */
    Rangeable.prototype.setPosition = function(value) {
        let width;

        if (this.double) {
            let start = this.getPosition(this.input.values[0]);
            let end = this.getPosition(this.input.values[1]);

            // set the start point of the bar
            this.nodes.progress.style[
                this.config.vertical ? "bottom" : "left"
            ] = `${start}px`;

            width = end - start;
        } else {
            width = this.getPosition();
        }

        // set the end point of the bar
        this.nodes.progress.style[this.trackSize[this.axis]] = `${width}px`;
    }

    /**
     * Get the position along the track from a value.
     * @param  {Number} value
     * @return {Number}
     */
    Rangeable.prototype.getPosition = function(value) {
        if (value === undefined) {
            value = this.input.value;
        }
        const limits = this.getLimits();

        return (
            (value - limits.min) / (limits.max - limits.min) * this.rects.container[this.trackSize[this.axis]]
        );
    }

    /**
     * Get the correct handle on mousedown / touchstart
     * @param  {Object} e
     * @return {Boolean|HTMLElement}
     */
    Rangeable.prototype.getHandle = function(e) {
        if (!this.double) {
            return this.nodes.handle.locked ? false : this.nodes.handle;
        }

        const r = this.rects;
        const distA = Math.abs(
            e[this.mouseAxis[this.axis]] - r.handle[0][this.trackPos[this.axis]]
        );
        const distB = Math.abs(
            e[this.mouseAxis[this.axis]] - r.handle[1][this.trackPos[this.axis]]
        );
        let handle = e.target.closest(`.${this.config.classes.handle}`);

        if (!handle) {
            if (distA > distB) {
                handle = this.nodes.handle[1];
            } else {
                handle = this.nodes.handle[0];
            }
        }

        return handle.locked ? false : handle;
    }

    /**
     * Enable the instance
     * @return {Void}
     */
    Rangeable.prototype.enable = function() {
        if (this.input.disabled) {
            on(this.nodes.container,
                this.touch ? "touchstart" : "mousedown",
                this.events.start
            );

            if (this.double) {
                this.nodes.handle.forEach(el => el.tabIndex = 1);
            } else {
                this.nodes.handle.tabIndex = 1;
            }

            this.nodes.container.classList.remove(this.config.classes.disabled);

            this.input.disabled = false;
        }
    }

    /**
     * Disable the instance
     * @return {Void}
     */
    Rangeable.prototype.disable = function() {
        if (!this.input.disabled) {
            off(this.nodes.container,
                this.touch ? "touchstart" : "mousedown",
                this.events.start
            );

            if (this.double) {
                this.nodes.handle.forEach(el => el.removeAttribute("tabindex"));
            } else {
                this.nodes.handle.removeAttribute("tabindex");
            }

            this.nodes.container.classList.add(this.config.classes.disabled);

            this.input.disabled = true;
        }
    }

    /**
     * Add event listeners
     * @return {Void}
     */
    Rangeable.prototype.bind = function() {
        this.events = {};
        const events = ["start", "move", "stop", "update", "reset", "native", "keydown"];

        // bind so we can remove later
        events.forEach(event => {
            this.events[event] = this[event].bind(this);
        });

        this.events.scroll = throttle(this.events.update, this.config.updateThrottle);
        this.events.resize = throttle(this.events.update, this.config.updateThrottle);

        // throttle the scroll callback for performance
        on(document, "scroll", this.events.scroll);

        // throttle the resize callback for performance
        on(window, "resize", this.events.resize);

        // key control
        on(document, "keydown", this.events.keydown);

        // touchstart/mousedown
        on(this.nodes.container,
            this.touch ? "touchstart" : "mousedown",
            this.events.start
        );

        // listen for native input to allow keyboard control on focus
        on(this.input, "input", this.events.native);

        // detect form reset
        if (this.input.form) {
            on(this.input.form, "reset", this.events.reset);
        }
    }

    /**
     * Remove event listeners
     * @return {Void}
     */
    Rangeable.prototype.unbind = function() {
        // throttle the scroll callback for performance
        off(document, "scroll", this.events.scroll);

        // throttle the resize callback for performance
        off(window, "resize", this.events.resize);

        off(document, "keydown", this.events.keydown);

        off(this.nodes.container,
            this.touch ? "touchstart" : "mousedown",
            this.events.start
        );

        // listen for native input to allow keyboard control on focus
        off(this.input, "input", this.events.native);

        // detect form reset
        if (this.input.form) {
            off(this.input.form, "reset", this.events.reset);
        }

        this.events = null;
    }

    /**
     * Destroy the instance
     * @return {Void}
     */
    Rangeable.prototype.destroy = function() {
        if (this.input.rangeable) {
            // remove all event events
            this.unbind();

            // remove the className from the input
            this.input.classList.remove(this.config.classes.input);

            // kill all nodes
            this.nodes.container.parentNode.replaceChild(
                this.input,
                this.nodes.container
            );

            // remove the reference from the input
            delete this.input.rangeable;

            this.initialised = false;
        }
    }

    /**
     * onInit callback
     * @return {Void}
     */
    Rangeable.prototype.onInit = function() {
        if (isFunction(this.config.onInit)) {
            this.config.onInit.call(this, this.getValue());
        }
    }

    /**
     * onStart callback
     * @return {Void}
     */
    Rangeable.prototype.onStart = function() {
        if (isFunction(this.config.onStart)) {
            this.config.onStart.call(this, this.getValue());
        }
    }

    /**
     * onChange callback
     * @return {Void}
     */
    Rangeable.prototype.onChange = function() {
        if (isFunction(this.config.onChange)) {
            this.config.onChange.call(this, this.getValue());
        }
    }

    /**
     * onEnd callback
     * @return {Void}
     */
    Rangeable.prototype.onEnd = function() {
        if (isFunction(this.config.onEnd)) {
            this.config.onEnd.call(this, this.getValue());
        }
    }

    return Rangeable;
});