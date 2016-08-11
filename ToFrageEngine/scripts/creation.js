
function Creation() {
	var localContainer = {
	};

	//ldp.r boolean
	//ldp Takes two items and compares their type.
	localContainer.isType = function(one, two) {
		return Object.prototype.toString.call(one) === Object.prototype.toString.call(two);
	};

	localContainer.getType = function(one) {
		return Object.prototype.toString.call(one);
	};

	localContainer.invert = function(object) {
		var newObject = {};
		for (var key in object) { newObject[object[key]] = key; }
		return newObject;
	};

	//ldp.p list?object
	//ldp.r list?object
	//ldp Deep copies a object or a list.
	localContainer.deepCopy = function(item) {
		var itemProto = localContainer.getType(item);
		var newItem = item;
		var getItem = function(child) { return localContainer.deepCopy(child); };
		if (localContainer.isType(itemProto, [])) {
			newItem = [];
			for (var itemIndex=0, len=item.length; itemIndex < len; itemIndex++) newItem.push(getItem(item[itemIndex]));
		}
		if (localContainer.isType(itemProto, {})) {
			newItem = {};
			for (var itemIndex in item) newItem[itemIndex] = getItem(item[itemIndex])
		}
		return newItem;
	};

	// Reserved keywords are objectName and function.super
	localContainer.extend = function(from, to) {
		if (from && to) for (var key in from) {
			var previousItem = to[key];
			if (previousItem && this.isType(previousItem, {})) this.extend(from[key], previousItem);
			else if (key != "superName") to[key] = from[key];

			// Keep track of older functions nameIndex bind them from 'from' to 'to'
			if (previousItem && this.isType(previousItem, Function) && this.isType(from[key], Function)) {
				if (!to[key].super) to[key].super = {};
				to[key].super[to.superName] = previousItem.bind(to);
			}
		}
		return to;
	};

	localContainer.compose = function() {
		var args = Array.prototype.slice.call(arguments);
		// Exit if we don't have enough arguments
		if (args.length < 2) {
			console.error("Two or more arguments are required. Arguments:", arguments);
			return false;
		}

		var base = args.splice(0, 1)[0];
		args.map(function(item) {
			localContainer.extend(item ? item : {}, base);
		});
		return base;
	}

	localContainer.orderedDictionary = function(config) {
		return this.compose({
			superName: "orderedDictionary",
			objects: {},
			objectNames: [],
			validate: function(object) {
				return true;
			},
			add: function(objectName, object) {
				if (this.validate && this.validate(object)) {
					this.objects[objectName] = object;
					this.objectNames.push(objectName);
					return true;
				}
			},
			get: function(objectName) {
				if (objectName in this.objects) {
					return this.objects[objectName];
				}
			},
			remove: function(objectName) {
				if (objectName in this.objects) {
					var object = this.objects[objectName];
					delete this.objects[objectName];
					this.objectNames.splice(this.objectNames.indexOf(objectName), 1);
					return object;
				}
			},
			changePosition: function(objectName, newIndex) {
				if (objectName in this.objects) {
					this.objectNames.splice(this.objectNames.indexOf(objectName), 1);
					if (newIndex >= 0 && newIndex < this.objectNames.length) this.objectNames.splice(newIndex, 0, objectName);
					else this.objectNames.push(objectName);
					return true;
				}
			},
			iterateOverObjects: function(func) {
				for (var nameIndex=0, len=this.objectNames.length; nameIndex < len; nameIndex++) {
					var name = this.objectNames[nameIndex];
					if (func(this.objects[name], name)) break;
				}
			}
		}, config);
	};

	return localContainer;
}
