
function Creation() {
	var localContainer = {};

	localContainer.getType = function(one) {
		return Object.prototype.toString.call(one);
	};

	localContainer.ARRAYTYPE = localContainer.getType([]);
	localContainer.OBJECTTYPE = localContainer.getType({});

	localContainer.isType = function(one, two) {
		return localContainer.getType(one) === localContainer.getType(two);
	};

	localContainer.invert = function(object) {
		var newObject = {};
		for (var key in object) { newObject[object[key]] = key; }
		return newObject;
	}

	localContainer.clone = function(target) {
		var getItem = function(child) { return _clone(child); },
			array = this.getType([]),
			object = this.getType({});
		function _clone(item) {
			var proto = localContainer.getType(item),
				newItem = proto === object ? {} : proto === array ? [] : item;
			if (proto === array) for (var idx=0, len=item.length; idx<len; idx++) newItem.push(getItem(item[idx]));
			else if (proto === object) for (var idx in item) newItem[idx] = getItem(item[idx]);
			return newItem;
		}
		return _clone(target);
	}

	localContainer.extend = function(to, from) {
		if (to && from) for (var key in from) {
			var prev = to[key];
			if (prev && this.getType(prev) == this.OBJECTTYPE) this.extend(from[key], prev[key]);
			else to[key] = from[key];
		}
		return to;
	}

	localContainer.compose = function() {
		var args = Array.prototype.slice.call(arguments);
		if (args.length < 2) throw TypeError("two or more arguments are required when calling function ", arguments.callee.name);

		var base = args.shift();
		args.map(function(item) {
			localContainer.extend(base, item);
		});
		return base;
	}

	localContainer.orderedDictionary = function(config) {
		return this.extend({
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
			},
			config
		);
	};

	return localContainer;
}
