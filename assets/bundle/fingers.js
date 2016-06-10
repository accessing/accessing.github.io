function acts(a, t) {
	if (!a) {
		debugger;
	}
	if (!a.indexOf && a.act) {
		a = a.act;
	} else if (!a.indexOf) {
		debugger;
	}
	if (a.indexOf(t) == 0) {
		return true;
	}
	return false;
}

// Queue Recognizer ///////////////////////////////////////////////////////////////////////////////////////////////
// 1. Enqueue
// 2. Pickup parser
// 3. Output queue
// 4. Trigger event
function Recognizer(cfg) {
	var qs = [[], []];
	if (!cfg) {
		cfg = {};
	}
	function check(condition, c) {
		// Condition format: {q: 1, step:[1,1], point:[1,1]}
		var cd = condition;
		var q = qs[condition.q];
		if (q.length >= cd.step[0]) {
			if (cd.point) {
				for (var i = q.length - cd.step[1]; i < q.length; i++) {
					var qi = q[i];
					if (!qi) {
						continue;
					}
					if (qi.length < cd.point[0] || qi.length > cd.point[1]) {
						if (qi && qi.length > 0) {
							console.log(qi[0].act + ' point mismatch');
						} else {
							console.log('Point condition failed');
						}

						return false;
					}
				}
			}
			return true;
		} else {
			return false;
		}
	}
	function kickevt(c) {
		var iq = qs[0];
		var oq = qs[1];
		//var oqlen = c.oqlen || 12;
		for (var i = 0; i < c.parser.length; i++) {
			var psr = c.parser[i]();
			if (psr.condition) {
				// Pattern condition satisfied
				// Begin recognization
				if ((typeof (psr.condition) == 'function' && psr.condition(qs)) || check(psr.condition)) {
					var act = psr.verify(qs);
					if (act) {
						// Recognize complete, adding to output queue
						oq.add(act);
						iq.clear();
						//if (oq.length >= oqlen) {
						//	oq.splice(0, 1);
						//}
						if (c.recognizing && c.recognizing.qchanged) {
							// On recognize complete
							c.recognizing.qchanged(oq);
						}
						if (c.capture && c.capture.qchanged) {
							// Input queue empty will be able to notify input queue clearing logic
							c.capture.qchanged(iq);
						}
						break;
					}
				}
			} else {
				console.log('Checked ' + psr.condition);
			}
		}
	}
	if (!cfg.parser) {
		console.log('Parser missing for recognizer');
	}
	var r = {
		parse: function (act) {
			// Format: [{ act: name, pos: [x, y], rpos: [rx, ry], time:d }]
			if (!cfg.parser) {
				return;
			}
			var c = cfg;
			if (c.capture && c.capture.parse) {
				c.capture.parse(act);
			}
			var iqlen = c.iqlen || 8;
			var inqueue = qs[0];
			inqueue.add(act);
			if (inqueue.length > iqlen) {
				inqueue.splice(0, 1);
			}
			var outqueue = qs[1];
			if (outqueue.length > iqlen) {
				outqueue.splice(0, 1);
			}

			// Capture mouse move before recognition
			if (c.capture && c.capture.qchanged) {
				c.capture.qchanged(inqueue);
			}
			kickevt(c);
		}
	};
	return r;
}
// Parser ///////////////////////////////////////////////////////////////////////////////////////////////
function zoomParser() {

	function getAngle(a, b) {
		var px1 = a[0];
		var px2 = b[0];
		var py1 = a[1];
		var py2 = b[1];

		// Distance (x, y)
		x = px2 - px1;
		y = py2 - py1;
		hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

		// Distance
		cos = x / hypotenuse;
		radian = Math.acos(cos);

		// Radius
		if (x == 0 || radian == 0) {
			return 0;
		}
		angle = 180 / (Math.PI / radian);

		// Radius to angle       
		if (y < 0) {
			angle = -angle;
		} else if ((y == 0) && (x < 0)) {
			angle = 180;
		}
		return angle;
	}

	////////////////////////////////////////////////////
	// Calculate middle point of zoom finger positions
	function calc(q) {
		var a = q[0];
		var b = q[1];
		var ar = a.rpos;
		var br = b.rpos;
		// Actual position of the screen
		var pos = [(a.pos[0] + b.pos[0]) / 2, (a.pos[1] + b.pos[1]) / 2];

		// Relative position from the element
		var rpos = [(a.rpos[0] + b.rpos[0]) / 2, (a.rpos[1] + b.rpos[1]) / 2];
		var xlen = ar[0] - br[0];
		var ylen = ar[1] - br[1];
		var len = Math.sqrt(xlen * xlen + ylen * ylen);
		var angle = getAngle(ar, br);
		return { pos: pos, rpos: rpos, len: len, angle: angle, xlen: Math.abs(xlen), ylen: Math.abs(ylen) };
	}

	var r = {
		condition: {
			q: 0
			, step: [1, 1]
			, point: [1, 2]
		}
		, verify: function (qs, start, end) {
			var q = qs[0];
			var oq = qs[1];
			if (!q || !oq) {
				console.log('q / oq undefined [pin]');
				return false;
			}
			var curt = q.last(1);
			var olast = oq.last(1);
			var point = curt.length == 2 ? calc(curt) : curt[0];
			if (!point.rpos) {
				debugger;
			}
			if (curt.length == 1 && olast && (acts(olast, 'zooming') || acts(olast, 'zoomstart'))) {
				return { act: 'zoomend', pos: point.pos, rpos: point.rpos, time: new Date(), len: point.len, angle: point.angle, xlen: point.xlen, ylen: point.ylen };
			} else if (curt.length == 2 && (acts(curt[0], 'touchend') || acts(curt[1], 'touchend'))) {
				return { act: 'zoomend', pos: point.pos, rpos: point.rpos, time: new Date(), len: point.len, angle: point.angle, xlen: point.xlen, ylen: point.ylen };
			} else if (curt.length == 2 && (!olast || (!acts(olast, 'zooming') && !acts(olast, 'zoomstart')))) {
				return { act: 'zoomstart', pos: point.pos, rpos: point.rpos, time: new Date(), len: point.len, angle: point.angle, xlen: point.xlen, ylen: point.ylen };
			} else if (curt.length == 2) {
				return { act: 'zooming', pos: point.pos, rpos: point.rpos, time: new Date(), len: point.len, angle: point.angle, xlen: point.xlen, ylen: point.ylen };
			}
			//console.log('evt not match');
			return false;
		}
	};
	return r;
}
function singleTouchedParser() {
	var r = {
		condition: {
			q: 0
			, step: [2, 3]
			, point: [1, 1]
		}
		, verify: function (qs, start, end) {
			var q = qs[0];
			if (!q) {
				console.log('q undefined');
				return false;
			}
			if (!start) {
				start = 0;
			}
			if (!end) {
				end = q.length - 1;
			}
			var sa = q[end - 2] ? q[end - 2][0] : null;
			var ma = q[end - 1][0];
			var ea = q[end][0];
			if (!sa) {
				sa = ma;
			}
			if ((acts(sa.act, 'touchstart') && (acts(ea.act, 'touchend') || acts(ma.act, 'touchend'))) || (acts(ma.act, 'touchstart') && acts(ea.act, 'touchend'))) {
				return { act: 'touched', pos: ea.pos, rpos: ea.rpos, time: new Date() };
			}
			//console.log('evt not match');
			return false;
		}
	};
	return r;
}
function dragParser() {
	var r = {
		condition: {
			q: 0
			, step: [1, 2]
			, point: [1, 1]
		}
		, verify: function (qs, start, end) {
			var q = qs[0];
			var oq = qs[1];
			if (!q || !oq) {
				console.log('q / oq undefined');
				return false;
			}
			if (!start) {
				start = 0;
			}
			if (!end) {
				end = q.length - 1;
			}
			var sa = q.length == 1 ? null : q[end - 1][0];
			var ea = q[end][0];
			var oa = oq[oq.length - 1];
			if (acts(ea.act, 'touchend') && oa && (acts(oa.act, 'dragging') || acts(oa.act, 'dragstart'))) {
				return { act: 'dropped', pos: ea.pos, rpos: ea.rpos, time: new Date() };
			} else if (sa && acts(sa.act, 'touchstart') && acts(ea.act, 'touchmove')) {
				return { act: 'dragstart', pos: ea.pos, rpos: ea.rpos, time: new Date() };
			} else if (sa && oa && acts(sa.act, 'touchmove') && (acts(oa.act, 'dragstart') || acts(oa.act, 'dragging'))) {
				return { act: 'dragging', pos: ea.pos, rpos: ea.rpos, time: new Date() };
			} else if (sa && acts(sa.act, 'touchmove') && acts(ea.act, 'touchend')) {
				return { act: 'dropped', pos: ea.pos, rpos: ea.rpos, time: new Date() };
			}
			//console.log('evt not match');
			return false;
		}
	};
	return r;
}
function dblTouchedParser() {
	var r = {
		condition: {
			q: 0
			, step: [2, 2]
			, point: [1, 1]
		}
		, verify: function (qs, start, end) {
			var st = singleTouchedParser();
			st = st.verify(qs, start, end);
			if (!st) {
				return false;
			} else {
				var q = qs[1];
				if (!q || q.length < 1) {
					return false;
				}
				if (!end) {
					end = q.length - 1;
				}
				var ea = q[end];
				if (!ea) {
					return false;
				}
				var ta = st.time;
				var te = ea.time;
				var d = te.diff(ta);
				if (d < 400 && acts(st.act, 'touched') && acts(ea.act, 'touched')) {
					return { act: 'dbltouched', pos: ea.pos, rpos: ea.rpos, time: new Date() };
				}
				return false;
			}
		}
	};
	return r;
}
function touch(cfg) {
	function showTouches(target, q) {
		function showTouch(target, t) {
			if (t.act.indexOf('touch') >= 0) {
				var r = 14;
				var div = document.createElement('div');
				div.style.position = 'absolute';
				div.style.left = t.rpos[0] - r + 'px';
				div.style.top = t.rpos[1] - r + 'px';
				div.style.width = r * 2 + 'px';
				div.style.height = r * 2 + 'px';
				div.style.borderRadius = r + 'px';
				div.style.border = 'solid 3px silver';
				div.style.background = 'none';
				div.$evtignore$ = true;
				target.appendChild(div);
			}
		}
		var d = null;
		if (!target.$touches$) {
			d = document.createElement('div');
			target.$touches$ = d;
			target.appendChild(d);
		} else {
			d = target.$touches$;
			d.innerHTML = '';
		}
		if (!q) {
			return;
		}
		if (q instanceof Array) {
			for (var i = 0; i < q.length; i++) {
				var list = q[i];
				if (list instanceof Array) {
					for (var j = 0; j < list.length; j++) {
						var item = list[j];
						showTouch(d, item);
					}
				} else {
					showTouch(d, list);
				}
			}
		} else {
			showTouch(d, q);
		}
	}

	var handlers = {};

	function pointdiff() {
		var r = {};
		r.opos = [0, 0];
		r.pos = [0, 0];
		r.fpos = [0, 0];
		r.origin = function (pt) {
			this.opos = [pt[0], pt[1]];
			this.fpos = [pt[0], pt[1]];
			this.pos = [pt[0], pt[1]];
		}
		r.update = function (pt, offset) {
			if (!offset) {
				offset = [0, 0];
			} else {
				offset = [pt[0] - this.pos[0], pt[1] - this.pos[1]];
				this.opos[0] += offset[0];
				this.opos[1] += offset[1];
			}
			this.pos = [pt[0], pt[1]];
			this.flip();
		}
		r.flip = function () {
			var o = this.opos;
			var p = this.pos;
			var t = [o[0] * 2 - p[0], o[1] * 2 - p[1]];
			this.fpos = t;
			return t;
		}
		r.offset
		return r;
	}
	if (!cfg) {
		cfg = {};
	}
	var target = cfg.target;
	var rel = cfg.rel;
	var pd = pointdiff();
	var rg = Recognizer({
		mode: 1,
		rel: rel,
		capture: {
			region: rel.getBoundingClientRect(),
			parse: function (q) {
				if (cfg.showtouch) {
					showTouches(document.body, q);
				}
			},
			qchanged: function (q) {
				//logq('raw', q);
				//d.logq(q)
				var rq = {};
				for (var j = 0; j < q.length; j++) {
					var it = q[j];
					if (!it.processed && handlers[it.act]) {
						if (!rq[it.act]) {
							rq[it.act] = [];
						}
						var tq = rq[it.act];
						tq.add(it);
					}
					it.processed = true;
				}
				for (var i in rq) {
					handlers[i](rq[i]);
				}
			}
		}, recognizing: {
			qchanged: function (q) {
				//logq('rec', q);
				for (var j = 0; j < q.length; j++) {
					var it = q[j];
					if (!it.processed && handlers[it.act]) {
						handlers[it.act](it);
					}
					it.processed = true;
				}
			}
		}, parser: [zoomParser, dblTouchedParser, dragParser, singleTouchedParser]
	});
	var qel = $(target)[0];
	qel.md = false;
	qel.zooming = false;
	if (!isMobile.any()) {
		qel.onmousemove = function (event) {
			if (!qel.zooming) {
				if (qel.md) {
					rg.parse([{ act: 'touchmove', pos: [event.clientX, event.clientY], rpos: [event.clientX, event.clientY], time: new Date() }]);
				} else {
					rg.parse([{ act: 'mousemove', pos: [event.clientX, event.clientY], rpos: [event.clientX, event.clientY], time: new Date() }]);
				}
			} else {
				pd.update([event.clientX, event.clientY], qel.of);
				rg.parse([
					{ act: 'touchmove', pos: [event.clientX, event.clientY], rpos: [event.clientX, event.clientY], time: new Date() },
					{ act: 'touchmove', pos: pd.fpos, rpos: pd.fpos, time: new Date() }
				]);
			}
		};

		qel.onmousedown = function (event) {
			qel.md = true;
			if (event.button == 0) {
				qel.zooming = false;
				rg.parse([{ act: 'touchstart', pos: [event.clientX, event.clientY], rpos: [event.clientX, event.clientY], time: new Date() }]);
			} else {
				qel.zooming = true;
				if (event.button == 1) {
					qel.of = true;
					event.preventDefault();
				} else {
					qel.of = false;
				}
				var dr = document.body.getBoundingClientRect();
				pd.origin([dr.width / 2, dr.height / 2]);
				pd.update([event.clientX, event.clientY]);
				rg.parse([
					{ act: 'touchstart', pos: pd.pos, rpos: pd.pos, time: new Date() },
					{ act: 'touchstart', pos: pd.fpos, rpos: pd.fpos, time: new Date() }
				]);
			}
		};

		qel.onmouseup = function (event) {
			qel.md = false;
			qel.zooming = false;
			qel.of = false;
			rg.parse([{ act: 'touchend', pos: [event.clientX, event.clientY], rpos: [event.clientX, event.clientY], time: new Date() }]);
		};
	} else {
		//alert('Mobile');
	}

	// Get native touches
	function getouches(event) {
		try {
			var r = event.touches;
			if (!r || r.length == 0) {
				r = event.targetTouches;
			}
			if (!r || r.length == 0) {
				r = event.changedTouches;
			}
			return r;
		} catch (e) {
			alert(e);
			return [];
		}
	}

	// Construct logic event
	function mtouchevt(name, touches, c) {
		var rr = [];

		for (var i = 0; i < touches.length; i++) {
			var e = touches[i];
			var x = e.clientX;
			var y = e.clientY;
			var rx = x;
			var ry = y;
			if (c.rel) {
				var r = c.rel.getBoundingClientRect();
				rx = x - r.left;
				ry = y - r.top;
			}
			var d = new Date();
			var rlt = { act: name, pos: [x, y], rpos: [rx, ry], time: d };
			rr[rr.length] = rlt;
		}
		return rr;
	}

	//for (var i = 0; i < qel.length; i++) {
	//	var nel = qel[i];
	var nel = qel;
	nel.ontouchstart = function (event) {
		var ths = getouches(event);
		var q = mtouchevt('touchstart', ths, { rel: rel });
		rg.parse(q);
		//event.preventDefault();
		event.stopPropagation();
		if (isSafari) {
			//event.preventDefault();
		}
	};
	nel.ontouchmove = function (event) {
		var ths = getouches(event);
		var q = mtouchevt('touchmove', ths, { rel: rel });
		rg.parse(q);
		//event.preventDefault();
		event.stopPropagation();
		if (isSafari) {
			event.preventDefault();
		}
	};
	nel.ontouchend = function (event) {
		var ths = getouches(event);
		var q = mtouchevt('touchend', ths, { rel: rel });
		rg.parse(q);
		//event.preventDefault();
		event.stopPropagation();
		if (isSafari) {
			//event.preventDefault();
		}
	};
	//}
	return {
		on: function (c) {
			for (var i in c) {
				handlers[i] = c[i];
			}
		}
	}
}
function Rotator(target, options) {
	function process(target, options) {
		var rc = target.getBoundingClientRect();
		target.style.left = target.astyle(['left']);
		target.style.top = target.astyle(['top']);
		if (!target.style.width) {
			target.style.width = target.astyle(['width']);
		}
		if (!target.style.height) {
			target.style.height = target.astyle(['height']);
		}
		target.$rot$ = {
			origin: { center: [rc.width / 2, rc.height / 2], angle: 0, scale: [1, 1], pos: [parseFloat(target.style.left), parseFloat(target.style.top)], sz: [parseFloat(target.style.width), parseFloat(target.style.height)] },
			cmt: { center: [rc.width / 2, rc.height / 2], angle: 0, scale: [1, 1], pos: [parseFloat(target.style.left), parseFloat(target.style.top)], sz: [parseFloat(target.style.width), parseFloat(target.style.height)] },
			cache: { center: [rc.width / 2, rc.height / 2], angle: 0, scale: [1, 1], pos: [parseFloat(target.style.left), parseFloat(target.style.top)], sz: [parseFloat(target.style.width), parseFloat(target.style.height)] },
			status: []
		};

		target.getcenter = function () {
			return this.$center$.getBoundingClientRect();
		};

		target.pushStatus = function () {
			var r = this.getcenter();
			var l = [parseFloat(this.style.left), parseFloat(this.style.top)];

			var s = { center: [r.left, r.top], pos: l };
			var q = this.$rot$.status;
			var p = q.length > 0 ? q[q.length - 1] : s;
			s.delta = { center: [s.center[0] - p.center[0], s.center[1] - p.center[1]], pos: [s.pos[0] - p.pos[0], s.pos[1] - p.pos[1]] };
			q[q.length] = s;
			if (q.length > 6) {
				this.$rot$.status = q.splice(0, 1);
			}
			return s;
		};

		target.origin = function (p) {
			//var a = this.$rot$.origin.angle;
			//var c = this.$rot$.origin.center;
			this.style.transformOrigin = p[0] + 'px ' + p[1] + 'px';
		};

		target.correct = function (status, poffset) {
			if (!poffset) {
				poffset = [0, 0];
			}
			var self = this;
			var d = status.delta;
			var x = parseFloat(self.style.left) - d.center[0];
			var y = parseFloat(self.style.top) - d.center[1];
			self.$rot$.offset = [poffset[0] + d.center[0], poffset[1] + d.center[1]];
			//self.$rot$.cache.pos[0] -= d.center[0];
			//self.$rot$.cache.pos[1] -= d.center[1];
			self.style.left = x + 'px';
			self.style.top = y + 'px';
			return self.$rot$.offset;
		};
		//target.initStatus = function () {
		//    var origin = this.$rot$.origin;
		//    var s = { pos: [parseFloat(this.style.left), parseFloat(this.style.top)], angle: origin.angle, scale: origin.scale };
		//    this.$rot$.cache = s;
		//    return s;
		//};
		target.commitStatus = function () {
			var rot = this.$rot$;
			rot.cmt = this.$rot$.cache;
			rot.cmt.pos = [parseFloat(this.style.left), parseFloat(this.style.top)];
			rot.cmt.sz = [parseFloat(this.style.width), parseFloat(this.style.height)];
			rot.cache = { angle: 0, scale: [1, 1], pos: [0, 0], sz: [0, 0] };
			rot.offset = [0, 0];
		};
		target.rotate2 = function (arg, undef) {
			if (!arg) {
				return this;
			}

			var cache = this.$rot$.cache;
			var origin = this.$rot$.cmt;
			var offset = this.$rot$.offset;
			var angle = arg.angle, center = arg.center, scale = arg.scale, pos = arg.pos, resize = arg.resize;

			if (!offset) {
				offset = [0, 0];
			}
			if (center !== undef) {
				this.pushStatus();
				this.origin(center);
				var cstatus = this.pushStatus();
				offset = this.correct(cstatus, offset);
			}

			if (angle || angle === 0) {
				cache.angle = origin.angle + angle;
				cache.angle = cache.angle % 360;
				//console.log(cache.angle);
			}

			if (resize) {
				cache.sz = [origin.sz[0] + resize[0], origin.sz[1] + resize[1]];
				if (cache.sz[0] < 10) {
					cache.sz[0] = 10;
				}
				if (cache.sz[1] < 10) {
					cache.sz[1] = 10;
				}
			}

			if (scale) {
				if (scale instanceof Array) {

				} else {
					var n = parseFloat(scale);
					scale = [n, n];
				}
				cache.scale = [origin.scale[0] * scale[0], origin.scale[1] * scale[1]];
			}

			if (pos) {
				cache.pos = [origin.pos[0] + pos[0] - offset[0], origin.pos[1] + pos[1] - offset[1]];
			}

			this.style.transform = 'rotateZ(' + cache.angle + 'deg) scale(' + cache.scale[0] + ',' + cache.scale[1] + ')';
			this.style.left = cache.pos[0] + 'px';
			this.style.top = cache.pos[1] + 'px';
			if (resize) {
				this.style.width = cache.sz[0] + 'px';
				this.style.height = cache.sz[1] + 'px';
			}

			this.pushStatus();

			return this;
		}
		target.rotate = function (arg, undef) {
			if (!arg) {
				return this;
			}

			var angle = arg.angle, center = arg.center, scale = arg.scale, offset = arg.offset;
			var self = this;
			var origin = self.$rot$.origin.angle;

			if (scale === undef) {
				scale = [1, 1];
			} else if (scale instanceof Array) {

			} else {
				var n = parseFloat(scale);
				if (n == 0) {
					n == 0.001;
				}
				scale = [n, n];
			}

			if (center !== undef) {
				this.pushStatus();
				this.origin(center);
				var cstatus = this.pushStatus();
				this.correct(cstatus);
			}

			if (angle !== undef) {
				var a = (angle + origin) % 360;
				self.style.transform = 'rotateZ(' + a + 'deg) scale(' + scale[0] + ',' + scale[1] + ')';
				self.$rot$.origin.angle = a;
			}

			if (offset) {
				self.style.left = parseFloat(self.style.left) + offset[0] + 'px';
				self.style.top = parseFloat(self.style.top) + offset[1] + 'px';
			}

			this.pushStatus();

			return this;
		};

		if (!target.$center$) {
			var center = document.createElement('div');
			center.style.position = 'absolute';
			//center.style.left = target.$rot$.origin.center[0] + 'px';
			//center.style.top = target.$rot$.origin.center[1] + 'px';
			center.style.left = '50%';
			center.style.top = '50%';

			center.style.width = '0px';
			center.style.height = '0px';
			center.style.border = 'solid 0px blue';

			target.appendChild(center);
			target.$center$ = center;
			target.origin(target.$rot$.origin.center);
			target.style.transform = 'rotate(0deg)';
			target.pushStatus();
		}
		return target;
	}

	return process(target);
}
(function () {
	function rpoint(event) {
		var pt = [0, 0];
		pt[0] = event.offsetX;
		pt[1] = event.offsetY;
		//	var tmp = event.originalEvent || {layerX:'undefined', layerY:'undefined'};
		//	d.log('op:' + event.offsetX + ',' + event.offsetY + ' olp:' + tmp.layerX + ',' + tmp.layerY + ' lp:' + event.layerX + ',' + event.layerY);
		//console.log(pt);
		return pt;
	}
	function rectbound(rect, rel) {
		var el = null;
		if (!rel.$bound$) {
			el = document.createElement('div');
			rel.appendChild(el);
			rel.$bound$ = el;
		} else {
			el = rel.$bound$;
		}
		el.style.border = 'solid 1px red';
		el.style.position = 'absolute';
		el.style.left = rect.left + 'px';
		el.style.top = rect.top + 'px';
		el.style.width = rect.width + 'px';
		el.style.height = rect.height + 'px';
	}
	function point2el(pt, rel) {
		var rc = rel.getBoundingClientRect();
		return [pt[0] - rc.left, pt[1] - rc.top];
	}
	function rectdiff(target, rel) {
		var trect = target.getBoundingClientRect();
		var rrect = rel.getBoundingClientRect();
		var drect = {
			left: trect.left - rrect.left,
			top: trect.top - rrect.top,
			right: trect.right - rrect.right,
			bottom: trect.bottom - rrect.bottom,
			width: trect.width,
			height: trect.height,
		};
		return drect;
	}
	function transformable(target, rel) {
		if (!target) {
			return;
		}
		if (!rel) {
			rel = document.body;
		}
		var drect = rectdiff(target, rel);
		if (!target.style.left) {
			target.style.left = drect.left + 'px';
		}
		if (!target.style.top) {
			target.style.top = drect.top + 'px';
		}
		target.op = [parseFloat(target.style.left), parseFloat(target.style.top)];
		target.$transform$ = {
			scale: 1,
			rotate: 0,
			offset: [0, 0]
		};
		target.$origin$ = {
			scale: 1,
			rotate: 0,
			offset: [0, 0]
		};
		target.rotate = function (angle) {
			this.$transform$.rotate = angle;
		};
		target.offset = function (offset) {
			this.$transform$.offset = offset;
		};
		target.scale = function (scale) {
			this.$transform$.scale = scale;
		};
		target.update = function () {
			var state = this.$transform$;
			var o = this.$origin$;
			var scale = o.scale + state.scale;
			var s = ' ';
			s += ' ';
			s += 'scale(' + scale + ') ';
			s += 'rotate(' + (o.rotate + state.rotate) + 'deg) ';
			s += 'translate(' + (o.offset[0] + state.offset[0]) + 'px,' + (o.offset[1] + state.offset[1]) + 'px)';
			this.style.transform = s;
		};
		target.commit = function () {
			var state = this.$transform$;
			var o = this.$origin$;
			o.scale += state.scale;
			o.rotate += state.rotate;
			o.offset[0] += state.offset[0];
			o.offset[1] += state.offset[1];
			state.scale = 1;
			state.rotate = 0;
			state.offset = [0, 0];
		}
		return drect;
	}
	function getarget() {
		var el = window.$touchTarget$;
		if (el.$target$) {
			el = el.$target$();
		}
		return el;
	}
	function touchtarget(target) {
		window.$touchTarget$ = target;
	}
	function touchable(target, cfg) {
		function tstart(it, el) {
			if (el && el.istouchable && el.istouchable()) {
				calcrel(it);
				var target = el.$target$ ? el.$target$() : el;
				var cfg = target.$tcfg$;
				var rel = target.$rel$;
				if (!cfg.touched || !cfg.touched(it, el)) {
					touchtarget(el);
					zstart({ pos: it.pos }, target);
					behaviors[target.$mode$](it, target);
					target.commitStatus();
				}
			}
		}
		function zstart(it, target) {
			var rc = target.getBoundingClientRect();
			var origin = it;
			var center = [origin.pos[0] - rc.left, origin.pos[1] - rc.top];
			target.$og$ = origin;
			target.onmouseover = function (event) {
				center = rpoint(event);
			}
			simulate(target, 'mouseover', origin.pos);
			target.$cpt$ = center;
		}
		function zooming(it, target) {
			var cfg = target.$tcfg$;
			var origin = target.$og$;
			var center = target.$cpt$;
			if (origin) {
				var d = { pos: [it.pos[0] - origin.pos[0], it.pos[1] - origin.pos[1]], len: it.len / origin.len, angle: it.angle - origin.angle };
				if (cfg.norotate) {
					d.angle = 0;
				}
				target.rotate2({ angle: d.angle, pos: d.pos, scale: [d.len, d.len], center: center });
			}
		}
		function zsizing(it, target) {
			var origin = target.$og$;
			var center = target.$cpt$;
			if (origin) {
				var d = { pos: [it.pos[0] - origin.pos[0], it.pos[1] - origin.pos[1]], len: it.len - origin.len, angle: 0, xlen: it.xlen - origin.xlen, ylen: it.ylen - origin.ylen };
				var resize = (d.xlen || d.ylen) ? [d.xlen, d.ylen] : null;
				target.rotate2({ angle: d.angle, pos: d.pos, resize: resize, center: center });
				if (target.zchange) {
					target.zchange(it);
				}
			}
		}
		var behaviors = {
			zooming: zooming,
			zsizing: zsizing
		}
		if (!target) {
			return;
		}
		if (!cfg) {
			cfg = { rel: document.body };
		}
		var evtarget = target;
		target.$evtrap$ = true;
		target.$mode$ = cfg.mode || 'zooming';
		target.istouchable = function () {
			return this.$mode$;
		}
		if (target.$target$) {
			target = target.$target$();
		}
		target.$mode$ = cfg.mode || 'zooming';
		Rotator(target);
		target.$rel$ = cfg.rel;
		target.$tcfg$ = cfg;
		target.$og$ = null;
		target.$cpt$ = [0, 0];
		touchtarget(evtarget);
		function calcrel(it) {
			var target = getarget();
			target.onmouseover = function (event) {
				it.rpos = rpoint(event);
			}
			simulate(target, 'mouseover', it.pos);
			return it;
		}

		touch({
			target: document,
			rel: cfg.rel || document.body
		}).on({
			touched: function (it) {
				console.log(it);
				var el = getbypos(it);
				tstart(it, el);
			},
			dbltouched: function (it) {
				var el = getbypos(it);
				if (el.$target$) {
					el = el.$target$();
				}
				if (el && el.istouchable()) {
					calcrel(it);
					if (cfg.dbltouched) {
						cfg.dbltouched(it);
					}
				}
			},
			zoomstart: function (it) {
				calcrel(it);
				var target = getarget();
				if (target) {
					zstart(it, target);
				}
			},
			zooming: function (it) {
				calcrel(it);
				var target = getarget();
				if (target) {
					behaviors[target.$mode$](it, target);
				}
			},
			zoomend: function (it) {
				calcrel(it);
				var target = getarget();
				if (target) {
					target.commitStatus();
				}
			}
		});
		if (cfg.activate) {
			var tmp = target.getBoundingClientRect();
			tstart({ act: 'touched', pos: [tmp.left + tmp.width / 2, tmp.top + tmp.height / 2], rpos: [tmp.width / 2, tmp.height / 2], time: new Date() }, target);
		}
	}
	function getbypos(it) {
		var list = [];
		var el = null;
		while (true) {
			el = document.elementFromPoint(it.pos[0], it.pos[1]);
			if (el.tagName.toLowerCase() == 'body' || el.tagName.toLowerCase() == 'html') {
				break;
			}
			if (el.$evtignore$ || (!el.$evtrap$ && !el.getAttribute('evtrap'))) {
				list.add(el);
				$(el).hide();
			} else {
				break;
			}
		}
		for (var i = 0; i < list.length; i++) {
			$(list[i]).show();
		}
		return el;
	}
	function getrpos(pos, el) {
		var rlt = [];
		el.onmouseover = function (event) {
			var r = rpoint(event);
			rlt[0] = r[0];
			rlt[1] = r[1];
		}
		simulate(el, 'mouseover', pos);
		return rlt;
	}

	window.getrpos = getrpos;
	window.bypos = getbypos;
	window.touchable = touchable;
	window.touchtarget = touchtarget;
})();