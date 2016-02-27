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
						success(json);
					} else {
						if (error) {
							error(json);
						}
					}
				} catch (e) {
					if (error) {
						error(e);
					}
				}
			}, error: function (data) {
				console.log(data);
				if (error) {
					error(data);
				}
			}
		});
	}
	window.upload = upload;
})();