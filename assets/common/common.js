﻿String.prototype.format = function () {
	var args = arguments;
	var s = this;
	if (!args || args.length < 1) {
		return s;
	}
	var r = s;
	for (var i = 0; i < args.length; i++) {
		var reg = new RegExp('\\{' + i + '\\}');
		r = r.replace(reg, args[i]);
	}
	return r;
};
window.simplecopy = function (from, target) {
	var r = target || {};
	var self = from;
	for (var i in self) {
		try {
			r[i] = self[i];
		} catch (e) {
			console.log(e);
		}
	}
	return r;
}
window.spawn = function (o) {
	var r = {};
	if (o instanceof Array || o.length) {
		r = [];
		for (var i = 0; i < o.length; i++) {
			r[r.length] = o[i];
		}
	}
	for (var i in o) {
		if (!r[i] && o[i]) {
			r[i] = o[i];
		}
	}
	return r;
};
Date.prototype.pattern = function (fmt) {
	var o = {
		"M+": this.getMonth() + 1, //Month         
		"d+": this.getDate(), //Day of month         
		"h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //Hour 12
		"H+": this.getHours(), // Hour 24
		"m+": this.getMinutes(), // Minute
		"s+": this.getSeconds(), // Second         
		"q+": Math.floor((this.getMonth() + 3) / 3), // Season         
		"S": this.getMilliseconds() // Millisecond         
	};
	var week = {
		"0": "/u65e5",
		"1": "/u4e00",
		"2": "/u4e8c",
		"3": "/u4e09",
		"4": "/u56db",
		"5": "/u4e94",
		"6": "/u516d"
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	if (/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
};
Date.prototype.diff = function (d) {
	var t = d || new Date();
	var s = this;
	var r = { hour: t.getHours() - s.getHours(), minute: t.getMinutes() - s.getMinutes(), second: t.getSeconds() - s.getSeconds(), msecond: t.getMilliseconds() - s.getMilliseconds() };
	return r.msecond + r.second * 1000 + r.minute * 60 * 1000 + r.hour * 60 * 60 * 1000;
};
Array.prototype.add = function (o) {
	this[this.length] = o;
};
Array.prototype.last = function (n, fn) {
	var r = this[this.length - n];
	if (fn && r) {
		return fn(r);
	} return r;
};
Array.prototype.clear = function () {
	var q = this;
	while (q.length > 0) {
		var i = q.pop();
		delete i;
	}
};

function List(destroyer) {
	var a = new Array();
	a.add = function (o) {
		a[a.length] = o;
	};
	a.del = function (o) {
		var t = typeof (o);
		var index = -1;
		if (t == 'object') {
			for (var i = 0; i < this.length; i++) {
				if (this[i] == o) {
					index = i;
					break;
				}
			}
		} else {
			index = parseInt(o);
			if (isNaN(index)) {
				index = -1;
			}
		}
		if (index >= 0 && index < this.length) {
			for (var j = i; j > 0; j--) {
				this[j] = this[j - 1];
			}
			this.pop();
		}
	};
	a.clear = function () {
		for (var i = 0; i < this.length; i++) {
			var item = this.pop();
			if (destroyer) {
				destroyer(item);
			}
			if (item) {
				delete item;
				item = null;
			}
		}
	};
	return a;
}

function destroy(el) {
	var div = document.body.$destroyer$ || document.createElement('div');
	div.appendChild(el);
	div.innerHTML = '';
	document.body.$destroyer$ = div;
}

function Dict(destroyer) {
	var o = {};
	o.exist = function (key) {
		if (this[key]) {
			return true;
		}
		return false;
	}
	return o;
}

function agent() {
	var s = navigator.userAgent.toLowerCase();
	return {
		isAndroid: function () {
			return s.indexOf('android') >= 0;
		}, isIos: function () {
			return s.indexOf('ipad') >= 0 || s.indexOf('iphone') >= 0;
		}, isMobile: function () {
			return this.isAndroid() || this.isIos();
		}, text: function () {
			return s;
		}
	}
}

function attr(el, name, val) {
	if (el && el.tagName && name) {
		if (val) {
			el.setAttributeNS(null, name, val);
		} else {
			return el.getAttribute(name) || el.getAttributeNS(null, name) || el[name];
		}
	}
}

function rs(el, prop) {
	if (document.defaultView && document.defaultView.getComputedStyle) {
		return document.defaultView.getComputedStyle(el, null)[prop];
	} else if (el.currentStyle) {
		return el.currentStyle[prop];
	} else {
		return el.style[prop];
	}
}

(function () {
	var topindex = 0;
	window.nextdepth = function () {
		return ++topindex;
	};

	function initel(element) {
		element.style.zIndex = nextdepth();
		element.depth = function () {
			var el = this;
			try {
				var z = rs(el, 'z-index');
				if (isNaN(z)) {
					return depth(el.parentNode);
				}
				console.log(el.tagName);
				return parseInt(z);
			} catch (e) {
				console.log(e);
				return -1;
			}
		}
	}

	function initdepth(el) {
		if (!el) {
			el = document;
		}
		initel(el);
		var all = el.getElementsByTagName('*');
		for (var i = 0; i < all.length; i++) {
			var element = all[i];
			initel(element);
		}
	}

	function depth(el) {
		initdepth(el);
	}

	window.depth = depth;
})();

function rc(o, rel) {
	if (!o) {
		console.log('Null reference (rect)');
		return {};
	}

	if (o.getBoundingClientRect) {
		var r = o.getBoundingClientRect();
		var rr = { top: r.top, left: r.left, bottom: r.bottom, right: r.right, width: r.right - r.left, height: r.bottom - r.top, depth: depth(o) };
		if (rel) {
			var rrr = rel;
			if (rel.getBoundingClientRect) {
				rrr = rel.getBoundingClientRect();
			}
			rr.top -= rrr.top;
			rr.left -= rrr.left;
		}
		rr.point2in = function (pos) {
			var x = pos[0];
			var y = pos[1];
			if (x < this.left || y < this.top || x > this.right || y > this.bottom) {
				return false;
			}
			return true;
		};
		return rr;
	}
	console.log('getBoundingClientRect missing');
	return {};
}

function within(q, target, act) {
	if (q && q.length > 0) {
		var tcs = q[q.length - 1];
		if (tcs.length > 0) {
			for (var i = 0; i < tcs.length; i++) {
				var ei = tcs[i];
				return ei.act == act && document.elementFromPoint(ei.pos[0], ei.pos[1]) == target;
			}
		}
	}
	return false;
}

function centerscreen(el) {
	var re = el.getBoundingClientRect();
	var wd = $(document).width();
	var hd = $(document).height();
	var we = re.right - re.left;
	var he = re.bottom - re.top;
	var left = (wd - we) / 2;
	var top = (hd - he) / 2;
	el.style.left = left + 'px';
	el.style.top = top + 'px';
	return el;
}

function overlay(c) {
	var el = document.body.$overlayel$;
	var oel = null;

	if (!el) {
		el = document.createElement('div');
		el.className = 'overlay';
		oel = document.createElement('div');
		oel.className = 'overlaybox';
		el.oel = oel;
		el.hide = function () {
			var oel = this.oel;
			$(oel).hide();
			$(this).hide();
		};
		document.body.appendChild(el);
		document.body.appendChild(oel);
		document.body.$overlayel$ = el;
	} else {
		oel = el.oel;
	}

	if (c && c.style) {
		
	}

	if (!c || !c.hide) {
		$(el).show();
		$(oel).show();
	} else {
		$(el).hide();
		$(oel).hide();
	}

	oel.innerHTML = '';
	return oel;
}

function datestr(d) {
	if (!d) {
		d = new Date();
	}
	var s = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	return s;
}

function fromJson(s) {
	if (!s) {
		return {};
	}
	try {
		var r = JSON.parse(s);
		if (!r) {
			r = eval('(' + s + ')');
		}
		return r;
	} catch (e) {
		return eval('(' + s + ')');
	}
}