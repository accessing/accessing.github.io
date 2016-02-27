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
		var len = Math.sqrt((ar[0] - br[0]) * (ar[0] - br[0]) + (ar[1] - br[1]) * (ar[1] - br[1]))
		var angle = getAngle(ar, br);
		return { pos: pos, rpos: rpos, len: len, angle: angle };
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
				return { act: 'zoomend', pos: point.pos, rpos: point.rpos, time: new Date(), len: point.len, angle: point.angle };
			} else if (curt.length == 2 && (acts(curt[0], 'touchend') || acts(curt[1], 'touchend'))) {
				return { act: 'zoomend', pos: point.pos, rpos: point.rpos, time: new Date(), len: point.len, angle: point.angle };
			} else if (curt.length == 2 && (!olast || (!acts(olast, 'zooming') && !acts(olast, 'zoomstart')))) {
				return { act: 'zoomstart', pos: point.pos, rpos: point.rpos, time: new Date(), len: point.len, angle: point.angle };
			} else if (curt.length == 2) {
				return { act: 'zooming', pos: point.pos, rpos: point.rpos, time: new Date(), len: point.len, angle: point.angle };
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
				//debugger;
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
				//debugger;
				if (d < 350 && acts(st.act, 'touched') && acts(ea.act, 'touched')) {
					return { act: 'dbltouched', pos: ea.pos, rpos: ea.rpos, time: new Date() };
				}
				//debugger;
				return false;
			}
		}
	};
	return r;
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
		var oqlen = c.oqlen || 12;
		var flag = false;
		for (var i = 0; i < c.parser.length; i++) {
			var psr = c.parser[i]();
			if (psr.condition) {
				if ((typeof (psr.condition) == 'function' && psr.condition(qs)) || check(psr.condition)) {
					var act = psr.verify(qs);
					if (act) {
						oq.add(act);
						iq.clear();
						if (oq.length >= oqlen) {
							oq.splice(0, 1);
						}
						if (c.recognizing && c.recognizing.qchanged) {
							var tmp = c.recognizing.qchanged(oq);
							//console.log('Recognize: ' + tmp);
							flag = flag || tmp;
						}
						if (c.capture && c.capture.qchanged) {
							var tmp = c.capture.qchanged(iq);
							//console.log('Capture: ' + tmp);
							flag = flag || tmp;
						}
						break;
					}
				}
			}
		}
		//if (!flag) {
		//	for (var i in evs) {
		//		var c = evs[i];
		//		if (c.onrelease) {
		//			c.onrelease();
		//		}
		//	}
		//}
	}
	if (!cfg.parser) {
		cfg.parser = [zoomParser, dblTouchedParser, dragParser, singleTouchedParser];
	}
	var r = {
		parse: function (act) {
			// Format: [{ act: name, pos: [x, y], rpos: [rx, ry], time:d }]
			if (!cfg.parser) {
				return;
			}
			var c = cfg;
			var iqlen = c.iqlen || 12;
			var inqueue = qs[0];
			inqueue.add(act);
			if (inqueue.length > iqlen) {
				inqueue.splice(0, 1);
			}
			if (c.capture && c.capture.qchanged) {
				c.capture.qchanged(inqueue);
			}
			kickevt(c);
		}
	};
	return r;
}