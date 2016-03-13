(function() {
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
		return window.$touchTarget$;
	}
	function touchtarget(target) {
		window.$touchTarget$ = target;
	}
	function touchable(target, cfg) {
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
				var resize = [d.xlen, d.ylen];
				console.log(d.xlen);
				//if ((it.angle > -30 && it.angle < 30) || it.angle > 150 || it.angle < -150 ) {
				//	resize[1] = 0;
				//} else if ((it.angle > 60 && it.angle < 120) || (it.angle < -60 && it.angle > -120)) {
				//	resize[0] = 1;
				//} 
				target.rotate2({ angle: d.angle, pos: d.pos, resize: resize, center: center });
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
		Rotator(target);
		target.$rel$ = cfg.rel;
		target.$tcfg$ = cfg;
		target.$og$ = null;
		target.$cpt$ = [0, 0];
		target.$mode$ = cfg.mode || 'zooming';
		target.istouchable = function() {
			return this.$mode$;
		}
		touchtarget(target);
		function calcrel(it) {
			var target = getarget();
			target.onmouseover = function(event) {
				it.rpos = rpoint(event);
			}
			simulate(target, 'mouseover', it.pos);
			//var rel = target.$rel$;
			//it.rpos[0] = it.pos[0] - parseFloat(target.style.left);
			//it.rpos[1] = it.pos[1] - parseFloat(target.style.top);
			return it;
		}

		touch({
			target: document,
			rel: cfg.rel || document.body
		}).on({
			touched: function(it) {
				var el = getbypos(it);
				//console.log(el.istouchable());
				if (el && el.istouchable()) {
					calcrel(it);
					var target = el; //getarget();
					var cfg = target.$tcfg$;
					var rel = target.$rel$;
					if (!cfg.touched || !cfg.touched(it, el)) {
						touchtarget(el);
					}
				}

			},
			dbltouched: function (it) {
				var el = getbypos(it);
				if (el && el.istouchable()) {
					calcrel(it);
					if (cfg.dbltouched) {
						cfg.dbltouched(it);
					}
				}
			},
			zoomstart: function(it) {
				calcrel(it);
				var target = getarget();
				zstart(it, target);
			},
			zooming: function(it) {
				calcrel(it);
				var target = getarget();
				behaviors[target.$mode$](it, target);
			},
			zoomend: function(it) {
				calcrel(it);
				var target = getarget();
				target.commitStatus();
			}
		});
	}
	function getbypos(it) {
		var list = [];
		var el = null;
		while (true) {
			el = document.elementFromPoint(it.pos[0], it.pos[1]);
			if (el.$evtignore$) {
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
