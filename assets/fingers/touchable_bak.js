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
	//rectbound(drect, rel);
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
	if (!target.style.width) {
		target.style.width = drect.width + 'px';
	}
	if (!target.style.height) {
		target.style.height = drect.height + 'px';
	}

	//Original point
	var x = parseFloat(target.style.left);
	var y = parseFloat(target.style.top);
	var w = parseFloat(target.style.width);
	var h = parseFloat(target.style.height);
	target.op = [x, y];
	target.ctp = [x + w / 2, y + h / 2];

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
	target.move = function(offset) {
		this.style.left = offset[0] + 'px';
		this.style.top = offset[1] + 'px';
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
		var starget = this.$scale;
		var rtarget = this.$rotate;
		var ttarget = this.$translate;

		starget.style.transform = '';
		rtarget.style.transform = '';
		ttarget.style.transform = '';

		var ctp = target.ctp;
		var octp = target.octp;
		//var dp = [octp[0] - ctp[0], octp[1] - ctp[1]];
		var dp = [0, 0];

		starget.style.transform += ' scale(' + scale + ') translate('+(-1 * dp[0])+'px,'+(-1 * dp[1])+'px) ';
		rtarget.style.transform += ' rotate(' + (o.rotate + state.rotate) + 'deg)  ';
		ttarget.style.transform += ' translate('+dp[0]+'px, '+dp[1]+'px) ';
		//ttarget.style.transform += ' translate(' + (o.offset[0] + state.offset[0]) + 'px,' + (o.offset[1] + state.offset[1]) + 'px) ';
		//console.log(this.style.transform);
		//var s = ' ';
		//s += ' ';
		//s += 'scale(' + scale + ') ';
		//s += 'rotate(' + (o.rotate + state.rotate) + 'deg) ';
		//s += 'translate(' + (o.offset[0] + state.offset[0]) + 'px,' + (o.offset[1] + state.offset[1]) + 'px)';
		//this.style.transform = s;
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

function touchable(target, cfg) {
	if (!target) {
		return;
	}
	if (!cfg) {
		cfg = {};
	}

	target.$scale = cfg.scale || target;
	target.$rotate = cfg.rotate || target;
	target.$translate = cfg.translate || target;
	var rel = cfg.rel || document.body;
	transformable(target, rel);
	var origin = null;

	touch({
		target: document,
		rel: rel
	}).on({
		zoomstart: function (it) {
			origin = it;
			//Original point
			var x = parseFloat(target.style.left);
			var y = parseFloat(target.style.top);

			var w = parseFloat(target.style.width);// * target.$origin$.scale;
			var h = parseFloat(target.style.height);// * target.$origin$.scale;
			target.ctp = [x + w / 2, y + h / 2];

			target.octp = [it.rpos[0], it.rpos[1]];
		}, zooming: function (it) {
			if (origin) {
				// Original point
				var op = target.op;
				var d = { rpos: [it.rpos[0] - origin.rpos[0], it.rpos[1] - origin.rpos[1]], len: it.len / origin.len - 1, angle: it.angle - origin.angle };
				var x = op[0] + d.rpos[0];
				var y = op[1] + d.rpos[1];
				target.move([x, y]);
				target.rotate(d.angle);
				target.scale(d.len);
				target.update();
			}
		}, zoomend: function (it) {
			var x = parseFloat(target.style.left);
			var y = parseFloat(target.style.top);
			var op = target.op;
			op[0] = x;
			op[1] = y;
			target.commit();
			origin = null;
		}
	});
}
