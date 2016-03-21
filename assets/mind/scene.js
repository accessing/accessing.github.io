﻿function assist(el) {
	return {
		edit: {
			name: 'Edit',
			cmd: function () {
				var json = {
					tag: 'div',
					className: 'node-editor',
					activate: function () {
						this.$box.focus();
					},
					$: [
						{
							tag: 'div',
							className: 'bclose',
							$: 'X',
							onclick: function(event) {
								overlay();
							}
						}, { tag: 'textarea', className: 'area', alias: 'box', $: el.getval() }, {
							tag: 'button',
							className: 'bsave',
							$: 'Update',
							onclick: function(event) {
								var tb = this.$root.$box;
								el.setval(tb.value);
								overlay();
							},
						}
					]
				}
				var editor = joy.jbuilder(json);
				overlay({ style: { background: '#274289' }, $: editor });
			}
		},
		remove: {
			name: 'Remove',
			cmd: function () {
				var scene = el.$scene$;
				scene.delnode(el);
			}
		}
	};
}
function createnode(c) {
	var json = {
		tag: 'div',
		className: 'node noselect',
		$id: joy.uid('node'),
		isnode: true,
		$: { tag: 'div', $evtignore$:true, className:'content', alias: 'content' },
		setval: function (data) {
			this.$content.innerHTML = data.replace(/</g, '&lt;').replace(/\n/g, '<br />');
			this.$data$ = data;

			var pw = parseFloat(this.astyle(['width']));
			var ph = parseFloat(this.astyle(['height']));

			this.style.width = '';
			this.style.height = '';

			var aw = parseFloat(this.astyle(['width']));
			var ah = parseFloat(this.astyle(['height']));
			if (pw < aw) {
				this.style.width = aw + 'px';
			} else {
				this.style.width = pw + 'px';
			}

			if (ph < ah) {
				this.style.height = ah + 'px';
			} else {
				this.style.height = ph + 'px';
			}
		},
		getval: function () {
			return this.$data$;
		},
		getstate: function() {
			var rc = { uid:this.$id, val: this.getval(), pos: [parseFloat(this.style.left), parseFloat(this.style.top)], size: [parseFloat(this.style.width), parseFloat(this.style.height)] };
			return rc;
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
	el.$assist$ = assist(el);
	el.links = [];
	var ox = c.it.rpos[0];
	var oy = c.it.rpos[1];
	if (!c.isload) {
		ox -= 28;
		oy -= 16;
	}
	el.style.left = ox + 'px';
	el.style.top = oy + 'px';
	el.style.width = '50px';
	el.style.height = '32px';
	el.setval('Node');
	return el;
}
function createpath(sp, tp, target) {
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
	path.getstate = function () {
		var ia = this.$na.$id;
		var ib = this.$nb.$id;

		var oa = [parseFloat(this.$a.style.left), parseFloat(this.$a.style.top)];
		var ob = [parseFloat(this.$b.style.left), parseFloat(this.$b.style.top)];

		var rc = { uid: this.$id, val: this.$label.getval(), pa: oa, pb: ob, ia: ia, ib: ib };
		return rc;
	};
	target.$svg.appendChild(path);

	var json = {
		tag: 'div',
		className: 'label',
		style: {
			left: mp[0] + 'px',
			top: mp[1] + 'px'
		},
		getval: function () {
			return this.$data$;
		},
		setval: function (data) {
			this.innerHTML = data.replace(/</g, '&lt;').replace(/\n/g, '<br />');
			this.$data$ = data;
		},
		islabel: true,
		selected: function () {
			$(this).addClass('selected');
			$(this.$path).attr('class', 'selected');
		},
		deselected: function () {
			$(this).removeClass('selected');
			$(this.$path).attr('class', '');
		}
	}

	var el = joy.jbuilder(json);
	el.$path = path;
	el.$assist$ = assist(el);
	el.$scene$ = target;
	el.dispose = function () {
		this.$path.dispose();
	}
	el.setval('Link');
	if (isMobile.any()) {
		el.ontouchend = function (event) {
			target.selnode(this);
		}
	} else {
		el.onmouseup = function (event) {
			target.selnode(this);
		}
	}
	path.$label = el;

	return path;
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
	target.setlink = function(link) {
		function getnode(name) {
			for (var i = 0; i < hnodes.length; i++) {
				var n = hnodes[i];
				if (n.$id == name) {
					return n;
				}
			}
			return null;
		}

		var ea = getnode(link.ia);
		var eb = getnode(link.ib);
		//var oa = 
		var sp = [parseFloat(ea.style.left) + link.pa[0], parseFloat(ea.style.top) + link.pa[1]];
		var tp = [parseFloat(eb.style.left) + link.pb[0], parseFloat(eb.style.top) + link.pb[1]];
		var path = createpath(sp, tp, this);

		path.$na = ea;
		path.$nb = eb;
		path.$a = ea.setlink(link.pa, path);
		path.$b = eb.setlink(link.pb, path);
		path.$id = link.uid;
		links.add(path);

		var label = path.$label;
		label.setval(link.val);
		this.appendChild(label);
	};
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
		path.getstate = function () {
			var ia = this.$na.$id;
			var ib = this.$nb.$id;

			var oa = [parseFloat(this.$a.style.left), parseFloat(this.$a.style.top)];
			var ob = [parseFloat(this.$b.style.left), parseFloat(this.$b.style.top)];

			var rc = { uid: this.$id, val: this.$label.getval(), pa: oa, pb: ob, ia: ia, ib: ib };
			return rc;
		};
		links.add(path);
		this.$svg.appendChild(path);

		var json = {
			tag: 'div',
			className: 'label',
			style: {
				left: mp[0] + 'px',
				top: mp[1] + 'px'
			},
			getval: function() {
				return this.$data$;
			},
			setval: function(data) {
				this.innerHTML = data.replace(/</g, '&lt;').replace(/\n/g, '<br />');
				this.$data$ = data;
			},
			islabel: true,
			selected: function() {
				$(this).addClass('selected');
				$(this.$path).attr('class', 'selected');
			},
			deselected: function() {
				$(this).removeClass('selected');
				$(this.$path).attr('class', '');
			}
		}

		var el = joy.jbuilder(json);
		el.$path = path;
		el.$assist$ = assist(el);
		el.$scene$ = target;
		el.dispose = function() {
			this.$path.dispose();
		}
		el.setval('Link');
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

		var na = ebp(a.pos, { nop: '$evtignore$' });
		var nb = ebp(b.pos, { nop: '$evtignore$' });
		var rap = p2e(a.pos, na);
		var rbp = p2e(b.pos, nb);
		var pa = na.setlink(rap, path);
		var pb = nb.setlink(rbp, path);
		path.$id = joy.uid('path');
		path.$a = pa;
		path.$b = pb;
		path.$na = na;
		path.$nb = nb;
		return path.$label;
	};
	target.getContainer = function(name) {
		var container = this['$' + name + '$'];
		if (!container) {
			var json = {
				tag: 'div',
				className: 'assist',
				style: { display: 'none' },
				show: function (data) {
					this.innerHTML = '';
					for (var i in data) {
						var item = data[i];
						var json = {
							tag: 'div',
							className: 'btn',
							bag:item,
							onclick: function (event) {
								$(this).addClass('selected');
								this.bag.cmd();
							},
							$: item.name
						};
						var div = joy.jbuilder(json);
						this.appendChild(div);
					}
					$(this).show();
				}, hide: function () {
					$(this).hide();
				}
			}
			container = joy.jbuilder(json);
			document.body.appendChild(container);
			this.$assist$ = container;
		}
		return container;
	};
	target.showAssist = function (el) {
		var container = this.getContainer('assist');
		container.show(el.$assist$);
	};
	target.hideAssist = function() {
		var container = this.getContainer('assist');
		container.hide();
	}
	target.addnode = function (it) {
		var node = createnode({ it: it, scene: this, isload: it.isload });
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
		hnodes.add(node);

		this.appendChild(node);
		
		
		return node;
	};

	target.selnode = function (el) {
		if (!el || $(el).hasClass('selected') || snodes.length > 0) {
			for (var i = 0; i < snodes.length; i++) {
				var n = snodes[i];
				n.deselected();
				//$(n).removeClass('selected');
			}
			snodes.clear();
			target.hideAssist();
		}
		if (el) {
			el.selected();
			target.showAssist(el);
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
		target.hideAssist();
	};

	target.getval = function () {
		var d = { size: [parseFloat(this.style.width), parseFloat(this.style.height)], nodes: [], links: [] };
		for (var i = 0; i < hnodes.length; i++) {
			var n = hnodes[i];
			if (!n.isdisposed) {
				var s = n.getstate();
				d.nodes.add(s);
			}
		}
		for (var i = 0; i < links.length; i++) {
			var n = links[i];
			if (!n.isdisposed) {
				var s = n.getstate();
				d.links.add(s);
			}
		}
		var r = JSON.stringify(d);
		return r;
	};

	target.setval = function (data) {
		snodes.clear();
		for (var i = 0; i < links.length; i++) {
			var l = links[i];
			l.dispose();
		}
		target.$svg.innerHTML = '';
		for (var i = 0; i < hnodes.length; i++) {
			var n = hnodes[i];
			n.dispose();
		}
		hnodes.clear();
		links.clear();
		this.appendChild(svg);

		for (var i = 0; i < data.nodes.length; i++) {
			var n = data.nodes[i];
			var el = this.addnode({ rpos: n.pos, isload: true });
			el.$id = n.uid;
			el.style.width = n.size[0] + 'px';
			el.style.height = n.size[1] + 'px';
			el.setval(n.val);
			this.appendChild(el);
		}
		for (var i = 0; i < data.links.length; i++) {
			var l = data.links[i];
			this.setlink(l);
		}
		touchtarget(this);
	}

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