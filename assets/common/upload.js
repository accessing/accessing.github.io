(function() {
	function upload(fileInput, url, success, error) {
		if (!fileInput || fileInput.files.length < 1 || !url) {
			return;
		}
		var fd = new FormData();
		for (var i = 0; i < fileInput.files.length; i++) {
			var file = fileInput.files[i];
			fd.append(file.name, file);
		}
		$.ajax({
			url: url,
			data: fd,
			type: 'POST',
			processData: false,
			contentType: false,
			success: function (data) {
				console.log(data);
				try {
					var json = eval('(' + data + ')');
					if (success && !json.error) {
						success.call(fileInput, json);
					} else {
						if (error) {
							error.call(fileInput, json);
						}
					}
				} catch (e) {
					if (error) {
						error.call(fileInput, e);
					}
				}
			}, error: function (data) {
				console.log(data);
				if (error) {
					error.call(fileInput, data);
				}
			}
		});
	}
	function ajax(method, url, args, successcb, errorcb, undef) {
		if (url.indexOf('://') == 0){
			var n = location.href.indexOf('://');
			var schema = location.href.substr(0, n);
			url = schema + url;
		}
		$.ajax({
			url: url,
			method: method,
			data: args,
			success: function (data) {
				if (successcb) {
					var rlt = fromJson(data);
					if ((rlt.error || rlt.IsNoException === false) && errorcb) {
						errorcb(rlt);
					} else {
						successcb(rlt.result);
					}
				}
			},
			error: function(data) {
				if (errorcb) {
					errorcb(data);
				}
			}
		});
	}
	window.upload = upload;
	window.get = function(url, args, success, error) {
		return ajax('get', url, args, success, error);
	};
	window.post = function (url, args, success, error) {
		return ajax('post', url, args, success, error);
	};
})();