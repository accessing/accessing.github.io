function rotatable(target, cfg) {
	if (!target) {
		return null;
	}

	if (!cfg) {
		cfg = { rel: document.body };
	}

	if (!target.$rstate$) {
		var rc = target.getBoundingClientRect();
		target.$rstate$ = { center: [rc.width / 2, rc.height / 2], angle: 0 };
		target.$rtemp$ = { center: [rc.width / 2, rc.height / 2], angle: 0 };
	}

	target.center = function(cpt) {
		var p = [cpt[0], cpt[1]];
		this.$rtemp$.center = p;
		this.rotate();
	};

	target.rotate = function (ag, undef) {
		if (ag === undef) {
			ag = this.$rtemp$.angle;
		}
		var state = this.$rstate$;
		this.$rtemp$.angle = ag;
		var cpt = this.$rtemp$.center;
		//this.style.transformOrigin = ' ' + cpt[0] + 'px ' + cpt[1] + 'px ';
		this.style.transformOrigin = ' 100px 100px ';
		this.style.transform = ' rotate(' + (ag + state.angle) + 'deg) ';
	};

	target.update = function() {
		var state = this.$rstate$;
		state.angle += this.$rtemp$.angle;
		state.center = this.$rtemp$.center;
		this.$rtemp$.angle = 0;
	}

	var origin = null;
	touch({
		target: document,
		rel: cfg.rel
	}).on({
		zoomstart: function (it) {
			origin = it;
		}, zooming: function (it) {
			if (origin) {
				var d = { rpos: [it.rpos[0] - origin.rpos[0], it.rpos[1] - origin.rpos[1]], len: it.len / origin.len - 1, angle: it.angle - origin.angle };
				target.rotate(d.angle);
				showbound(target);
			}
		}, zoomend: function (it) {
			origin = null;
			target.update();
		}
	});
}