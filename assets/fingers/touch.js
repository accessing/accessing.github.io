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
		qel.onmousemove = function(event) {
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

		qel.onmousedown = function(event) {
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

		qel.onmouseup = function(event) {
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
				event.preventDefault();
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
				event.preventDefault();
			}
		};
	//}
	return {
		on:function(c) {
			for (var i in c) {
				handlers[i] = c[i];
			}
		}
	}
}