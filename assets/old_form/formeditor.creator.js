function definputcreator(editors, row, i) {
	var c = this.c || editors[i];
	var input = document.createElement('input');
	input.name = i;
	input.className = 'editor';
	input.getval = function () {
		return this.value;
	};
	input.setval = function (val) {
		this.value = val;
	};
	var json = {
		tag: 'div',
		className: 'editor',
		getval: function() {
			return this.$box.value;
		},
		setval: function(val) {
			this.$box.value = val;
		},
		$: {
			tag: 'input',
			alias: 'box',
			name: i
		}
	}
	var el = joy.jbuilder(json);
	joy.extend(el, c);
	return input;
}

function inputbtncreator(editors, row, i) {
	var c = this.c || editors[i];

	var json = {
		tag: 'div'
        , className: 'inputbtncreator editor'
        , setval: function (data) {
        	this.$box.value = data;
        }
        , getval: function () {
        	return this.$box.value;
        }
        , $: [
            { tag: 'input', alias: 'box', name: i }, {
            	tag: 'button', alias: 'btn', type: 'button', $: c.btntext, onclick: function () {
            		var root = this.$root;
            		if (root.click) {
            			root.click(editors);
            		}
            	}
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
        }
        , $: [
            { tag: 'img', className:'preview', alias: 'img', style: { display: 'none' } }
            , { tag: 'input', alias: 'box', className: 'url', name: i }
			, {tag:'div', className:'file button', $: [{tag:'span', $:'...'},{
					tag: 'input',
					alias: 'input',
					name: 'up_' + i,
					type: 'file',
					onchange: function() {
						var root = this.$root;
						$(root.$input).AjaxFileUpload({
							action: c.url,
							onChange: c.onchange,
							onSubmit: c.onsubmit,
							onComplete: c.oncomplete // function(filename, response){}
						});
					}
				}]
			}
		]
	};
	var el = joy.jbuilder(json);
	joy.extend(el, c);
	return el;
}
