(function () {
	// target: Target element to be manipulated
	// handler: Element which monitors event
	// behavior: Predefined behavior name
	// rel: Relative element for calc pos
	function dragger(c) {
        var behaviors = {
        	dragger: {
        		onmove: function (tevt) {
        			var rect = rc(target, rel);
        			var d = [tevt.pos[0] - initevt.pos[0], tevt.pos[1] - initevt.pos[1]];
        			target.style.left = initstate.left + d[0] + 'px';
        			target.style.top = initstate.top + d[1] + 'px';
        			console.log('drag move');
        		}
        	}, resize3: {
        		onmove: function (tevt) {
        			var rect = rc(target, rel);
        			var d = [tevt.pos[0] - initevt.pos[0], tevt.pos[1] - initevt.pos[1]];
        			target.style.width = initstate.width + d[0] + 'px';
        			target.style.height = initstate.height + d[1] + 'px';
        			console.log('drag resize');
        		}
        	}, resize7: {
        		onmove: function (tevt) {
        			var rect = rc(target, rel);
        			var d = [tevt.pos[0] - initevt.pos[0], tevt.pos[1] - initevt.pos[1]];
        			target.style.width = initstate.width - d[0] + 'px';
        			target.style.height = initstate.height - d[1] + 'px';
        			target.style.left = initstate.left + d[0] + 'px';
        			target.style.top = initstate.top + d[1] + 'px';
        			console.log('drag resize');
        		}
        	}
        };

        var initstate = null;
        var activated = false;
        var initevt = null;
        var target = c.target;
        var handler = c.handler;
        var behavior = behaviors[c.behavior];
        var rel = c.rel;
        var r = {
            isActive: function () {
                return activated;
            }, isStarted: function () {
                return initstate != null;
            }, activate: function (ei) {
                //if (!ei || (rc(handler).point2in(ei.pos) && document.elementFromPoint(ei.pos[0], ei.pos[1]) == handler)) {
                if (!ei || document.elementFromPoint(ei.pos[0], ei.pos[1]) == handler){
                    activated = true;
                } else {
                    activated = false;
                }
                return activated;
            }, deactivate: function () {
                activated = false;
            }, start: function (tevt) {
                if (this.isActive()) {
                    console.log('drag start');
                    initevt = tevt;
                    initstate = rc(target, rel);
                    if (behavior && behavior.onstart) {
                    	behavior.onstart.call(this, tevt);
                    }
				}
            }, move: function (tevt) {
                if (this.isActive() && this.isStarted() && behavior && behavior.onmove) {
                    behavior.onmove.call(this, tevt);
                }
            }, end: function (tevt) {
                initstate = null;
                initevt = null;
                if (this.isActive()) {
                    console.log('drag end');
                    if (behavior && behavior.onend) {
                    	behavior.onend.call(this, tevt);
                    }
				}
            }
        }
        return r;
    }
    window.dragger = dragger;

    function draggable(c) {
    	var finger = c.finger || window.finger;
        var dh = dragger(c);
        function oncapture(q) {
            var h = dh;
            if (q && q.length > 0) {
                var tcs = q[q.length - 1];
                if (tcs.length == 1) {
                    var ei = tcs[0];
                    if (ei.act.indexOf('touchstart') >= 0) {
                        var r = h.activate(ei);
                        h.start(ei);
                        return r;
                    } else if (ei.act.indexOf('touchmove') >= 0) {
                        h.move(ei);
                        return h.isStarted();
                    } else if (ei.act.indexOf('touchend') >= 0) {
                        h.end(ei);
                        h.deactivate();
                    }
                    return false;
                }
                return false;
            }
            return false;
        }

        function onrecognize(q) {
            return false;
        }

        finger.add({
            name: c.name || 'draggable_' + joy.uid()
            , oncapture: function (q) {
                var r = oncapture(q);
                logcapture(q);
                return r;
            }, onrecognize: function (q) {
                var r = onrecognize(q);
                logrecognize(q);
                return r;
            }, onremove: c.onremove || function () {
                dh.deactivate();
                console.log('Removed:' + dh.isActive());
            }
        });
        var r = {
            dispose: function () {
                finger.remove(c.name);
            }
        }
        return r;
    }
    window.draggable = draggable;

    function resizable(el, rel, finger) {
    	el.deactivate = function () {
    		// Will be initialized in activation process
			// Should not be removed
    	}
    	el.activate = function () {
    		function dispose() {
    			for (var i in rb) {
    				el.removeChild(rb[i]);
    				delete rb[i];
    			}
    			r3.dispose();
    			r7.dispose();
    		}
    		el.deactivate = dispose;
    		var rb = el.$resizable$;
    		if (!rel) {
    			rel = document.body;
    		}
    		if (!rb) {
    			rb = {};
    			el.$resizable$ = rb;
    		}

    		if (!rb.resizer3) {
    			rb.resizer3 = joy.jbuilder({ tag: 'div', alias: 'resizer3', className: 'resizer rb' });
    			el.appendChild(rb.resizer3);
    		}

    		if (!rb.resizer7) {
    			rb.resizer7 = joy.jbuilder({ tag: 'div', alias: 'resizer7', className: 'resizer lt' });
    			el.appendChild(rb.resizer7);
    		}

    		var r3 = draggable({
    			handler: rb.resizer3
				, name: 'resize3' + joy.uid()
				, target: el
				, rel: rel
				, behavior: 'resize3'
				, onremove: dispose
				, finger: finger
    		});

    		var r7 = draggable({
    			handler: rb.resizer7
				, name: 'resize7' + joy.uid()
				, target: el
				, rel: rel
				, behavior: 'resize7'
				, onremove: dispose
				, finger: finger
    		});
    	}
    	el.activate();
    	return {
    		dispose: function () {
    			el.deactivate();
    		}
    	}
	}
    window.resizable = resizable;
})();