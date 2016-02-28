function touch(cfg) {
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
				showTouches(document.body, q);
			},
			qchanged: function (q) {
				//logq('raw', q);
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
	var qel = $(target);
	qel.md = false;
	qel.zooming = false;
	qel.mousemove(function (event) {
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
	});

	qel.mousedown(function (event) {
		qel.md = true;
		if (event.button == 0) {
			qel.zooming = false;
			rg.parse([{ act: 'touchstart', pos: [event.clientX, event.clientY], rpos: [event.clientX, event.clientY], time: new Date() }]);
		} else {
			qel.zooming = true;
			if (event.button == 1) {
				qel.of = true;
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
	});

	qel.mouseup(function (event) {
		qel.md = false;
		qel.zooming = false;
		qel.of = false;
		rg.parse([{ act: 'touchend', pos: [event.clientX, event.clientY], rpos: [event.clientX, event.clientY], time: new Date() }]);
	});

	// Get native touches
	function getouches(event) {
		try {
			var r = event.touches || event.targetTouches;
			return r;
		} catch (e) {
			alert(e);
			return [];
		}
	}

	// Construct logic event
	function touchevt(name, touches, c) {
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

	for (var i = 0; i < qel.length; i++) {
		var nel = qel[i];
		nel.ontouchstart = function (event) {
			var ths = getouches(event);
			var q = touchevt('touchstart', ths, { rel: rel });
			rg.parse(q);
			event.preventDefault();
		};
		nel.ontouchmove = function (event) {
			var ths = getouches(event);
			var q = touchevt('touchmove', ths, { rel: rel });
			rg.parse(q);
			event.preventDefault();
		};
		nel.ontouchend = function (event) {
			var ths = getouches(event);
			var q = touchevt('touchend', ths, { rel: rel });
			rg.parse(q);
			event.preventDefault();
		};
	}
	return {
		on:function(c) {
			for (var i in c) {
				handlers[i] = c[i];
			}
		}
	}
}