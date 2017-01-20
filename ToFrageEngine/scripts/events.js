function Events(engine) {
	var localContainer = {
		version: "1"
	};

	localContainer.actionEvent = function(config) {
		return engine.Creation.compose(engine.Creation.orderedDictionary(), {
			superName: "actionEvent",
			triggers: [], // Key codes or mouse codes
			removeOnSuccess: [], // remove instead of delete? Which word is better?
			includeIfTriggered: [], // Any other triggers and their data that you may want.
			triggered: false, // State of the trigger at start.
			triggerOn: true, // Trigger if the data is there, otherwise trigger when the data is wrong/missing/false.
			removeFromInput: function(input) {
				for (var index=0; index < this.removeOnSuccess.length; index++) {
					delete input[this.removeOnSuccess[index]];
				}
			},
			updateEventCheck: function (input) { return true; },
			updateEvent: function(input) {
				if (this.updateEventCheck(input)) return input; // Bail if we don't pass the check.

				if (!this.triggered) var passToCallback = {};
				for (var index=0; index < this.triggers.length; index++) {
					var trigger = this.triggers[index];
					if (this.triggerOn == !input[trigger]) {
						this.triggered = false;
						return input;
					} else if (!this.triggered) {
						passToCallback[trigger] = input[trigger];
					}
				}

				if (!this.triggered) {
					this.triggered = true;

					// Gather any other data from input
					for (var index=0; index < this.includeIfTriggered.length; index++) {
						var include = this.includeIfTriggered[index];
						passToCallback[include] = input[include];
					}

					// Call callbacks.
					this.iterateOverObjects(function(callback) {
						callback(passToCallback);
					});

					this.removeFromInput(input);
				}

				return input;
			}
		}, config);
	};

	localContainer.stateEvent = function(config) {
		return engine.Creation.compose(engine.Creation.orderedDictionary(), {
			triggers: [], // ["shift", "control", "w"] // should be turned into keycodes - not human readable.
			removeOnSuccess: [], // ["w"] // Could be used for evil.. (╯°□°）╯︵ ┻━┻ Much power, great responsibility.
			// triggerOn?
			updateEventCheck: function (input) { return true; },
			updateEvent: function(input) {
				if (this.updateEventCheck(input)) return input; // Bail if we don't pass the check.

				var passToCallback = {};
				// Check if all the required keys are active, bail out otherwise
				for (var index=0; index < this.triggers.length; index++) {
					var trigger = this.triggers[index];
					if (!input[trigger]) return input;
					else passToCallback[trigger] = input[trigger];
				}

				// Call callbacks.
				this.iterateOverObjects(function(callback) {
					callback(passToCallback);
				});

				// Delete keys
				for (var index=0; index < this.removeOnSuccess.length; index++) {
					delete input[this.removeOnSuccess[index]];
				}

				return input;
			}
		}, config);
	};

	localContainer.getEventContext = function(config) {
		return engine.Creation.compose(engine.Creation.orderedDictionary(), {
			onHold: false,
			validate: function(object) {
				if (object.updateEvent) return true;
			},
			suspend: function() {
				this.onHold = true;
			},
			resume: function(name) {
				this.onHold = false;
			},
			getState: function() {
				return this.onHold;
			},
			updateEventCheck: function (input) { return true; },
			updateEvent: function(input) {
				if (!this.onHold && this.updateEventCheck(input)) {
					var remaining = input;
					this.iterateOverObjects(function(object, name) {
						if (remaining) remaining = object.updateEvent(input);
						else return true;
					});
					return remaining;
				}
				return input;
			}
		}, config);
	};

	return localContainer;
};
