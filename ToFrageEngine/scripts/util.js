function Util(creation) {
	return {
		//ldp.p object function !string
		//ldp Loads images from 'loadObject' and calls 'callWhenComplete' with the loaded images. 'folder' is prepended to each image path.
		loadImages: function(loadObject, callWhenComplete, folder) {
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
		},
		loop: function(config) {
			var object = creation.compose(
				{
					superName: "loop",
					fps: 60,
					timePerFrame: 1000/60,
					func: null, // default of null as a function should be provided normally
					elapsedTime: 0,
					lastTime: Date.now(), 		// used to be 'new Date().getTime();'
					running: false,
					tick: 0, 					// keeps track of the time since the loop was started in milliseconds (Note, modifier modifies this >:D)
					lastTickTime: Date.now(),
					modifier: 1, 				// simulation speed, 1 is normal, 0 is paused, 2 is 2x time normal speed.
					pausedModifier: 0, 			// for keeping track of what the modifier was before pausing
					useRAF:true, 				// Normally slower than setTimeout, though smoother
					rAF: (function(){ 			// requestAnimationFrame
						return window.requestAnimationFrame
						|| window.webkitRequestAnimationFrame
						|| window.mozRequestAnimationFrame
						|| window.oRequestAnimationFrame
						|| window.msRequestAnimationFrame;}()),
					requestFunction: undefined,
					getCallbackFunction: function() {
						this.requestFunction = function(callback) {
							setTimeout(callback, this.timePerFrame);
						};
						if (this.useRAF && this.rAF) this.requestFunction = this.rAF;
					},
					togglePause: function() {
						this.pausedModifier = this.modifier;
						if (this.modifier > 0) this.modifier = 0;
						else this.modifier = this.pausedModifier;
					},
					setFPS: function(newFps) {
						if (creation.isType(newFps, 0)) {
							this.fps = newFps;
							this.timePerFrame = 1000/newFps;
							return true;
						}
					},
					start: function() {
						this.running = true;
						this.update();
					},
					stop: function() {
						this.running = false;
					},
					update: function() {
						if (this.running) {

							var currentTime = Date.now(),
								timeDifference = currentTime - this.lastTime;
							this.lastTime = currentTime;
							this.elapsedTime += timeDifference;
							this.tick += timeDifference;

							if (currentTime - this.lastTickTime >= 1000) { // Once per second
								this.lastTickTime = currentTime;
							}

							if (this.elapsedTime >= this.timePerFrame) {
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
					},
					runRequestFunction: function(callback) {
						var temp = this.requestFunction;
						temp(callback);
					}
				},
				config
			);
			// Post creation setup
			object.getCallbackFunction();
			object.setFPS(object.fps);
			return object;
		}
	}
};
