function Events(creation) {
	var localContainer = {
		version: "1"
	};

	// localContainer.actionEvent_old = function(config) {
	// 	return creation.compose(
	// 		creation.orderedDictionary(),
	// 		{
	// 			triggers: [], // Key codes or mouse codes
	// 			removeOnSuccess: [], // remove instead of delete? Which word is better?
	// 			includeIfTriggered: [], // Any other triggers and their data that you may want.
	// 			triggered: false, // State of the trigger at start.
	// 			triggerOn: true, // Trigger if the data is there, otherwise trigger when the data is wrong/missing/false.
	// 			removeFromInput: function(input) {
	// 				for (var index=0; index < this.removeOnSuccess.length; index++) {
	// 					delete input[this.removeOnSuccess[index]];
	// 				}
	// 			},
	// 			updateEventCheck: function (input) { return true; },
	// 			updateEvent: function(input) {
	// 				if (this.updateEventCheck(input)) return input; // Bail if we don't pass the check.
	//
	// 				if (!this.triggered) var passToCallback = {};
	// 				for (var index=0; index < this.triggers.length; index++) {
	// 					var trigger = this.triggers[index];
	// 					if (this.triggerOn == !input[trigger]) {
	// 						this.triggered = false;
	// 						return input;
	// 					} else if (!this.triggered) {
	// 						passToCallback[trigger] = input[trigger];
	// 					}
	// 				}
	//
	// 				if (!this.triggered) {
	// 					this.triggered = true;
	//
	// 					// Gather any other data from input
	// 					for (var index=0; index < this.includeIfTriggered.length; index++) {
	// 						var include = this.includeIfTriggered[index];
	// 						passToCallback[include] = input[include];
	// 					}
	//
	// 					// Call callbacks.
	// 					this.iterateOverObjects(function(callback) {
	// 						callback(passToCallback);
	// 					});
	//
	// 					this.removeFromInput(input);
	// 				}
	//
	// 				return input;
	// 			}
	// 		},
	// 		config
	// 	);
	// };
	//
	// localContainer.stateEvent_old = function(config) {
	// 	return creation.compose(creation.orderedDictionary(), {
	// 		triggers: [], // ["shift", "control", "w"] // should be turned into keycodes - not human readable.
	// 		removeOnSuccess: [], // ["w"] // Could be used for evil.. (╯°□°）╯︵ ┻━┻ Much power, great responsibility.
	// 		// triggerOn?
	// 		updateEventCheck: function (input) { return true; },
	// 		updateEvent: function(input) {
	// 			if (this.updateEventCheck(input)) return input; // Bail if we don't pass the check.
	//
	// 			var passToCallback = {};
	// 			// Check if all the required keys are active, bail out otherwise
	// 			for (var index=0; index < this.triggers.length; index++) {
	// 				var trigger = this.triggers[index];
	// 				if (!input[trigger]) return input;
	// 				else passToCallback[trigger] = input[trigger];
	// 			}
	//
	// 			// Call callbacks.
	// 			this.iterateOverObjects(function(callback) {
	// 				callback(passToCallback);
	// 			});
	//
	// 			// Delete keys
	// 			for (var index=0; index < this.removeOnSuccess.length; index++) {
	// 				delete input[this.removeOnSuccess[index]];
	// 			}
	//
	// 			return input;
	// 		}
	// 	}, config);
	// };
	//
	// localContainer.getEventContext_old = function(config) {
	// 	return creation.compose(
	// 		creation.orderedDictionary(),
	// 		{
	// 			onHold: false,
	// 			validate: function(object) {
	// 				if (object.updateEvent) return true;
	// 			},
	// 			suspend: function() {
	// 				this.onHold = true;
	// 			},
	// 			resume: function(name) {
	// 				this.onHold = false;
	// 			},
	// 			getState: function() {
	// 				return this.onHold;
	// 			},
	// 			updateEvent: function(input) {
	// 				if (!this.onHold && this.updateEventCheck(input)) {
	// 					var remaining = input;
	// 					this.iterateOverObjects(function(object, name) {
	// 						if (remaining) remaining = object.updateEvent(input);
	// 						else return true;
	// 					});
	// 					return remaining;
	// 				}
	// 				return input;
	// 			}
	// 		},
	// 		config
	// 	);
	// };

	localContainer.singleEvent = function(config) {
		return creation.compose(
			{
				eatOnSuccess: false,
				triggerAfter: false, // Trigger once the trigger appears, reset after its gone.
				tripped: false,
				trigger: null, // The triggering data
				notifyList: [],
				add: function(item) {
					var isFunc = typeof item == "function";
					if (isFunc) this.notifyList.push(item);
					return isFunc;
				},
				remove: function(item) {
					var found = this.notifyList.indexOf(item);
					if (found != -1) return this.notifyList.splice(found, 1);
				},
				clean: function() {
					this.notifyList = this.notifyList.filter(function(item) {
						return typeof item == "function";
					});
				},
				updateList: function() {
					this.notifyList.forEach(function(item) { item(); });
				},
				eatData: function(data) { // If called then the index can't be -1
					data.splice(data.indexOf(this.trigger), 1);
				},
				findMatch: function(data) {
					for (var i=0, len=data.length; i<len; i++) {
						if (this.trigger === data[i]) {
							return true;
						}
					}
				},
				update: function(data) { // -> Expects a list of data
					var found = this.findMatch(data);
					if (!this.triggerAfter) {
						if (found && !this.tripped) {
							this.updateList();
							if (this.eatOnSuccess) this.eatData(data);
							this.tripped = !this.triggerAfter;
						} else if (!found){
							this.tripped = this.triggerAfter;
						}
					} else {
						if (!found && this.tripped) {
							this.updateList();
							if (this.eatOnSuccess) this.eatData(data);
							this.tripped = !this.triggerAfter;
						} else if (found) {
							this.tripped = this.triggerAfter;
						}
					}
					return data;
				}

			},
			config
		);
	}

	localContainer.complexEvent = function(config) {
		return creation.compose(
			this.singleEvent(),
			{
				// Not sure how fast this trickery is; may need to move back to something simple.
				// trigger: ["data1", 32, "data3", "four"]
				// Will only trigger if everything in 'trigger' is in data somewhere.
				findMatch: function(data) {
					return !(this.trigger.length - this.trigger.filter(function(trigger) {
						return data.indexOf(trigger) != -1;
					}).length);
				},
				eatData: function(data) {
					
				}
			},
			config
		);
	}

	return localContainer;
};
