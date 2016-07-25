// Lisp Document Parser

//ldp Acts like a namespace.
function Util() {
	//ldp.main
	var localContainer = {
		version: "1"
	};

	//ldp.p object function !string
	//ldp Loads images from 'loadObject' and calls 'callWhenComplete' with the loaded images. 'folder' is prepended to each image path.
	localContainer.loadImages = function(loadObject, callWhenComplete, folder) {
		folder = folder || "";
		var imageObjects = {},
			loadCount = 0,
			loaded = 0;

		function loadedCallback() {
			if (++loaded == loadCount) callWhenComplete(imageObjects);
		};

		for (var imageName in loadObject) {
			loadCount++;
			var image = new Image();
			image.src = folder + loadObject[imageName];
			image.onload = function() { loadedCallback(); }
			imageObjects[imageName] = image;
		}
	};

	//ldp.p !object
	//ldp.r object
	//ldp Manages objects and calls updateLogic on added objects when 'update()' is called.
	localContainer.getLogicController = function(config) {
		//ldp.main
		var local = {
			validate: function(object) {
				if (object.updateLogic) return true;
			}
		};
		//ldp.e
		local = this.extend(this.orderedObject(config), local, true);

		//ldp.p !object
		//ldp.r undefined
		//ldp Calls updateLogic() on each object and passes a frame object.
		local.update = function(frame) {
			this.iterateOverObjects(function(object) {
				object.updateLogic(frame);
			});
		};

		return local;
	}

	// TODO: Start here
	//ldp Really old, was used with the ship physics stuff. Ignore for now.
	localContainer.atomPhysics = {
		shape: 2,
		size: 10,
		density: 2,
		mass: 0, // size*density, How this differs from inertia, I'm not sure
		inertia: 20, // Shape*density ? (*shape?)
		velocity: [0, 0],
		angularVelocity: 0,
		calcMass: function(scale) {
			this.mass = this.size*this.density;
			if (scale) this.mass = this.mass*scale;
		},
		calcInertia: function(scale) {
			if (!this.mass) {this.calcMass(scale);}
			this.inertia = this.mass*this.shape
			if (scale) this.inertia = this.inertia*scale;
		}
	};

	//ldp.p !object
	//ldp.r object
	//ldp This is a loop that will call 'func' passing a new 'frame object' each x amount of ms.
	localContainer.loop = function(config) {
		//ldp.main
		var local = {
			fps: 60,
			func: undefined,
			elapsedTime: 0,
			lastTime: Date.now(), // used to be 'new Date().getTime();'
			running: false,
			tick: 0, // keeps track of the time since the loop was started in milliseconds (Note, modifier modifies this >:D)
			lastTickTime: Date.now(),
			modifier: 1, // simulation speed, 1 is normal, 0 is paused, 2 is 2x time normal speed.
			pausedModifier: 0, // for keeping track of what the modifier was before pausing
			useRAF:true, // Normally slower than setTimeout, though smoother
			rAF: (function(){ // requestAnimationFrame
				return window.requestAnimationFrame
				|| window.webkitRequestAnimationFrame
				|| window.mozRequestAnimationFrame
				|| window.oRequestAnimationFrame
				|| window.msRequestAnimationFrame;}()),
			requestFunction: undefined
		};
		//ldp.e
		this.extend(config, local);

		//ldp Checks that the browser can use requestAnimationFrame. Defaults to setTimeout otherwise.
		local.getCallbackFunction = function() {
			this.requestFunction = function(callback) {
				setTimeout(callback, this.fps);
			};
			if (this.useRAF && this.rAF) this.requestFunction = this.rAF;

		}; // Calling the function right after creating it (func{}();) will set the 'this' to the window
		local.getCallbackFunction(); // Calling the function from 'local' insures that 'this' will be the window // what? don't I mean will be the 'local' object?

		//ldp Toggles 'this.modifier' from its current value to 0.
		local.togglePause = function() {
			this.pausedModifier = this.modifier;
			if (this.modifier > 0) this.modifier = 0;
			else this.modifier = this.pausedModifier;
		};

		//ldp.p number
		//ldp.r undefined
		//ldp Set the FPS
		local.setFPS = function(newFps) {
			this.fps = 1000/newFps;
		};

		// Called for free on creation.
		local.setFPS(local.fps);

		//ldp Starts the loop
		local.start = function() {
			this.running = true;
			this.update();
		};

		//ldp Stops the loop
		local.stop = function() {
			this.running = false;
		};

		//ldp Handles keeping track of time and creating the 'frame object'. Don't manually call this.
		local.update = function() {
			if (this.running) {

				var currentTime = Date.now(),
					timeDifference = currentTime - this.lastTime;
				this.lastTime = currentTime;
				this.elapsedTime += timeDifference;
				this.tick += timeDifference;

				if (currentTime - this.lastTickTime >= 1000) { // Once per second
					this.lastTickTime = currentTime;
				}

				if (this.elapsedTime >= this.fps) {
					//ldp This object is created each frame and passed to 'this.func'.
					var frame = {
						rate: parseFloat((1000/this.elapsedTime).toFixed(1)),
						// Remove this?
						updateTime: this.elapsedTime*this.modifier, // Should I tie this in with this.modifier?
						delta: (this.elapsedTime/1000)*this.modifier,
						time: this.tick*this.modifier
					};

					this.elapsedTime = 0;
					this.func(frame);
				}

				var that = this,
					requestFunction = this.requestFunction;
				requestFunction(function(){
					that.update();
				});
			}
		};

		// Don't call this. Can't remember what this does unfortunately. It's important though.
		local.runRequestFunction = function(callback) {
			var temp = this.requestFunction;
			temp(callback);
		};

		return local;
	};

	return localContainer;
};
