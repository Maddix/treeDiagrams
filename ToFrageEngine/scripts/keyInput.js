// This uses Jquery 2.0.3 and Jquary-mousewheel(https://github.com/brandonaaron/jquery-mousewheel)
// Note for mousedown/up, event.which ~ 1 for left, 2 for middle, 3 for right

/*
function alphabet(start, end) {
	var first = start, //start.charCodeAt(0),
	    last = end, //end.charCodeAt(0),
	    string = "";
	for (var i=first; i<last; i++) {
	    string += String.fromCharCode(i);
	}
	return string;
}
*/

function Input(creation) {
	var localContainer = {
		version: "1.0",
		requires: "Jquery 2.0.3+ and Jquery-mousewheel",
		defaultKeyMap: { // Keep in mind that the key-codes are from the Jquery event.which, need to add in special characters
			65:"a", 66:"b", 67:"c", 68:"d", 69:"e", 70:"f", 71:"g",
			72:"h", 73:"i", 74:"j", 75:"k", 76:"l", 77:"m", 78:"n",
			79:"o", 80:"p", 81:"q", 82:"r", 83:"s", 84:"t", 85:"u",
			86:"v", 87:"w", 88:"x", 89:"y", 90:"z",
			38:"upArrow", 37:"leftArrow", 36:"rightArrow", 40:"downArrow",
			8:"backspace", 13:"enter", 32:"space", 27:"escape",
			16:"shift", 17:"ctrl", 18:"alt", 9:"tab",
			48:"0", 49:"1", 50:"2", 51:"3", 52:"4",
			53:"5", 54:"6", 55:"7", 56:"8", 57:"9",
			188:",", 190:".", 191:"/", 219:"[", 220:"\\", 221:"]", 192:"`",
			186:";", 222:"'", 189: "-", 187:"=",
			112:"f1", 113:"f2", 114:"f3", 115:"f4", 116:"f5", 117:"f6",
			118:"f7", 119:"f8", 120:"f9", 121:"f10", 122:"f11", 123:"f12",
			1:"LMB", 2:"MMB", 3:"RMB" // Not sure if having these in caps will throw people off.
		},
		defaultShiftKeyMap: {
			49: "!", 50:"@", 51:"#", 52:"$", 53:"%", 54:"^",
			55:"&", 56:"*", 57:"(", 58:")", 189:"_", 187:"+",
			219:"{", 221:"}", 220:"|", 186:":", 222:'"', 188:"<",
			190:">", 191:"?", 192:"~"
		},
		reverseKeyMap: {},
		reverseShiftKeyMap: {}
	};
	localContainer.reverseKeyMap = creation.invert(localContainer.defaultKeyMap);
	localContainer.reverseShiftKeyMap = creation.invert(localContainer.defaultShiftKeyMap);

	localContainer.getKey = function(keyNumber, shift) {
		var isString = creation.isType(keyName, "");
		keyName = isString ? keyName.toLowerCase() : keyName;

		if (isString) {
			if (shift) return keyName in this.reverseShiftKeyMap ? parseInt(this.reverseShiftKeyMap[keyName]) : -1;
			else return keyName in this.reverseKeyMap ? parseInt(this.reverseKeyMap[keyName]) : -1;
		} else {
			if (shift) return keyName in this.defaultShiftKeyMap ? this.defaultShiftKeyMap[keyName] : "";
			else return keyName in this.defaultKeyMap ? this.defaultKeyMap[keyName] : "";
		}
	}

	localContainer.getInputManager = function(config) {
		return creation.compose(
			{
				inputList: [], // ["w", "s", "d"]
				mouseData: {}, // mouseMove:[], wheel:[]
				addInput: function(input, value) {
					if (!this.inputList.includes(input)) this.inputList.push(input);
				},
				removeInput: function(input) {
					var index = this.inputList.indexOf(input);
					if (index != -1) this.inputList.splice(index, 1);
				},
				getInput: function() {
					var data = creation.clone(this.inputList).concat(creation.clone(this.mouseData));
					this.mouseData.wheel = "";
					return data;
				},
				getMouse: function() {
					var data = creation.clone(this.mouseData.mouse);
					return data;
				}
			},
			config
		);
	};

	// Doesn't auth element.. :/ Needs reworking.
	localContainer.getListenerManager = function(config) {
		return creation.compose(
			{
				listeners: [],
				addListenerTo: function(element, listenerName, callback) {
					$(element).on(listenerName, callback);
					this.listeners.push(listenerName);
				},
				removeListenerFrom: function(element, listenerName) {
					var index = this.listeners.indexOf(listenerName);
					if (index != -1) {
						$(element).off(listenerName);
						this.listeners.splice(index, 1);
						return true;
					}
				},
				// May explode. :o
				removeListenersFrom: function(element) {
					for (var index=0; index > this.listeners; index++) {
						this.removeListener(element, this.listeners[index]);
					}
				}
			},
			config
		);
	}

	localContainer.getInput = function(config) {
		return creation.compose(
			localContainer.getInputManager(),
			localContainer.getListenerManager(),
			{
				keyElement: "body",
				mouseElement: "canvas",
				getScrollData: true,
				// Only used for keys
				blacklist: [[17, 82], [17, 16, 67], [16, 17, 65]], //Ctrl-R, Ctrl-Shift-C
				blackListed: function(blacklist, data) {
					return blacklist.map(function(combo) {
						return !combo.map(function(key) { return data.includes(key); }).includes(false);
					}).includes(true);
				},
				addListeners: function() {
					var self = this;
					this.addListenerTo(this.keyElement, "keydown", function(jqueryKeyEvent) {
						self.addInput(jqueryKeyEvent.which, true);
						if (self.blackListed(self.blacklist, self.inputList)) return false;
					});

					this.addListenerTo(this.keyElement, "keyup", function(jqueryKeyEvent) {
						self.removeInput(jqueryKeyEvent.which);
						return false;
					});

					this.addListenerTo(this.mouseElement, "mousemove", function(jqueryMouseEvent) {
						self.removeInput("mouseMove");
						self.mouseData.mouse = [
							jqueryMouseEvent.pageX - $(self.mouseElement).offset().left,
							jqueryMouseEvent.pageY - $(self.mouseElement).offset().top
						];
					});

					// TODO: Is the for-loop too slow?
					if (this.getScrollData) {
						this.addListenerTo(this.mouseElement, "mousewheel", function(jqueryMouseEvent) {
							var delta = [jqueryMouseEvent.deltaX, jqueryMouseEvent.deltaY];
							//console.log("MouseWheel Delta: ", delta);
							// normalize the scroll delta
							for (var index=0, len=delta.length; index < len; index++) {
								if (delta[index] > 1) delta[index] = 1;
								else if (delta[index] < -1) delta[index] = -1;
							}
							// Lets be real, most games don't allow scrolling sideways.
							// Hacks but it works :/
							self.mouseData.wheel = delta[1] > 0 ? "scrollup" : "scrolldown";
							return false; // returning false prevents the default action (page scroll)
						});
					}

					// Note for mousedown/up, event.which ~ 1 for left, 2 for middle, 3 for right
					this.addListenerTo(this.mouseElement, "mousedown", function(jqueryKeyEvent) {
						self.addInput(jqueryKeyEvent.which, true);
						jqueryKeyEvent.stopPropagation();
						jqueryKeyEvent.preventDefault();
					});

					this.addListenerTo(this.mouseElement, "mouseup", function(jqueryKeyEvent) {
						self.removeInput(jqueryKeyEvent.which);
						jqueryKeyEvent.stopPropagation();
						jqueryKeyEvent.preventDefault();
					});
				}
			},
			config
		);
	};

	return localContainer;
};
