function intvalidator(event, target) {
	var code = event.keyCode || event.charCode;
	if (code) {
		data = event.keyCode;
		return (/[\d]/.test(String.fromCharCode(code)));
	}
	return parseInt(event) == event;
}
function requiredvalidator(data, target) {
	if (!data || data == '') {
		return false;
	}
	return true;
}
function floatvalidator(event, target) {
	var code = event.keyCode || event.charCode;
	if (code) {
		return (/[\d.]/.test(String.fromCharCode(code)));
	}
	return parseFloat(event) == event;
}
