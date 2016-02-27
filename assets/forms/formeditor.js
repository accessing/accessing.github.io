function trigger(o, args) {
	if (typeof (o) == 'function') {
		return o(args);
	}
	return o;
}
function formeditor(row, c) {
	if (!c) {
		c = {};
	}
	var json = {
		tag: 'div'
        , className: 'formeditor'
        , $: {
        	tag: 'form', alias: 'edtform', name: 'frm', method: 'post', action: trigger.call(c, c.submit, row), enctype: "multipart/form-data", $: [
                {
                	tag: 'div', className: 'title', $: [
                        { tag: 'span', className: 'content', $: trigger(c.title, row) }
                        , {
                        	tag: 'div', className: 'toolbar', $: [
                                {
                                	tag: 'a', className: 'btn save', href: '#', $: 'Submit', onclick: function () {
                                		var editors = this.$root.$$editors;
                                		var error = false;
                                		if (editors) {
                                			for (var i in editors) {
                                				var edt = editors[i];
                                				if (edt.validate && !edt.validate()) {
                                					$(edt).addClass('error');
                                					error = true;
                                				} else {
                                					$(edt).removeClass('error');
                                				}
                                			}
                                		}
                                		if (error) {
                                			return;
                                		}
                                		if (c.save) {
                                			var o = {};
                                			for (var i in editors) {
                                				var edt = editors[i];
                                				var v = edt.getval();
                                				o[i] = v;
                                			}
			                                var upurl = this.$root.$edtform.action; //rep(c, o);
                                			c.save(upurl, o);
                                			overlay({ hide: true });
                                		} else if (c.submit) {
                                			if (!c.onbeforesubmit || c.onbeforesubmit(this)) {
                                				var frm = this.$root.$edtform;
												if (c.target) {
													frm.target = c.target;
												}
                                				frm.submit();
                                				overlay({ hide: true });
											}
                                		}
                                	}
                                }
                                , {
                                	tag: 'a', className: 'btn cancel', href: '#', $: 'Close', onclick: function () {
                                		if (c.cancel) {
                                			c.cancel();
                                		}
                                	}
                                }
                        	]
                        }
                	]
                }
                , {
                	tag: 'div', className: 'formbody', $: [
                        { tag: 'div', className: 'editors', alias: 'form' }
                        , {
                        	tag: 'div', className: 'cmd', alias: 'cmd'
                        }
                	]
                }

        	]
        },
		show: function (c) {
			var el = overlay();
			var tb = this;
			if (c && c.style) {
				simplecopy(c.style, tb.style);
			}
			el.appendChild(tb);
			centerscreen(el);
		}
	};
	var div = joy.jbuilder(json);
	var table = document.createElement('table');
	table.className = 'formcontent';
	var tbody = document.createElement('tbody');
	table.appendChild(tbody);
	if (!row) {
		return table;
	}
	var editors = {};
	for (var i in row) {
		var type = typeof (row[i]);
		if (type == 'function') {
			continue;
		}
		var tr = document.createElement('tr');
		tr.className = 'formrow';

		var tdlabel = document.createElement('td');
		tdlabel.className = 'labelcontainer';
		tdlabel.innerHTML = i;

		tr.appendChild(tdlabel);

		var tdedit = document.createElement('td');
		tdedit.className = 'editorcontainer';

		var edt = null;
		var val = row[i];

		if (c.editor && c.editor[i] && c.editor[i].creator) {
			var f = c.editor[i].creator;
			edt = f.call(c.editor[i], c.editor, row, i);
			editors[i] = edt;
			edt.$editors$ = editors;
			edt.setval(val);
			tdedit.appendChild(edt);
		} else {
			edt = definputcreator(editors, row, i);
			editors[i] = edt;
			edt.$editors$ = editors;
			edt.setval(val);
			tdedit.appendChild(edt);
		}
		if (edt && c.editor && c.editor[i]) {
			joy.extend(edt, c.editor[i])
			edt.validators = c.editor[i].validators;
		}
		edt.validate = function () {
			var list = this.validators;
			if (list) {
				var r = true;
				if (list.length) {
					for (var i = 0; i < list.length; i++) {
						var it = list[i];
						r = r && it(this.getval(), this);
						if (!r) {
							this.error(i);
							break;
						} else {
							this.error();
						}
					}
				} else {
					for (var i in list) {
						var f = list[i];
						if (typeof (f) == 'function') {
							r = r && f(this.getval(), this);
							if (!r) {
								this.error(i);
								break;
							} else {
								this.error();
							}
						}
					}
				}
				return r;
			}
			return true;
		};

		if (c.fields && c.fields[i]) {
			if (c.fields[i].hint) {
				var hint = document.createElement('span');
				hint.className = 'hint';
				hint.innerHTML = trigger(c.fields[i].hint);
				tdedit.appendChild(hint);
			}
		}

		tr.appendChild(tdedit);
		tbody.appendChild(tr);
		if (c.fields && c.fields[i]) {
			if (i == 'vin') {
			}
			joy.extend(tr, c.fields[i]);
		}
	}
	div.$$editors = editors;
	div.$table = table;
	div.$form.appendChild(table);
	return div;
}

/*

@using System.Diagnostics;
@using ThBiz.Business;
@{
    ViewBag.Title = "新首页配置";
}

<link type="text/css" href="http://hive.gitcafe.io/mr/css/toastr.css" rel="stylesheet" />
<link rel="stylesheet" href="/css/yewu.css" />
<link rel="stylesheet" href="/Scripts/controls/controls.css" />
<link rel="stylesheet" href="/css/sector.css" />
<script type="text/javascript" src="http://hive.gitcafe.io/mr/js/toastr.js"></script>
<script src="http://hive.gitcafe.io/joy/js/Common.js"></script>
<script src="http://hive.gitcafe.io/joy/js/joy.js"></script>
<script src="http://hive.gitcafe.io/joy/js/joy.dom.js"></script>
<script src="http://cdn.mindexpress.cn/joy/js/angular/ag.js"></script>
<script src="http://yewu.tuhu.cn/scripts/ajaxfileupload.js"></script>
<script src="@{if (Debugger.IsAttached){<text>/Scripts/controls/common.js</text>}else{<text>http://resource.tuhu.cn/controls/common.js</text>}}"></script>
<script src="@{if (Debugger.IsAttached){<text>/Scripts/controls/formeditor.js</text>}else{<text>http://resource.tuhu.cn/controls/formeditor.js</text>}}"></script>
<script src="@{if (Debugger.IsAttached){<text>/Scripts/controls/grid.js</text>}else{<text>http://resource.tuhu.cn/controls/grid.js</text>}}"></script>
<script src="@{if (Debugger.IsAttached){<text>/Scripts/controls/tower.js</text>}else{<text>http://resource.tuhu.cn/controls/tower.js</text>}}"></script>
@Html.Partial("Titles")
<style>
    .toolbar{
        margin-top:18px;
        line-height:36px;
        font:24px arial;
    }
    .toolbar a{
        float:right;
        font:16px arial;
        margin-left:12px;
        margin-right:12px;
    }
</style>

<script>
    function roweditcfg(cfg) {
        if (!cfg) {
            cfg = {};
        }
        var c = {
            title: '产品配置'
            , editor: {
                position: { validators: [intvalidator, requiredvalidator] }
                , promotionprice: { validators: [floatvalidator, requiredvalidator] }
                , promotionnum: { validators: [intvalidator, requiredvalidator] }
                , state: { validators: [intvalidator, requiredvalidator] }
                , pid: { validators: [requiredvalidator] }
            }
            , fields: {
                rownum: { style: { display: 'none' } }
                , advertiseid: { style: { display: 'none' } }
                , createdatetime: { style: { display: 'none' } }
                , lastupdatedatetime: { style: { display: 'none' } }
                , new_modelid: { style: { display: 'none' } }
                , pid: { childNodes: [{ innerHTML: '产品型号' }] }
                , position: { childNodes: [{ innerHTML: '位置' }] }
                , state: { onkeypress: intvalidator, childNodes: [{ innerHTML: '启用状态' }] }
                , promotionprice: { childNodes: [{ innerHTML: '金额' }] }
                , promotionnum: { childNodes: [{ innerHTML: '数量' }] }
            }
            , submit: function (row) {
                var s = '/idx/saveprod?a=' + cfg.action + '&mid=' + row.new_modelid + '&apptype=' + said + '&id=' + row.pid;
                return s;
            }
            , cancel: function () {
                overlay({ hide: true });
            }
        };
        return c;
    }

    var mid = 0;
    function view() {
        mid = parseInt('@ViewBag.mid');
        $.ajax({ url: '/idx/moduleprods', data: { mid: mid } }).done(function (data) {
            console.log(data);
            var rows = JSON.parse(data);
            if (rows.error) {
                toastr.info(rows.Msg);
                return;
            }
            var tb = grid(rows, {
                columns: {
                    rownum: { style: { display: 'none' } }
                    , advertiseid: { style: { display: 'none' } }
                    , createdatetime: { style: { display: 'none' } }
                    , lastupdatedatetime: { style: { display: 'none' } }
                    , new_modelid: { style: { display: 'none' } }
                    , pid: { innerHTML: '产品型号' }
                    , position: { innerHTML: '位置' }
                    , state: { onkeypress: intvalidator,  innerHTML: '启用状态' }
                    , promotionprice: {  innerHTML: '金额' }
                    , promotionnum: { innerHTML: '数量' }
                    , $added: function (tr, row) {
                        var tda = document.createElement('td');
                        tda.className = 'col';
                        tr.appendChild(tda);
                    }
                },
                rows: {
                    $added: function (tr, row) {
                        var tdu = gridoption(row, {
                            txt: '更改'
                            , tag: 'span'
                            , behavior: gridOptionFormBehavior
                            , callback: view
                            , roweditor: roweditcfg()
                        });
                        tr.appendChild(tdu);
                        var cc = {
                            txt: '删除'
                            , url: '/idx/removeprod?id=' + row.pid + '&apptype=@ViewBag.aid&mid=' + row.new_modelid + '&new_modelid=' + row.new_modelid
                            , tag: 'span'
                            , behavior: gridOptionAjaxBehavior
                            , callback: view
                        };
                        row.new_modelid = mid;
                        var tdr = gridoption(row, cc);
                        var tdo = document.createElement('td');
                        tdo.appendChild(tdu);
                        tdo.appendChild(tdr);
                        tr.appendChild(tdo);
                    }
                },
            });
            $('#gridarea')[0].innerHTML = '';
            $('#gridarea')[0].appendChild(tb);
        });
    }
    $(function () {
        $('#titleplace').html(title);
        view();
        $('#badd').click(function () {
            var dd = new Date();
            var el = formeditor({
                pid: ''
                , advertiseid: dd.getMonth() + '' + dd.getDate() + '' + dd.getHours() + '' + dd.getMinutes() + '' + dd.getSeconds() 
                , new_modelid: mid
                , position: 1
                , state: 1
                , promotionprice: 0
                , promotionnum: 1
            }, roweditcfg({ action: '1' }));
            el.show();
        });
    });
</script>
<div class="toolbar">产品管理 - <span id="titleplace"></span><a id="badd" href="#">添加产品</a><a id="bret" href="/idx/edit">返回模块管理</a></div>
<div id="gridarea">

</div>


*/