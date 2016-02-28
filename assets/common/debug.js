(function () {

	function showBound(rect, id, color) {
		if (!color) {
			color = 'red';
		}
		var pn = '$b$' + id;
		var div = document.body[pn] || document.createElement('div');

		if (!document.body[pn]) {
			div.style.position = 'absolute';
			document.body.appendChild(div);
			document.body[pn] = div;
			return div;
		}
		div.style.left = parseFloat(rect.left) + 'px';
		div.style.top = parseFloat(rect.top) + 'px';
		div.style.width = parseFloat(rect.width) + 'px';
		div.style.height = parseFloat(rect.height) + 'px';
		div.style.border = 'solid 1px ' + color;
		return div;
	}

	function actualStyle(el, props) {
		var compStyle = window.getComputedStyle(el, null);
		for (var i = 0; i < props.length; i++) {
			var style = compStyle[props[i]];
			if (style != null) {
				return style;
			}
		}
		return null;
	}

	function showPoint(pt, id, color, parent) {
		if (!parent) {
			parent = document.body;
		}
		if (!id) {
			id = '$pt$';
		}
		if (!color) {
			color = 'green';
		}
		var k = '$pt$' + id;
		var div = parent[k];
		if (!div) {
			div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.width = '24px';
			div.style.height = '24px';
			parent[k] = div;
			parent.appendChild(div);
		}
		div.style.left = pt[0] + 'px';
		div.style.top = pt[1] + 'px';
		div.style.borderLeft = 'solid 1px ' + color;
		div.style.borderTop = 'solid 1px ' + color;
		return div;
	}

	function simulate(element, eventName) {
		var options = extend(defaultOptions, arguments[2] || {});
		var oEvent, eventType = null;

		for (var name in eventMatchers) {
			if (eventMatchers[name].test(eventName)) { eventType = name; break; }
		}

		if (!eventType)
			throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

		if (document.createEvent) {
			oEvent = document.createEvent(eventType);
			if (eventType == 'HTMLEvents') {
				oEvent.initEvent(eventName, options.bubbles, options.cancelable);
			}
			else {
				oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
			}
			element.dispatchEvent(oEvent);
		}
		else {
			options.clientX = options.pointerX;
			options.clientY = options.pointerY;
			var evt = document.createEventObject();
			oEvent = extend(evt, options);
			element.fireEvent('on' + eventName, oEvent);
		}
		return element;
	}

	function log(msg, id) {
		if (!id) {
			id = 'dftlog';
		}
		var div = document.body[id] || document.createElement('div');
		if (!document.body[id]) {
			document.body[id] = div;
			div.style.position = 'fixed';
			div.style.right = '24px';
			div.style.top = '24px';
			div.style.bottom = '24px';
			div.style.width = '200px';
			div.style.overflow = 'auto';
			document.body.appendChild(div);
		}
		div.innerHTML += msg + '<br />';
	}

	function extend(destination, source) {
		for (var property in source)
			destination[property] = source[property];
		return destination;
	}

	var eventMatchers = {
		'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
		'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
	}

	var defaultOptions = {
		pointerX: 0,
		pointerY: 0,
		button: 0,
		ctrlKey: false,
		altKey: false,
		shiftKey: false,
		metaKey: false,
		bubbles: true,
		cancelable: true
	};

	window.d = {
		bound: showBound,
		astyle: actualStyle,
		point: showPoint,
		sim: simulate,
		log: log
	};
})();
