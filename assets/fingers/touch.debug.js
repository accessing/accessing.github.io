function logq(id, q) {
	function text(item) {
		var s = item.act + ':' + item.rpos + '\t';
		if (item.act.indexOf('zoom') >= 0) {
			for (var i in item) {
				if (i != 'act' && i != 'rpos' && i != 'pos') {
					s += i + '=' + item[i] + '\t';
				}
			}
		}
		return s;
	}
	var el = $('#' + id)[0];
	el.innerHTML = '';
	for (var i = 0; i < q.length; i++) {
		var list = q[i];
		var div = document.createElement('div');
		div.className = 'item noselect';
		el.appendChild(div);
		if (list instanceof Array) {
			for (var j = 0; j < list.length; j++) {
				var item = list[j];
				div.innerHTML += text(item);
			}
		} else {
			div.innerHTML += text(list);
		}
	}
}

function showpt(pt, rel) {
	if (!rel) {
		rel = document.body;
	}
	pt = point2el(pt, rel);
	var pel = rel.$pel$;
	if (!pel) {
		var json = {
			tag: 'div',
			style: {
				position: 'absolute',
				left: pt[0] + 'px',
				top: pt[1] + 'px',
				width: '24px',
				height: '24px',
				overflow: '',
				borderLeft: 'solid 1px gray',
				borderTop: 'solid 1px gray'
			},
			$: {
				tag: 'div',
				style: {
					position: 'absolute',
					right: '23px',
					bottom: '23px',
					width: '24px',
					height: '24px',
					borderRight: 'solid 1px gray',
					borderBottom: 'solid 1px gray'
				}
			},
			update: function(p) {
				this.style.left = p[0] + 'px';
				this.style.top = p[1] + 'px';
			}
		}
		pel = joy.jbuilder(json);
		rel.appendChild(pel);
		rel.$pel$ = pel;
	} else {
		pel.update(pt);
	}
}

function showTouches(target, q) {
	function showTouch(target, t) {
		if (t.act.indexOf('touch') >= 0) {
			var r = 14;
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.left = t.rpos[0] - r + 'px';
			div.style.top = t.rpos[1] - r + 'px';
			div.style.width = r * 2 + 'px';
			div.style.height = r * 2 + 'px';
			div.style.borderRadius = r + 'px';
			div.style.border = 'solid 3px silver';
			target.appendChild(div);
		}
	}
	var d = null;
	if (!target.$touches$) {
		d = document.createElement('div');
		target.$touches$ = d;
		target.appendChild(d);
	} else {
		d = target.$touches$;
		d.innerHTML = '';
	}
	if (!q) {
		return;
	}
	if (q instanceof Array) {
		for (var i = 0; i < q.length; i++) {
			var list = q[i];
			if (list instanceof Array) {
				for (var j = 0; j < list.length; j++) {
					var item = list[j];
					showTouch(d, item);
				}
			} else {
				showTouch(d, list);
			}
		}
	} else {
		showTouch(d, q);
	}
}

function addmask() {
	if (!document.body.$mask$) {
		var div = document.createElement('div');
		document.body.$mask$ = div;
		$(div).addClass('z-topmost crop noborder noselect transparent fill-fixed');
		document.body.appendChild(div);
	}
	return document.body.$mask$;
}

function showbound(target) {
	var mask = addmask();
	var r = target.getBoundingClientRect();
	var div = target.$bound$;
	if (!div) {
		div = document.createElement('div');
		target.$bound$ = div;
	}
	div.style.position = 'fixed';
	div.style.left = r.left + 'px';
	div.style.top = r.top + 'px';
	div.style.width = r.width + 'px';
	div.style.height = r.height + 'px';
	div.style.border = 'solid 1px gray';
	mask.appendChild(div);
}
