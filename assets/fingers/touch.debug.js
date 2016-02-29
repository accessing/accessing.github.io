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