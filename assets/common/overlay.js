function overlay(c) {
	var el = document.body.$overlayel$;
	var oel = null;

	if (!el) {
		el = document.createElement('div');
		el.$evtrap$ = true;
		el.className = 'overlay';
		oel = document.createElement('div');
		oel.className = 'overlaybox';
		el.oel = oel;
		el.hide = function () {
			var oel = this.oel;
			$(oel).hide();
			$(this).hide();
		};
		document.body.appendChild(el);
		document.body.appendChild(oel);
		document.body.$overlayel$ = el;
	} else {
		oel = el.oel;
	}
	if (!c) {
		el.hide();
		return;
	}
	if (c && c.style) {
		joy.extend(oel.style, c.style);
	}

	if (!c || !c.hide) {
		$(el).show();
		$(oel).show();
	} else {
		$(el).hide();
		$(oel).hide();
	}

	oel.innerHTML = '';
	if (c && c.$) {
		oel.appendChild(c.$);
		if (c.$.activate) {
			c.$.activate();
		}
	}
	return oel;
}
