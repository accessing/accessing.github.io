﻿function Rotator(target, options) {
	function process(target, options) {
		var rc = target.getBoundingClientRect();
		target.style.left = d.astyle(target, ['left']);
		target.style.top = d.astyle(target, ['top']);
		target.$rot$ = {
			origin: { center: [rc.width / 2, rc.height / 2], angle: 0, scale: [1, 1], pos: [parseFloat(target.style.left), parseFloat(target.style.top)] },
			cmt:{ center: [rc.width / 2, rc.height / 2], angle: 0, scale: [1, 1], pos: [parseFloat(target.style.left), parseFloat(target.style.top)] },
			cache: { center: [rc.width / 2, rc.height / 2], angle: 0, scale: [1, 1], pos: [parseFloat(target.style.left), parseFloat(target.style.top)] },
			status: []
		};

		target.getcenter = function () {
			return this.$center$.getBoundingClientRect();
		};

		target.pushStatus = function () {
			var r = this.getcenter();
			var l = [parseFloat(this.style.left), parseFloat(this.style.top)];

			var s = { center: [r.left, r.top], pos: l };
			var q = this.$rot$.status;
			var p = q.length > 0 ? q[q.length - 1] : s;
			s.delta = { center: [s.center[0] - p.center[0], s.center[1] - p.center[1]], pos: [s.pos[0] - p.pos[0], s.pos[1] - p.pos[1]] };
			q[q.length] = s;
			if (q.length > 6) {
				this.$rot$.status = q.splice(0, 1);
			}
			return s;
		};

		target.origin = function (p) {
			//var a = this.$rot$.origin.angle;
			//var c = this.$rot$.origin.center;
			this.style.transformOrigin = p[0] + 'px ' + p[1] + 'px';
		};

		target.correct = function (status, poffset) {
			if (!poffset) {
				poffset = [0, 0];
			}
			var self = this;
			var d = status.delta;
			var x = parseFloat(self.style.left) - d.center[0];
			var y = parseFloat(self.style.top) - d.center[1];
			self.$rot$.offset = [poffset[0] + d.center[0], poffset[1] + d.center[1]];
			//self.$rot$.cache.pos[0] -= d.center[0];
			//self.$rot$.cache.pos[1] -= d.center[1];
			self.style.left = x + 'px';
			self.style.top = y + 'px';
			return self.$rot$.offset;
		};
		//target.initStatus = function () {
		//    var origin = this.$rot$.origin;
		//    var s = { pos: [parseFloat(this.style.left), parseFloat(this.style.top)], angle: origin.angle, scale: origin.scale };
		//    this.$rot$.cache = s;
		//    return s;
		//};
		target.commitStatus = function () {
			var rot = this.$rot$;
			rot.cmt = this.$rot$.cache;
			rot.cmt.pos = [parseFloat(this.style.left), parseFloat(this.style.top)];
			rot.cache = { angle: 0, scale: [1, 1], pos: [0, 0] };
			rot.offset = [0, 0];
		};
		target.rotate2 = function (arg, undef) {
			if (!arg) {
				return this;
			}

			var cache = this.$rot$.cache;
			var origin = this.$rot$.cmt;
			var offset = this.$rot$.offset;
			var angle = arg.angle, center = arg.center, scale = arg.scale, pos = arg.pos;

			if (!offset) {
				offset = [0, 0];
			}
			if (center !== undef) {
				this.pushStatus();
				this.origin(center);
				var cstatus = this.pushStatus();
				offset = this.correct(cstatus, offset);
			}

			if (angle || angle === 0) {
				cache.angle = origin.angle + angle;
				cache.angle = cache.angle % 360;
			}

			if (scale) {
				if (scale instanceof Array) {

				} else {
					var n = parseFloat(scale);
					scale = [n, n];
				}
				cache.scale = [origin.scale[0] * scale[0], origin.scale[1] * scale[1]];
			}

			if (pos) {
				cache.pos = [origin.pos[0] + pos[0] - offset[0], origin.pos[1] + pos[1] - offset[1]];
			}

			this.style.transform = 'rotateZ(' + cache.angle + 'deg) scale(' + cache.scale[0] + ',' + cache.scale[1] + ')';
			this.style.left = cache.pos[0] + 'px';
			this.style.top = cache.pos[1] + 'px';

			this.pushStatus();

			return this;
		}
		target.rotate = function (arg, undef) {
			if (!arg) {
				return this;
			}

			var angle = arg.angle, center = arg.center, scale = arg.scale, offset = arg.offset;
			var self = this;
			var origin = self.$rot$.origin.angle;

			if (scale === undef) {
				scale = [1, 1];
			} else if (scale instanceof Array) {

			} else {
				var n = parseFloat(scale);
				if (n == 0) {
					n == 0.001;
				}
				scale = [n, n];
			}

			if (center !== undef) {
				this.pushStatus();
				this.origin(center);
				var cstatus = this.pushStatus();
				this.correct(cstatus);
			}

			if (angle !== undef) {
				var a = (angle + origin) % 360;
				self.style.transform = 'rotateZ(' + a + 'deg) scale(' + scale[0] + ',' + scale[1] + ')';
				self.$rot$.origin.angle = a;
			}

			if (offset) {
				self.style.left = parseFloat(self.style.left) + offset[0] + 'px';
				self.style.top = parseFloat(self.style.top) + offset[1] + 'px';
			}

			this.pushStatus();

			return this;
		};

		if (!target.$center$) {
			var center = document.createElement('div');
			center.style.position = 'absolute';
			center.style.left = target.$rot$.origin.center[0] + 'px';
			center.style.top = target.$rot$.origin.center[1] + 'px';
			center.style.width = '0px';
			center.style.height = '0px';
			center.style.border = 'solid 0px blue';

			target.appendChild(center);
			target.$center$ = center;
			target.origin(target.$rot$.origin.center);
			target.style.transform = 'rotate(0deg)';
			target.pushStatus();
		}
		return target;
	}

	return process(target);
}