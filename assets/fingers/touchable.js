function rpoint(event) {
	var pt = [0, 0];
	pt[0] = event.offsetX;
	pt[1] = event.offsetY;
//	var tmp = event.originalEvent || {layerX:'undefined', layerY:'undefined'};
//	d.log('op:' + event.offsetX + ',' + event.offsetY + ' olp:' + tmp.layerX + ',' + tmp.layerY + ' lp:' + event.layerX + ',' + event.layerY);
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

function touchable(target, cfg) {
	if (!target) {
		return;
	}
	if (!cfg) {
		cfg = { rel: document.body };
	}
	//transformable(target, cfg.rel);
	Rotator(target);
	var origin = null;
	var center = [0, 0];
	touch({
		target: document,
		rel: cfg.rel
	}).on({
		zoomstart: function (it) {
			var rc = target.getBoundingClientRect();
			origin = it;
			center = [origin.pos[0] - rc.left, origin.pos[1] - rc.top];
			target.ondblclick = function(event) {
				center = rpoint(event);
			}
			simulate(target, 'dblclick', origin.pos);
		}, zooming: function (it) {
			if (origin) {
				var d = { rpos: [it.rpos[0] - origin.rpos[0], it.rpos[1] - origin.rpos[1]], len: it.len / origin.len, angle: it.angle - origin.angle };
				target.rotate2({ angle: d.angle, pos: d.rpos, scale: [d.len, d.len], center: center });
			}
		}, zoomend: function (it) {
			target.commitStatus();
			origin = null;
		}
	});

}
