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
				return { act: 'zooming', pos: point.pos, rpos: point.rpos, time: new Date(), len: point.len, angle: point.angle, xlen:point.xlen, ylen:point.ylen };
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