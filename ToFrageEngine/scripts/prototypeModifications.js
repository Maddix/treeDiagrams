// http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
// Thanks to fearphage and Brad Larson
if (!String.prototype.format) { // Just to be safe.
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

if (!Array.prototype.any) Array.prototype.any = function(func) {
	var result = false;
	this.map(function(item, index) { if (!result && func(item, index)) result = true; });
	return result;
};
