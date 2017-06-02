function Event(creation) {
	var localContainer = {};

	localContainer.lateEvent = function(config) {
		return creation.compose(
			{
				tripped: false,
				trigger: null, // The triggering data
				notifyList: [],
				add: function(item) {
					var isFunc = typeof item == "function";
					if (isFunc) this.notifyList.push(item);
					return this; // Should I return true/false?
				},
				remove: function(item) {
					if (this.notifyList.includes(item))
						return this.notifyList.splice(this.notifyList.indexOf(item), 1);
				},
				clean: function() { // Not needed?
					this.notifyList = this.notifyList.filter(function(item) {
						return typeof item == "function";
					});
				},
				updateList: function(data) {
					this.notifyList.forEach(function(item) { item(data); });
				},
				findMatch: function(data) {
					return data.includes(this.trigger);
				},
				// Calls updateList after the triggering data is exempt
				update: function(data) { // Expects a list of data
					var found = this.findMatch(data);
					if (!found && this.tripped) {
						this.updateList();
						this.tripped = false;
					} else if (found) {
						this.tripped = true;
					}
					return data;
				}
			},
			config
		);
	}

	localContainer.event = function(config) {
		return creation.compose(
			this.lateEvent(),
			{
				eatOnSuccess: false,
				eatData: function(data) { // If called then the index can't be -1
					data.splice(data.indexOf(this.trigger), 1);
				},
				// Calls updateList as soon as the trigger is tripped
				update: function(data) { // Expects a list of data
					var found = this.findMatch(data);
					if (found && !this.tripped) {
						this.updateList(data);
						if (this.eatOnSuccess) this.eatData(data);
						this.tripped = true;
					} else if (!found){
						this.tripped = false;
					}
					return data;
				}
			},
			config
		);
	}

	localContainer.continuousEvent = function(config) {
		return creation.compose(
			this.event(),
			{
				update: function(data) {
					if (this.findMatch(data)) {
						this.updateList(data);
						if (this.eatOnSuccess) this.eatData(data);
					}
					return data;
				}
			},
			config
		);
	}

	localContainer.complexEvent = function(config) {
		return creation.compose(
			this.event(),
			{
				// Not sure how fast this trickery is; may need to move back to something simple.
				// trigger: ["data1", 32, "data3", "four"]
				// Will only trigger if everything in 'trigger' is in data somewhere.
				findMatch: function(data) {
					return !(this.trigger.length - this.trigger.filter(function(trigger) { return data.includes(trigger); }).length);
				},
				eatData: function(data) {
					this.trigger.forEach(function(item) {
						data.splice(data.indexOf(item), 1);
					});
				}
			},
			config
		);
	}

	localContainer.button = function(config) {
		return creation.compose(
			{
				tripped: false,
				trigger: null, // The triggering data
				pressed: null,
				released: null,
				findMatch: function(data) {
					return data.includes(this.trigger);
				},
				update: function(data) {
					var found = this.findMatch(data);
					if (found && !this.tripped) {
						if (this.pressed) this.pressed();
						if (this.eatOnSuccess) this.eatData(data);
						this.tripped = true;
					} else if (!found){
						this.tripped = false;
						if (this.released) this.released();
					}
					return data;
				}
			},
			config
		);
	}

	localContainer.eventGroup = function(config) {
		return creation.compose(
			{
				events: [],
				active: true,
				add: function(item) {
					if (item) this.events.push(item);
					return this;
				},
				remove: function(item) {
					if (this.events.includes(item))
						return this.events.splice(this.events.indexOf(item), 1);
				},
				update: function(data) {
					if (this.active) {
						var remaining = data;
						var processedEvents = this.events.filter(function(event) {
							if (event.active === undefined) return true;
							else return event.active;
						});
						for (var idx=0, len=processedEvents.length; idx<len; idx++) {
							if (remaining) remaining = processedEvents[idx].update(remaining);
						}
						return remaining;
					}
					return data;
				}
			},
			config
		);
	}

	return localContainer;
};
