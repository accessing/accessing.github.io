function createnode(c) {
	var json = {
		tag: 'div',
		className: 'node noselect',
		isnode: true,
		setval: function (data) {
			this.innerText = data;
			this.textContent = data;
		},
		getval: function () {
			return this.innerText || this.textContent;
		},
		setlink: function (pos, path) {
			var p = document.createElement('div');
			p.style.width = '0px';
			p.style.height = '0px';
			p.style.background = 'red';
			p.style.position = 'absolute';
			p.style.left = pos[0] + 'px';
			p.style.top = pos[1] + 'px';
			p.$evtignore$ = true;
			this.appendChild(p);
			this.links.add(path);
			return p;
		}, zchange: function (it) {
			for (var i = 0; i < this.links.length; i++) {
				this.links[i].update();
			}
		}, dispose: function () {
			for (var i = 0; i < this.links.length; i++) {
				var l = this.links[i];
				l.dispose();
			}
			this.isdisposed = true;
			destroy(this);
		}, selected: function() {
			$(this).addClass('selected');
		}, deselected: function() {
			$(this).removeClass('selected');
		}
	};
	var el = joy.jbuilder(json);
	el.$scene$ = c.scene;
	el.links = [];
	el.style.left = c.it.rpos[0] - 36 + 'px';
	el.style.top = c.it.rpos[1] - 16 + 'px';
	el.style.width = '70px';
	el.style.height = '32px';
	el.setval('Node');
	return el;
}

function initscene(c) {
	var snodes = [];
	var hits = [];
	var hnodes = [];
	var links = [];
	var target = document.getElementById(c.id);
	target.style.width = '100000px';
	target.style.height = '100000px';
	target.style.left = '-50000px';
	target.style.top = '-50000px';
	target.iscene = true;

	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.$evtignore$ = true;
	target.$svg = svg;
	target.appendChild(svg);
	target.addlink = function (a, b) {
		var sp = p2e(a.pos, target);
		var tp = p2e(b.pos, target);

		var mp = [(sp[0] + tp[0]) / 2, (sp[1] + tp[1]) / 2];
		var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttributeNS(null, 'd', 'M' + sp[0] + ',' + sp[1] + ' L' + tp[0] + ',' + tp[1]);
		path.setAttributeNS(null, 'class', 'link');
		path.update = function () {
			var ta = this.$a;
			var tb = this.$b;
			var pa = p2c(ta);
			var pb = p2c(tb);
			var sp = p2e(pa, target);
			var tp = p2e(pb, target);
			var mp = [(sp[0] + tp[0]) / 2, (sp[1] + tp[1]) / 2]
			this.setAttributeNS(null, 'd', 'M' + sp[0] + ',' + sp[1] + ' L' + tp[0] + ',' + tp[1]);
			this.$label.style.left = mp[0] + 'px';
			this.$label.style.top = mp[1] + 'px';
		}
		path.dispose = function () {
			var a = this.$a;
			var b = this.$b;
			var l = this.$label;
			this.isdisposed = true;
			destroy(a);
			destroy(b);
			destroy(l);
			destroy(this);
		}
		links.add(path);
		this.$svg.appendChild(path);

		var json = {
			tag: 'div',
			className: 'label',
			style: {
				left: mp[0] + 'px',
				top: mp[1] + 'px'
			},
			islabel: true,
			selected: function() {
				$(this).addClass('selected');
				$(this.$path).attr('class', 'selected');
			},
			deselected: function() {
				$(this).removeClass('selected');
				$(this.$path).attr('class', '');
			},
			$: 'Link'
		}

		var el = joy.jbuilder(json);
		el.$path = path;
		el.dispose = function() {
			this.$path.dispose();
		}
		if (isMobile.any()) {
			el.ontouchend = function(event) {
				target.selnode(this);
			}
		} else {
			el.onmouseup = function(event) {
				target.selnode(this);
			}
		}
		path.$label = el;

		this.appendChild(el);

		var na = ebp(a.pos);
		var nb = ebp(b.pos);
		var rap = p2e(a.pos, na);
		var rbp = p2e(b.pos, nb);
		var pa = na.setlink(rap, path);
		var pb = nb.setlink(rbp, path);
		path.$a = pa;
		path.$b = pb;
		path.$na = na;
		path.$nb = nb;
	};
	target.addnode = function (it) {
		var node = createnode({ it: it, scene: this });
		hnodes.add(node);
		if (hnodes.length > 12) {
			hnodes.splice(0, 1);
		}
		this.appendChild(node);
		touchable(node, {
			mode: 'zsizing',
			touched: function (it) {
				hits.add(it);
				if (hits.length > 12) {
					hits.splice(0, 1);
				}
				target.selnode(node);
			},
			dbltouched: function (it) {
				if (hits.length > 1) {
					target.addlink(hits[hits.length - 2], it);
				}
			}
		});
	};

	target.selnode = function (el) {
		if (!el || $(el).hasClass('selected') || snodes.length > 0) {
			for (var i = 0; i < snodes.length; i++) {
				var n = snodes[i];
				n.deselected();
				//$(n).removeClass('selected');
			}
			snodes.clear();
		}
		if (el) {
			el.selected();
			if (!el.islabel) {
				touchtarget(el);
			}
			snodes.add(el);
		}
	};

	target.delnode = function (el) {
		var nodes = el ? [el] : snodes;
		if (nodes.length > 0) {
			for (var i = 0; i < nodes.length; i++) {
				var nd = nodes[i];
				nd.dispose();
				//destroy(nd);
			}
		}
		if (!el) {
			snodes.clear();
		}
		for (var i = 0; i < hnodes.length; i++) {
			var hn = hnodes[i];
			if (hn.isdisposed) {
				hnodes.splice(i, 1);
				i--;
			}
		}
		for (var i = 0; i < links.length; i++) {
			var l = links[i];
			if (l.isdisposed) {
				links.splice(i, 1);
				i--;
			}
		}
	};

	touchable(target, {
		rel: target,
		norotate: false,
		touched: function (it, el) {
			var el = bypos(it);
			if (el.iscene) {
				if (snodes.length > 0) {
					target.selnode();
				} else {
					target.addnode(it);
				}
			} else {
				target.selnode(el);
			}
		}
	});
	return target;
}