// This uses Jquery 2.0.3 and Jquary-mousewheel(https://github.com/brandonaaron/jquery-mousewheel)
// Note for mousedown/up, event.which ~ 1 for left, 2 for middle, 3 for right

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

	localContainer.getKey = function(keyName, shift) {
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
		return creation.compose({
			superName: "inputManager",
			rawInput: {},
			rawInputOrder: [],
			addInput: function(input, value) {
				this.rawInput[input] = value;
				if (this.rawInputOrder.indexOf(input) == -1) this.rawInputOrder.push(input);
			},
			removeInput: function(input) {
				delete this.rawInput[input];
				var index = this.rawInputOrder.indexOf(input);
				if (index != -1) this.rawInputOrder.splice(index, 1);
			},
			getInput: function() {
				return {
					input: creation.deepCopy(this.rawInput),
					inputOrder: creation.deepCopy(this.rawInputOrder)
				};
			}
		}, config);
	};

	// Doesn't auth element.. :/ Needs reworking.
	localContainer.getListenerManager = function(config) {
		return creation.compose({
			superName: "listenerManager",
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
			removeListenersFrom: function(element) {
				for (var index=0; index > this.listeners; index++) {
					this.removeListener(element, this.listeners[index]);
				}
			}
		}, config);
	}

	localContainer.getInput = function(config) {
		var local = creation.compose({
			superName: "input",
			keyElement: "body",
			mouseElement: "canvas",
			// Only used for keys
			blacklist: {"Ctrl-R":[17, 82], "F5":[116], "Ctrl-Shift-C":[17, 16, 67]}, // {"description":[key, ..], ..}
			notMatchingBlacklist: function() {
				for (var keyComboName in this.blacklist) {
					var keyCombo = this.blacklist[keyComboName];
					var matchingCombo = true;
					for (var index=0; index < keyCombo.length; index++) {
						if (this.rawInput[keyCombo[index]] == undefined) matchingCombo = false;
					}
					if (matchingCombo) return false;
				}
				return true;
			},
			addListeners: function() {
				this.addListenerTo(this.keyElement, "keydown", function(jqueryKeyEvent) {
					local.addInput(jqueryKeyEvent.which, true);
					if (local.notMatchingBlacklist()) return false;
				});

				this.addListenerTo(this.keyElement, "keyup", function(jqueryKeyEvent) {
					local.removeInput(jqueryKeyEvent.which);
					return false;
				});

				this.addListenerTo(this.mouseElement, "mousemove", function(jqueryMouseEvent) {
					local.removeInput("mousePos");
					local.addInput("mousePos", [
						jqueryMouseEvent.pageX - $(local.mouseElement).offset().left,
						jqueryMouseEvent.pageY - $(local.mouseElement).offset().top
					]);
				});

				// TODO: Is the for-loop too slow?
				if (this.getScrollData) {
					this.addListenerTo(this.mouseElement, "mousewheel", function(jqueryMouseEvent) {
						var delta = [jqueryMouseEvent.deltaX, jqueryMouseEvent.deltaY];
						// normalize the scroll delta
						for (var index=0; index < delta.length; delta++){
							if (delta[index] > 1) delta[index] = 1;
							if (delta[index] < -1) delta[index] = -1;
						}
						local.removeInput("mouseWheel");
						local.addInput("mouseWheel", delta);
						return false; // returning false prevents the default action (page scroll)
					});
				}

				// Note for mousedown/up, event.which ~ 1 for left, 2 for middle, 3 for right
				this.addListenerTo(this.mouseElement, "mousedown", function(jqueryKeyEvent) {
					local.addInput(jqueryKeyEvent.which, true);
					jqueryKeyEvent.stopPropagation();
					jqueryKeyEvent.preventDefault();
				});

				this.addListenerTo(this.mouseElement, "mouseup", function(jqueryKeyEvent) {
					local.removeInput(jqueryKeyEvent.which);
					jqueryKeyEvent.stopPropagation();
					jqueryKeyEvent.preventDefault();
				});
			}
		}, localContainer.getListenerManager(), localContainer.getInputManager(), config);

		return local;
	};

	return localContainer;
};
