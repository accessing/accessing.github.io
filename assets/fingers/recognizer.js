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