(function() {
	function table(cfg) {
		function getcolumn(cell, cb) {
			var index = $(cell).index();
			var t = cell.$row$.$table$;
			var list = $(t).children();
			var col = [];
			for (var i = 0; i < list.length; i++) {
				var el = $(list[i]).children()[index];
				if (cb) {
					cb(el);
				}
				col[col.length] = el;
			}
			return col;
		}

		function getrow(cell, cb) {
			var r = $(cell.parentElement).children();
			if (cb) {
				for (var i = 0; i < r.length; i++) {
					cb(r[i]);
				}
			}
			return r;
		}

		function getactive() {
			return activecells;
		}

		function activatecell(cell) {
			deactivatecell();
			activecells = cell;
			$(activecells).addClass('selected');
			getcolumn(cell, function (el) {
				$(el).addClass('highlight');
			});
			getrow(cell, function (el) {
				$(el).addClass('highlight');
			});
			var v = cell.getval();
			if (cfg.editor) {
				cfg.editor.setval(v.text == '&nbsp;' ? '' : v.text);
				cfg.editor.focus();
				cfg.editor.setSelectionRange(0, cfg.editor.value.length);
			}
			cfg.activetb = cell.$row$.$table$;
		}

		function deactivatecell(cell) {
			if (activecells) {
				getcolumn(activecells, function (el) {
					$(el).removeClass('selected').removeClass('highlight');
				});
				getrow(activecells, function (el) {
					$(el).removeClass('selected').removeClass('highlight');
				});
				$(activecells).removeClass('selected');
				activecells = null;
			}
		}

		function cell() {
			var json = {
				tag: 'div',
				className: 'box',
				activate: function (state) {
					if (!state) {
						activatecell(this);
					} else {
						deactivatecell(this);
					}
				},
				isempty: function () {
					var r = this.$vbox.innerHTML.length <= 0 && !this.$subtable;
					return r;
				},
				setval: function (data) {
					function setext(text) {
						if (text && text != '' && text != ' ' && text != '&nbsp;') {
							$(this).addClass('dirty');
						} else {
							$(this).removeClass('dirty');
						}
						this.$vbox.innerHTML = text;
					}

					var t = typeof (data);
					if (t == 'object') {
						setext.call(this, data.text);
						if (data.ext) {
							this.$ext.innerHTML = '';
							var tb = table(cfg);
							tb.setdata(data.ext);
							this.$subtable = tb;
							this.detail(tb);
						}
					} else {
						setext.call(this, data);
					}
				},
				clear: function () {
					this.setval('');
				},
				getval: function () {
					var v = { text: this.$vbox.innerHTML };
					if (this.$subtable) {
						v.ext = this.$subtable.getdata();
					}
					return v;
				},
				isheadwall: function () {
					//return $(this.$row$).hasClass('head') || $(this).hasClass('wall');
					return false;
				},
				spawn: function (w, h, undef) {
					if (w === undef) {
						w = 2;
					}
					if (h === undef) {
						h = 2;
					}
					var tb = table(cfg);
					$(tb).addClass('fill');
					tb.newRow(w, h);
					this.$subtable = tb;
					tb.$basecell = this;
					this.detail(tb);
					deactivatecell(this);
					tb.select(0, 0);
					return tb;
				},
				detail: function (tb) {
					if (!this.$indetail$) {
						this.$indetail$ = true;
						this.$ext.appendChild(tb);
						$(this.$ext).show();
					} else {
						this.$indetail$ = false;
						$(this.$ext).hide();
					}
				},
				onclick: function (event) {
					if (!cfg.readonly) {
						this.$vbox.activate();
					}
					event.preventDefault();
					event.stopPropagation();
					return false;
				},
				$: [
					{
						tag: 'div',
						alias: 'vbox',
						className: 'vbox',
						activate: function () {
							if (!this.$root.isheadwall()) {
								this.$root.activate($(this.$root).hasClass('selected'));
							}
						},
						onclick: function (event) {
							if (!cfg.readonly) {
								this.activate();
							}
							event.preventDefault();
							event.stopPropagation();
							return false;
						}
					}, { tag: 'div', alias: 'ext', className: 'ext', style: { display: 'none' } }
				]
			}
			var el = joy.jbuilder(json);
			return el;
		}

		function row() {
			var json = {
				tag: 'div',
				className: 'box-row',
				newCell: function (n, pos, undef) {
					var cells = [];
					var ch = $(this).children();
					for (var i = 0; i < n; i++) {
						var el = cell();
						el.setval('');
						el.$row$ = this;
						cells[cells.length] = el;
						if (pos === undef || pos >= ch.length) {
							this.appendChild(el);
						} else {
							$(el).insertBefore(ch[pos]);
						}
					}
					return cells;
				}, isempty: function () {
					var ch = $(this).children();
					for (var i = 0; i < ch.length; i++) {
						var cell = ch[i];
						if (!cell.isempty()) {
							return false;
						}
					}
					return true;
				}, setval: function (data) {
					if (!data) {
						return;
					}
					for (var i = 0; i < data.length; i++) {
						var cdata = data[i];
						var cell = this.select(cdata.index, true);
						if (cell) {
							cell.setval(cdata.data);
						}
					}
				}, getval: function () {
					var r = [];
					var ch = $(this).children();
					for (var i = 0; i < ch.length; i++) {
						var cell = ch[i];
						if (!cell.isempty()) {
							r[r.length] = {
								index: i,
								data: cell.getval()
							};
						}
					}
					return r;
				}, getcell: function (n) {
					var cols = $(this).children();
					if (cols && cols.length > 0 && n >= 0 && n < cols.length) {
						return cols[n];
					}
					return null;
				}, del: function (n) {
					var ch = $(this).children();
					if (n >= 0 && n < ch.length) {
						$(ch[n]).remove();
					}
				}, select: function (n, noactivate) {
					var cols = $(this).children();
					if (cols && cols.length > 0 && n >= 0 && n < cols.length) {
						var cell = cols[n];
						if (!cell.isheadwall()) {
							if (!noactivate) {
								activatecell(cell);
							}
							return cell;
						}
					}
					return null;
				}, ech: function (cb) {
					if (cb) {
						var ch = $(this).children();
						for (var i = 0; i < ch.length; i++) {
							cb(ch[i], i);
						}
					}
				}
			}
			var el = joy.jbuilder(json);
			return el;
		}

		var activecells = null;
		var json = {
			tag: 'div',
			className: 'boxer',
			newRow: function (n, m, pos, undef) {
				function headwall(r, i, pos) {
					if (i == 0) {
						if (pos === undef) {
							$(r).addClass('head');
						}
						r.ech(function (cell, idx) {
							if (idx == 0) {
								$(cell).addClass('wall');
							}
						});
					} else {
						var c = r.getcell(0);
						$(c).addClass('wall');
					}
				}

				var rows = [];
				if (m === undef) {
					m = 0;
					var ch = $(this).children();
					if (ch && ch.length > 0) {
						var cols = $(ch[0]).children();
						if (cols && cols.length > 0) {
							m = cols.length;
						}
					}
				}
				if (n === undef) {
					n = 1;
				}
				if (m < 1) {
					return rows;
				}
				var ch = $(this).children();
				for (var i = 0; i < n; i++) {
					var r = row();
					r.newCell(m);
					//headwall(r, i, pos);
					r.$table$ = this;
					rows[rows.length] = r;
					if (pos === undef || pos >= ch.length) {
						this.appendChild(r);
					} else {
						$(r).insertBefore($(ch[pos]));
					}
				}
				return rows;
			}, getdata: function () {
				var r = {
					type:'cells',
					size: { rows: 0, cols: 0 },
					rows: []
				};
				var ch = $(this).children();
				if (ch.length > 0) {
					r.size.rows = ch.length;
					var rw = ch[0];
					var cch = $(rw).children();
					r.size.cols = cch.length;
					for (var i = 0; i < ch.length; i++) {
						rw = ch[i];
						if (!rw.isempty()) {
							r.rows[r.rows.length] = { index: i, cells: rw.getval() };
						}
					}
				}
				return r;
			}, setdata: function (data) {
				if (!data || !data.size) {
					return;
				}
				this.newRow(data.size.rows, data.size.cols);
				if (data.rows) {
					for (var i = 0; i < data.rows.length; i++) {
						var drow = data.rows[i];
						var rw = this.select(drow.index);
						rw.setval(drow.cells);
					}
				}
			}, setval: function (text) {
				try {
					var cell = getactive();
					if (!cell) {
						cell = $($(this).children()[0]).children()[0];
					}
					if (cell) {
						cell.setval(text);
					}
				} catch (e) {

				}
			}, select: function (y, x, undef) {
				if (y === undef && x === undef) {
					return getactive();
				}
				var rows = $(this).children();
				if (rows && rows.length > 0 && y >= 0 && y < rows.length) {
					var r = rows[y];
					if (x === undef) {
						return r;
					}
					return r.select(x);
				}
				return null;
			}, addabove: function (cell, undef) {
				if (!cell) {
					cell = getactive();
				}
				var row = cell.$row$;
				var index = $(row).index();
				this.newRow(1, undef, index);
				activatecell(cell);
			}, addbelow: function (cell, undef) {
				if (!cell) {
					cell = getactive();
				}
				var row = cell.$row$;
				var index = $(row).index();
				this.newRow(1, undef, index + 1);
				activatecell(cell);
			}, addleft: function (cell, undef) {
				if (!cell) {
					cell = getactive();
				}
				var index = $(cell).index();
				var tb = cell.$row$.$table$;
				var rs = $(tb).children();
				for (var i = 0; i < rs.length; i++) {
					var r = rs[i];
					r.newCell(1, index);
				}
				activatecell(cell);
			}, addright: function (cell, undef) {
				if (!cell) {
					cell = getactive();
				}
				var index = $(cell).index();
				var tb = cell.$row$.$table$;
				var rs = $(tb).children();
				for (var i = 0; i < rs.length; i++) {
					var r = rs[i];
					r.newCell(1, index + 1);
				}
				activatecell(cell);
			}, movebelow: function (cell, noadd) {
				if (!cell) {
					cell = getactive();
					var cindex = $(cell).index();
					var index = $(cell.$row$).index();
					var tb = cell.$row$.$table$;
					var ch = $(tb).children();
					if (!noadd && index >= ch.length - 1) {
						this.addbelow(cell);
					} else if (noadd && index >= ch.length - 1) {
						return false;
					}
					if (index < ch.length - 1) {
						var r = ch[index + 1];
						var c = $(r).children()[cindex];
						if (c) {
							c.activate();
						}
					}
				} else {
					cell = getactive();
					var idx = $(cell).index();
					var ch = $(cell.$row$.$table$).children();
					var rw = ch[ch.length - 1];
					var c = rw.getcell(idx);
					c.activate();
				}
				return true;
			}, moveup: function (cell) {
				if (!cell) {
					cell = getactive();
					var cindex = $(cell).index();
					var index = $(cell.$row$).index();
					var tb = cell.$row$.$table$;
					var ch = $(tb).children();
					if (index > 0) {
						var r = ch[index - 1];
						var c = $(r).children()[cindex];
						if (c) {
							c.activate();
						}
					}
				} else if (cell === true) {
					cell = getactive();
					var idx = $(cell).index();
					var rw = $(cell.$row$.$table$).children()[1];
					var c = rw.getcell(idx);
					c.activate();
				}
			}, moveleft: function (cell) {
				if (!cell) {
					cell = getactive();
					var cindex = $(cell).index();
					if (cindex > 0) {
						var c = $(cell.$row$).children()[cindex - 1];
						c.activate();
					}
				} else if (cell === true) {
					cell = getactive();
					var ch = $(cell.$row$).children();
					cell = ch[1];
					cell.activate();
				}
			}, moveright: function (cell, noadd) {
				if (!cell) {
					cell = getactive();
					var cindex = $(cell).index();
					var ch = $(cell.$row$).children();
					if (!noadd && cindex >= ch.length - 1) {
						this.addright(cell);
					} else if (noadd && cindex >= ch.length - 1) {
						return false;
					}
					if (cindex < ch.length - 1) {
						var c = ch[cindex + 1];
						c.activate();
					}
				} else if (cell === true) {
					cell = getactive();
					var ch = $(cell.$row$).children();
					cell = ch[ch.length - 1];
					cell.activate();
				}
				return true;
			}, delrow: function (cell) {
				if (this.islastrow()) {
					this.dispose();
					return;
				}
				if (!cell) {
					cell = getactive();
				}
				if (!this.movebelow(null, true)) {
					this.moveup();
				}
				$(cell.$row$).remove();
			}, delcol: function (cell) {
				if (this.islastcol()) {
					this.dispose();
					return;
				}
				if (!cell) {
					cell = getactive();
				}

				var idx = $(cell).index();
				if (!this.moveright(null, true)) {
					this.moveleft();
				}
				var rs = $(cell.$row$.$table$).children();
				for (var i = 0; i < rs.length; i++) {
					var r = rs[i];
					r.del(idx);
				}
			}, islast: function () {
				var ch = $(this).children();
				return ch.length == 1 && $(ch[0]).children().length == 1;
			}, islastrow: function () {
				var ch = $(this).children();
				return ch.length == 1;
			}, islastcol: function () {
				var ch = $(this).children();
				return $(ch[0]).children().length == 1;
			}, dispose: function () {
				if (this.$basecell) {
					var c = this.$basecell;
					c.$subtable = null;
					c.activate();
				}
				$(this).remove();
			}
		};

		var el = joy.jbuilder(json);
		document.onkeyup = function (event) {
			//console.log(document.activeElement);
			var cell = getactive();
			if (cell && event.keyCode == 46 && document.activeElement.tagName != 'input') {
				cell.clear();
			}
		};

		if (cfg.editor) {
			var editor = cfg.editor;
			editor.onkeydown = function(event) {
				var el = cfg.activetb;
				if (event.keyCode == 9) {
					el.setval(this.value);
					this.value = '';
					el.moveright();
					event.preventDefault();
				} else if (this.value.length < 1 || event.ctrlKey) {
					if (event.keyCode == 38) {
						el.moveup();
						event.preventDefault();
					} else if (event.keyCode == 40) {
						el.movebelow();
						event.preventDefault();
					} else if (event.keyCode == 37) {
						el.moveleft();
						event.preventDefault();
					} else if (event.keyCode == 39) {
						el.moveright();
						event.preventDefault();
					} else if (event.keyCode == 36) {
						el.moveleft(true);
						event.preventDefault();
					} else if (event.keyCode == 35) {
						el.moveright(true);
						event.preventDefault();
					} else if (event.keyCode == 33) {
						el.moveup(true);
						event.preventDefault();
					} else if (event.keyCode == 34) {
						el.movebelow(true);
						event.preventDefault();
					}
				}
			};

			editor.onkeyup = function(event) {
				var el = cfg.activetb;
				if (event.keyCode == 27) {
					this.value = '';
				} else if (event.keyCode == 13) {
					el.setval(this.value);
					this.value = '';
					el.movebelow();
				} else {
					el.setval(this.value);
				}
			};

			editor.setval = function(text) {
				this.value = text;
			};
		}
		return el;
	}

	function newtable(settings, d) {
		var vtb = table(settings);
		settings.activetb = vtb;
		var json = d; // || { "size": { "rows": 6, "cols": 12 }, "rows": [{ "index": 0, "cells": [{ "index": 0, "data": { "text": "This is test" } }] }, { "index": 1, "cells": [{ "index": 1, "data": { "text": "Another test", "ext": { "size": { "rows": 3, "cols": 3 }, "rows": [{ "index": 0, "cells": [{ "index": 0, "data": { "text": "Inside the spawn" } }] }, { "index": 1, "cells": [{ "index": 1, "data": { "text": "Middle of spawn" } }] }, { "index": 2, "cells": [{ "index": 2, "data": { "text": "Third spawn", "ext": { "size": { "rows": 3, "cols": 3 }, "rows": [{ "index": 1, "cells": [{ "index": 1, "data": { "text": "Center of third spawn" } }] }] } } }] }] } } }] }] };
		if (json && json.size) {
			settings.activetb.setdata(json);
		} else {
			settings.activetb.newRow(1, 1);
		}
		if (!settings.readonly) {
			settings.activetb.select(0, 0);
		}
		settings.scene.append(vtb);
		return vtb;
	}

	window.table = table;
	window.newtable = newtable;
})();
