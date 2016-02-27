(function () {
	var steps = [];
	var parallel = [];
	parallel[0] = steps;
	var running = false;
	function animate(step, options) {
		function worker(time) {
			for (var i = 0; i < parallel.length; i++) {
				var steps = parallel[i];
				//console.log(steps.length);
				if (steps.length > 0) {
					var step = steps[0];
					if (step.done) {
						var ds = steps.splice(0, 1);
						if (ds.dispose) {
							ds.dispose();
						}
						parallel[i] = steps;
					} else {
						step.run(time);
					}
				} else {
					parallel.splice(i, 1);
					i--;
				}
			}
			if (parallel.length < 1) {
				running = false;
				return;
			}
			window.requestAnimationFrame(worker);
		}
		if (!options) {
			options = {};
		}
		var active = parallel[0];
		if (options.async) {
			active = [];
			parallel[parallel.length] = active;
		}
		active.add(step);
		if (!running) {
			running = true;
			window.requestAnimationFrame(function(time) {
				worker(time);
			});
		}
	}

	window.animate = animate;
	//function animate(callback, args) {
	//	function worker(time) {
	//		var r = callback(time, args);
	//		if (!r || r.done()) {
	//			return;
	//		}
	//		window.requestAnimationFrame(worker);
	//	}

	//	window.requestAnimationFrame(function (time) {
	//		worker(time);
	//	});
	//}


})();
