function showerror(el, err) {
	if (err) {
		var json = {
			tag: 'div',
			className: 'floaterr',
		}
		var e = joy.jbuilder(json);
		e.innerHTML = err;
		el.appendChild(e);
		el.$err$ = e;
	} else if (el.$err$) {
		destroy(el.$err$);
	}
}

function definputcreator(editors, row, i) {
	var c = this.c || editors[i];
	var json = {
		tag: 'div',
		className: 'default editor',
		getval: function() {
			return this.$box.value;
		},
		setval: function(val) {
			this.$box.value = val;
		},
		error: function (i, undef) {
			if (i !== undef) {
				$(this).addClass('error');
				var err = this.err[i];
				showerror(this, err);
			} else {
				$(this).removeClass('error');
				showerror(this);
			}
		},
		$: {
			tag: 'input',
			alias: 'box',
			onfocus: function () {
				this.$root.error();
			},
			name: i
		}
	}
	var el = joy.jbuilder(json);
	joy.extend(el, c);
	return el;
}

function inputbtncreator(editors, row, i) {
	var c = this.c || editors[i];

	var json = {
		tag: 'div',
		className: 'inputbtncreator editor',
		setval: function(data) {
			this.$box.value = data;
		},
		getval: function() {
			return this.$box.value;
		},
		error: function (i, undef) {
			if (i !== undef) {
				$(this).addClass('error');
				var err = this.err[i];
				showerror(this, err);
			} else {
				$(this).removeClass('error');
				showerror(this);
			}
		},
		$: [
			{
				tag: 'input', alias: 'box', onfocus: function () {
					this.$root.error();
				},
				name: i
			},
			{
				tag: 'button',
				alias: 'btn',
				type: 'button',
				$: c.btntext,
				onclick: function() {
					var root = this.$root;
					if (root.click) {
						root.click(editors);
					}
				}
			},
			{
				tag: 'div',
				className: 'clearboth'
			}
		]
	};
	var el = joy.jbuilder(json);
	joy.extend(el, c);
	return el;
}

function imgupcreator(editors, row, i) {
	var c = this.c || editors[i];

	var json = {
		tag: 'div'
        , className: 'imgupcreator editor'
        , setval: function (data) {
        	this.$img.src = data;
        	this.$box.value = data;
        	if (data && data != '') {
        		$(this.$img).show();
        	}
        }
        , getval: function (data) {
        	return this.$box.value;
        },
        error: function (i, undef) {
        	if (i !== undef) {
        		$(this).addClass('error');
        		var err = this.err[i];
        		showerror(this, err);
        	} else {
        		$(this).removeClass('error');
        		showerror(this);
        	}
        },
        $: [
            { tag: 'img', className:'preview', alias: 'img', style: { display: 'none' } }
            , {
            	tag: 'input', alias: 'box', className: 'url', onfocus: function () {
            		this.$root.error();
            	},
            	name: i
            }
			, { tag:'div', className:'file button', $: [{tag:'span', $:'...'},{
					tag: 'input',
					alias: 'input',
					name: 'up_' + i,
					type: 'file',
					onchange: function() {
						var root = this.$root;
						if (!c.url) {
							c.url = '/ajax/upload';
						}
						upload(root.$input, c.url, c.success || function (data) {
							if (data && data.IsNoException) {
								var files = data.Result;
								if (files && files.length > 0) {
									var file = files[0];
									var root = this.$root;
									$(root).removeClass('error');
									root.setval(file);
								}
							}
						}, c.error || function(data) {
							var root = this.$root;
							$(root).addClass('error');
						});
					}
				}]
			}
			, { tag:'div', className:'clearboth' }
		]
	};
	var el = joy.jbuilder(json);
	joy.extend(el, c);
	return el;
}
