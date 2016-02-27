

(function () {

	function _finger(handle, cfg) {

		// Transform native event into logic event
		function transformevt(name, event, c) {
			var rlt = touchevt(name, [event], c);
			return rlt;
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

		function getouches(event) {
			return event.touches;
		}

		var rcg = Recognizer(cfg);

		/////////////////////////////////////
		// Simulate logic event
		// p:   Event list
		// rp:  Relative position
		function simevt(p, rp) {
			var d = new Date();
			if (!rp) {
				rp = [50, 50];
			}
			var list = [];
			for (var i = 0; i < p.length; i++) {
				var pp = p[i];
				pp.pos = pp.rpos;
				list.add({ act: pp.act, pos: pp.pos, rpos: pp.rpos, time: d });
			}
			rcg.parse(list);
		}

		// Bind native event handler & logic event handler
		function bindevt(target, c) {
			var rp = [400, 400];
			if (target.$binded$) {
				return;
			}
			target.$binded$ = true;
			target.fire = simevt;
			target.tstart = function () {
				simevt([{ act: 'touchstart', rpos: rp }]);
			};
			target.tmove = function () {
				simevt([{ act: 'touchmove', rpos: rp }]);
			};
			target.tend = function () {
				simevt([{ act: 'touchend', rpos: rp }]);
			};
			if (c.mode == 1) {
				$(target)[0].ontouchstart = function (event) {
					var ths = getouches(event);
					if (ths) {
						var evt = touchevt('touchstart', ths, c);
						rcg.parse(evt);
					}
				};
				$(target)[0].ontouchmove = function (event) {
					var ths = getouches(event);
					if (ths) {
						var evt = touchevt('touchmove', ths, c);
						rcg.parse(evt);
					}
					if (navigator.userAgent.match(/Android/i)) {
						event.preventDefault();
					}
				};
				$(target)[0].ontouchend = function (event) {
					var ths = event.changedTouches; //getouches(event);
					if (ths) {
						var evt = touchevt('touchend', ths, c);
						rcg.parse(evt);
					}
				};
				$(target)[0].onmousedown = function (event) {
					if (!agent().isMobile()) {
						var evt = transformevt('touchstart', event, c);
						rcg.parse(evt);
					}
				};
				$(target)[0].onmousemove = function (event) {
					if (!agent().isMobile()) {
						var evt = transformevt('touchmove', event, c);
						rcg.parse(evt);
					}
				};
				$(target)[0].onmouseup = function (event) {
					if (!agent().isMobile()) {
						var evt = transformevt('touchend', event, c);
						rcg.parse(evt);
					}
				};
				function wheel(event) {
					if (!agent().isMobile()) {
						var d = event.wheelDelta || event.delta || event.detail;
						console.log(d);
						if (d > 0) {
							rcg.parse(touchevt('touchstart', [{ clientX: rp[0], clientY: rp[1] }, { clientX: rp[0] + 20, clientY: rp[1] }], c));
							rcg.parse(touchevt('touchmove', [{ clientX: rp[0] - 10, clientY: rp[1] }, { clientX: rp[0] + 30, clientY: rp[1] }], c));
							rcg.parse(touchevt('touchend', [{ clientX: rp[0] - 10, clientY: rp[1] }, { clientX: rp[0] + 30, clientY: rp[1] }], c));
						} else {
							rcg.parse(touchevt('touchstart', [{ clientX: rp[0], clientY: rp[1] }, { clientX: rp[0] + 20, clientY: rp[1] }], c));
							rcg.parse(touchevt('touchmove', [{ clientX: rp[0] + 10, clientY: rp[1] }, { clientX: rp[0] + 10, clientY: rp[1] }], c));
							rcg.parse(touchevt('touchend', [{ clientX: rp[0] + 10, clientY: rp[1] }, { clientX: rp[0] + 10, clientY: rp[1] }], c));
						}
					}
				}
				$(target)[0].addEventListener('DOMMouseScroll', wheel);
				$(target)[0].onmousewheel = wheel;
			}
		}

		var queue = [];
		if (!handle) {
			return;
		}
		if (!cfg) {
			cfg = {};
		}
		bindevt(handle, cfg);
	}
	function fadd(c, evs) {
		evs[c.name] = c;
	}

	function fon(el, act, cb, evs) {
		var c = {
			name: 'onevt' + joy.uid()
			, onrecognize: {
				target: el
			}
		};
		c.onrecognize[act] = cb;
		evs[c.name] = c;
	}
	function fremove(name, evs) {
		if (name && evs && evs[name]) {
			delete evs[name];
		} else {
			for (var i in evs) {
				var item = evs[i];
				if (item.onremove) {
					item.onremove();
				}
				delete evs[i];
			}
			evs = {};
		}
	}
	//var globalevs = {};
	window.finger = {
		setup: function (c, target) {
			var evs = c.global ? globalevs : {};
			_finger(c.target, {
				mode: 1,
				rel: c.rel,
				capture: {
					region: c.rel.getBoundingClientRect(),
					qchanged: function (q) {
						var flag = false;
						var qlast = q.last(1);
						for (var i in evs) {
							var c = evs[i];
							if (c.oncapture) {
								if (typeof (c.oncapture) == 'function' && c.oncapture(q)) {
									flag = true;
								} else if (qlast && typeof (c.oncapture) == 'object' && c.oncapture[qlast.act]) {
									if (!c.oncapture.target || within(q, c.oncapture.target, qlast.act)) {
										flag = c.oncapture[qlast.act](q);
									}
								}
							}
						}
						//console.log('fCapture:' + flag);
						return flag;
					}
				}, recognizing: {
					qchanged: function (q) {
						var flag = false;
						var qlast = q.last(1);
						for (var i in evs) {
							var c = evs[i];
							if (c.onrecognize) {
								if (typeof (c.onrecognize) == 'function' && c.onrecognize(q)) {
									flag = true;
								} else if (qlast && typeof (c.onrecognize) == 'object' && c.onrecognize[qlast.act]) {
									if (!c.onrecognize.target) {
										flag = c.onrecognize[qlast.act](q);
									} else {
										//var rect = rc(c.onrecognize.target);
										//debugger;
										if (document.elementFromPoint(qlast.pos[0], qlast.pos[1]) == c.onrecognize.target) {
											flag = c.onrecognize[qlast.act](q);
										}
									}
								}
							}
						}
						//console.log('fRecognize:' + flag);
						return flag;
					}
				}
			});

			var r = target || {};
			r.add = function (c) {
				fadd(c, evs);
			};
			r.on = function (el, act, cb) {
				fon(el, act, cb, evs);
			};
			r.remove = function (name) {
				fremove(name, evs);
			};
			return r;
		}
		, on: function (el, act, cb) {
			var fg = finger.setup({
				target: el
				, rel: el
				, global: false
			});
			fg.on(el, act, cb);
		}
	};
})();
