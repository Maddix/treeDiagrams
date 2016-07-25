
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

	// This will set a function of funcName on a object (or function >:D) and bind said function to a
	// context of bindingThis and then return the newly bound function.
	localContainer.storeFunc = function(childFuncArguments, funcName, func, bindingThis) {
		var bound = func.bind(bindingThis);
		childFuncArguments.callee[funcName] = bound;
		return bound;
	};


	localContainer.extend_old = function(from, to) {
		if (from) for (var key in from) {
			if (to[key] && localContainer.isType(to[key], {})) {
				localContainer.extend(from[key], to[key])
			} else {
				to[key] = from[key]
			}
		}
		return to;
	};

	localContainer.extend = function(from, to) {
		if (from) for (var key in from) {
			var item = to[key];
			if (item && localContainer.isType(item, {})) {
				localContainer.extend(from[key], item)
			} else if (item && localContainer.isType(item, Function) && localContainer.isType(from[key], Function)) {
				if (!item.parentFunctions) item.parentFunctions = [];
				item.parentFunctions.push(from[key].bind(to));
			} else {
				to[key] = from[key];
			}
		}
		return to;
	};

	// from, to are objects with functions. I need to figure out a way to copy the functions so I'm not modifying the originals.
	localContainer.extendFunctions = function(from, to, bindingContext) {
		if (from) for (var key in from) {
			if (to[key]) {
				if (!to[key].parentFunctions) to[key].parentFunctions = [];
				to[key].parentFunctions.push(from[key].bind(bindingContext));
			} else to[key] = from[key]
		}
		return to;
	};

	// Note: This code doesn't copy functions when it adds other functions as properties thus odd effects
	// are bound to happen if you compose the same objects more then once. The most noticable being duplicated parent functions.
	localContainer.compose = function() {
		var args = Array.prototype.slice.call(arguments);
		// Exit if we don't have enough arguments
		if (args.length < 2) {
			console.error("Two or more arguments are required. Arguments:", arguments);
			return false;
		}

		var base = args.splice(0, 1)[0];
		console.log(args);
		args.map(function(item) {
			console.log("Item before:", item);
			var item = item ? item : {};
			console.log("Item after:", item);

			localContainer.extend(item, base);

			//if (item.buildData && base.buildData) localContainer.extend(item.buildData, base.buildData);
			//else if (item.buildData) base.buildData = localContainer.extend(item.buildData, {});
			//if (item.buildFunctions && base.buildFunctions) localContainer.extendFunctions(item.buildFunctions, base.buildFunctions, base);
			//else if (item.buildFunctions) base.buildFunctions = localContainer.extend(item.buildFunctions, {});
		});
		this.expose(base);
		return base;
	}

	localContainer.expose = function(object) {
		this.extend(object.__buildData__, object);
		this.extend(object.__buildFunctions__, object);
	};

	//ldp.p !object !boolean
	//ldp.r object
	/*ldp
		Should I add a hasObject function?
		Should I rename the object theme to be more general?
	*/
	localContainer.orderedDictionary = function(config) {
		//ldp.p string item
		//ldp.r true if item was added, undefined otherwise.
		//ldp Takes a name and item and stores it if the item has pass validation and then returns true.
 		//function add;

		//ldp.p string
		//ldp.r item if found, false otherwise.
		//ldp Returns the object connected with given key.
		//function get;

		//ldp.p string
		//ldp.r item if found, undefined otherwise.
		//ldp Removes a item matching the given name and returns it.
		//function remove;

		//ldp.p string !number
		//ldp.r true if items position was changed, undefined otherwise.
		/*ldp Changes the position of a item with the given name. Leave newIndex blank if you
			want to move the object to the end.
		*/
		//function changePosition;

		//ldp.p function
		/*ldp Iterates over this.objects and repeatedly calls func with each item and
			name. If the function returns true then break, if it returns false then
			continue (skip to the next object). If you pass a list of keys and a object
			it will iterate other that instead.
		*/
		//function iterateOverObjects;

		return this.compose({
			__buildData__:{
				objects: {},
				objectNames: [],
				//ldp validate is a function that takes a object and returns a bool depending if the object has what you want.
				validate: function(object) {
					console.log(arguments.callee.parentFunctions);
					return true;
				}
			},
			__buildFunctions__: {
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
			}
		}, config);
	};

	return localContainer;
}

/*
one = {
	buildData: {
		thrust: 3
	},
	buildFunctions: {
		getThrust: function() {
			return this.thrust * 5;
		}
	}
}

two = {
	buildFunctions: {
		getThrust: function() {
			var funcs = arguments.callee.parentFunctions
			for (var i=0; i<funcs.length; i++) console.log(">>", funcs[i]());
		}
	}
}

three = {
	buildData: {
		power: 10
	},
	buildFunctions: {
		getThrust: function() {
			return this.thrust * this.power;
		}
	}
}

creation = Creation();
*/
