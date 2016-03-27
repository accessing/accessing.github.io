(function () {
	var watchlist = [];
	function findhandler(d) {
		for (var i = 0; i < watchlist.length; i++) {
			var kv = watchlist[i];
			if (kv.model == d) {
				return kv;
			}
		}
		return null;
	}
	function createhandler(d, c) {
		var h = {
			model: d,
			changes: {},
			addchange: function (c) {
				var chlist = h.changes[c.name];
				if (!chlist) {
					chlist = [c.change];
					h.changes[c.name] = chlist;
				} else {
					for (var i = 0; i < chlist.length; i++) {
						var fn = chlist[i];
						if (fn == c.change) {
							return;
						}
					}
					chlist[chlist.length] = c.change;
				}
			}
		};
		h.addchange(c);
		watchlist[watchlist.length] = h;
		return h;
	}
	var dhandler = {
		typechange: function (p, c) {
			function vchange(event) {
				//console.log(event.keyCode);
				if (!event.keyCode) {
					p[c.name] = this.value;
				} else if (!event.altKey && !event.ctrlKey) {
					if (event.keyCode >= 33 && event.keyCode <= 40 || event.keyCode == 16) {
						// do nothing
					} else if (event.keyCode == 46 || event.keyCode == 8) {

					} else {
						p[c.name] = this.value;
					}
				}
			}

			var el = document.getElementById('text');
			el.onkeyup = vchange;
			el.onchange = vchange;
			el.onblur = vchange;
		}
	}
	function watch(d, c, undef) {
		function gethandler(key) {
			if (!key) {
				return null;
			}
			var t = typeof (key);
			console.log(t);
			if (t == 'string') {
				return dhandler[key];
			} else {
				return key;
			}
		}
		var ov = d[c.name], nv = ov;
		var h = findhandler(d);
		var initer = gethandler(c.init);
		if (!h) {
			h = createhandler(d, c);
			if (delete d[c.name]) {
				if (Object.defineProperty) {
					Object.defineProperty(d, c.name, {
						get: function () {
							return nv;
						},
						set: function (val) {
							var chlist = h.changes[c.name];
							if (chlist && chlist.length > 0) {
								for (var i = 0; i < chlist.length; i++) {
									var fn = chlist[i];
									fn(d, c.name, val, ov);
								}
							}
							nv = val;
							ov = val;
						}
					});
					if (initer) {
						initer(d, c);
					}
					d[c.name] = nv;
					return true;
				} else {
					console.log('Define property not supported');
					debugger;
				}
			} else {
				console.log('Cannot watch ' + c.name);
				debugger;
			}
		} else {
			h.addchange(c);
			if (initer) {
				initer(d, c);
			}
			return true;
		}

		return false;
	}
	window.watch = watch;
})();