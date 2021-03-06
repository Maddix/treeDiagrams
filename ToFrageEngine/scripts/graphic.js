function Graphic(creation) {
	var localContainer = {
		version: "1"
	};

	// Matrix for the canvas
	// context.transform(
	// 		Sc-X, Sk-Y, D-x,
	//		Sk-x, Sc-Y, D-y
	// )
	// Scale X | Skew Y  | Displace X
	// Skew X  | Scale Y | Displace Y
	// 0	   | 0		 | 1

	//
	// Moves then rotates the context
	localContainer.contextTranslateRotate = function(context, position, rotation) {
		context.translate(position[0], position[1]);
		context.rotate(rotation);
	};

	//
	// Returns the context to 0,0 and sets the rotates to 0
	localContainer.contextReset = function(context) {
		context.setTransform(1, 0, 0, 1, 0, 0); // Only needed if we change setTransform
		context.restore();
	};

	//
	// Draws an image on the context with the given offset, position, and rotation and then resets the context.
	localContainer.drawImage = function(context, image, imageOffset, position, rotation) {
		this.contextTranslateRotate(context, position, rotation);
		context.drawImage(image, -imageOffset[0], -imageOffset[1]);
		this.contextReset(context);
	};

	//
	// Draws an image on the context with the given offset, position, rotation, and scale and then resets the context.
	localContainer.drawImageScale = function(context, image, imageOffset, position, rotation, scale) {
		this.contextTranslateRotate(context, position, rotation);
		context.drawImage(
			image,
			-imageOffset[0]*scale,
			-imageOffset[1]*scale,
			image.width*scale,
			image.height*scale
		);
		this.contextReset(context);
	};

	//>
	// Draws an image on the context with the given offset, position, rotation, and scale as well as clipping the image and then resets the context.
	localContainer.drawImageClip = function(context, image, imageOffset, position, rotation, scale, clipPosition, clipArea) {
		this.contextTranslateRotate(context, position, rotation);
		context.drawImage(
			image,
			clipPosition[0],
			clipPosition[1],
			clipArea[0],
			clipArea[1],
			(-imageOffset[0]/2)*scale,
			(-imageOffset[1]/2)*scale,
			imageOffset[0]*scale,
			imageOffset[1]*scale
		);
		this.contextReset(context);
	};

	// Takes a number or string and appends a 'px' if one is not present. (Aweful name. :c)
	// Is addPx a more fitting name?
	localContainer.makeCssPixel = function(item) {
		if (creation.isType(item, "")) return item.endsWith("px") ? item : item + "px";
		return item;
	}

	// Creates a canvas element and manages it. Used for drawing to the screen.
	localContainer.layer = function() {
		return creation.extend(
			creation.simpleContainer(),
			{
				canvas: undefined,
				context: undefined,
				style: "position: absolute; background-color: transparent;",
				validateNewContent: function(object) {
					if (object.updateGraphics && object.setup) return true;
				},
				_add: function(item) {
					this.contents.push(item);
					if (this.context) item.setup(this.context);
				},
				// Creates a canvas element and then gets the canvas 2d object by default.
				setup: function(container, id, area, is3d) {
					var canvas = document.createElement("canvas");
					canvas.setAttribute("id", id);
					canvas.setAttribute("width", localContainer.makeCssPixel(String(area[0])));
					canvas.setAttribute("height", localContainer.makeCssPixel(String(area[1])));
					canvas.setAttribute("style", this.style);
					this.context = canvas.getContext(is3d ? "3d" : "2d");
					container.appendChild(canvas);
					this.canvas = canvas;
					if (this.contents.length && this.context) {
						this.contents.forEach(function(object) {
							object.setup(this.context);
						});
					}
				},
				updateGraphics: function() {
					this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
					//console.log(this.contents.length);
					this.contents.forEach(function(object) {
						object.updateGraphics();
					});
				}
			}
		);
	}

	localContainer.layerContainer = function(config) {
		var lc = creation.compose(
			creation.namedContainer(),
			{
				LayerIdx: 0,
				area: [640, 480],
				is3d: false,
				container: null, // Required
				div: null, // Will get created
				divAttributes: {
					id: "engine",
					oncontextmenu: "return false;"
				},
				validateNewContent(object) {
					return !!object.setup;
				},
				_add: function(item, name) {
					this.contents.push(item);
					this.contentNames.push(name);
					var id = "Layer".concat(this.LayerIdx++, "-", name ? name : "");
					item.setup(this.div, id, this.area, this.is3d);
				},
				update: function() {
					//console.log("Fired");
					this.contents.forEach(function(object) {
						object.updateGraphics();
					});
				}
			},
			config
		);

		if (!lc.divAttributes.style) {
			lc.divAttributes.style = "position: relative; width: {0}; height: {1};".format(
				localContainer.makeCssPixel(String(lc.area[0])),
				localContainer.makeCssPixel(String(lc.area[1]))
			);
		}
		if (!lc.div) {
			lc.div = document.createElement("div");
			for (var key in lc.divAttributes) {
				lc.div.setAttribute(key, lc.divAttributes[key]);
			}
			lc.container.appendChild(lc.div);
		} else console.error("LayerContainer requires a div to setup.")

		return lc;
	}

	// The simplest drawable object.
	localContainer.drawable = function(config) {
		return creation.extend(
			{
				pos: [0, 0],
				alpha: 1,
				context: null,
				setup: function(context) { this.context = context; }
			},
			config);
		// This is where you would put your drawing code. As this is an example I'm leaving it commented due to performance concerns.
		//updateGraphics: function() {};
	};

	/*  A simple object that will draw a given image. Complete with an offset, rotation, and scale.
		If 'automaticImageSmoothing' is true then 'imageSmoothing' will be ignored and image smoothing
		will be enabled and disabled depending on if the 'scale' is greater then 1 or less then 1.
	*/
	localContainer.image = function(config) {
		return creation.compose(
			localContainer.drawable(),
			{
				image: null,
				rotation: 0,
				offset: [0, 0],
				scale: 1,
				automaticImageSmoothing: true,
				imageSmoothing: true,
				// Sets the image smoothing on the context. Calling outside of drawing will waste CPU time.
				setContextImageSmoothingEnabled: function() {
					this.context.imageSmoothingEnabled = this.automaticImageSmoothing ? (this.scale > 1 ? false : true) : this.imageSmoothing;
				},
				// Sets the alpha for the image and then draws it.
				updateGraphics: function() {
					this.context.globalAlpha = this.alpha;
					this.setContextImageSmoothingEnabled();
					localContainer.drawImageScale(
						this.context,
						this.image,
						this.offset,
						this.pos,
						this.rotation,
						this.scale
					);
				}
			},
			config
		);
	};

	// Will animate over a spritesheet with keyframes. Is not automatic so you will have to set 'currentFrame' to the proper frame.
	localContainer.animationManual = function(config) {
		return creation.compose(
			localContainer.image(),
			{
				animationKeyFrames: {}, // {"AnimationName":[x, y, width, height, ..], "Idle":[0, 0, 32, 32], ..}
				currentAnimation: "",
				currentAnimationLength: 0,
				currentFrame: 0,
				frame: [],
				// Keeps the current frame within the animation cycle.
				setFrame: function(frameNumber) {
					if (frameNumber < this.currentAnimationLength) this.currentFrame = 0;
					else if (frameNumber > this.currentAnimationLength) this.currentFrame = this.currentAnimationLength - 1;
					else this.currentFrame = frameNumber;
				},
				nextFrame: function() { // Moves the animaion forward one frame.
					this.setFrame(this.currentframe + 1);
				},
				previousFrame: function() { // Moves the animation backward one frame.
					this.setFrame(this.currentframe - 1);
				},
				getAnimationLength: function() { // Sets the selected animation frame length.
					this.currentAnimationLength =  this.animationKeyFrames[this.currentAnimation].length/4;
				},
				getFrame: function() { // Calculates the frame keys for the current frame.
					var keyFrames = this.animationKeyFrames[this.currentAnimation];
					this.frame = [
						keyFrames[this.currentFrame].slice(0, 2), // [x, y]
						keyFrames[this.currentFrame].slice(2, 4) // [width, height]
					];
				},
				setCurrentAnimation: function(animationName, frameNumber) { // Draws the current frame from the current animation.
					if (animationName in this.animationKeyFrames) {
						this.currentAnimation = animationName;
						this.getAnimationLength();
						this.setFrame(frameNumber || 0);
						return true;
					}
				},
				updateGraphics: function() { // Draws the current frame from the current animation.
					this.context.globalAlpha = this.alpha;
					this.setContextImageSmoothingEnabled();
					localContainer.drawImageClip(
						this.context,
						this.image,
						this.getOffsetScale(),
						this.pos,
						this.rotation,
						this.scale,
						this.frame[0], // ImageCut [x, y]
						this.frame[1] // ImageCut [width, height]
					);
				}
			},
			config
		);
	};

	// Automatically animate without having to manually change the frame.
	localContainer.animation = function(config) {
		var local = {
			framesPerSecond:1, // Per second
			repeatAnimation:true, // Repeat the animation
			animate:false, // start/continue the animation
			animateForwards: true, // false for backwards
			lastFrameTime: 0,
			// Check to see if the animation has reached the end of the cycled for the direction its cycling. If repeat animation is false then stop the animation.
			hasAnimationFinishedCycle: function() {
				if (!this.repeatAnimation) {
					if (this.animateForwards && this.currentFrame == this.currentAnimationLength-1) this.animate = false;
					else if (!this.animateForwards && this.currentFrame == 0) this.animate = false;
				}
			},
			updateLogic: function(frame) { // Increments/Decrements the frame every so many milliseconds.
				if (this.animate && frame.time - this.lastFrameTime >= 1000/this.framesPerSecond) {
					if (this.animateForwards) this.nextFrame();
					else previousFrame();
					this.hasAnimationFinishedCycle();
					this.lastFrameTime = frame.time;
				}
			},

		};

		local = creation.extend(local, localContainer.animationManual());
		var setCurrentAnimation = local.setCurrentAnimation.bind(local);
		// Resets the animation timer while resetting the animation.
		local.setCurrentAnimation = function(animationName, frameNumber, framesPerSecond) {
			if (setCurrentAnimation(animationName, frameNumber)) {
				this.LastFrameTime += 1000/this.framesPerSecond;
				if (framesPerSecond) this.framesPerSecond = framesPerSecond;
				return true;
			}
		};
		creation.extend(local, config);
		return local;
	};

	// Creates a object that will render text. I will need to make another pass when I start using this again.
	localContainer.text = function(config, fontWidth) {
		// Can't be touched from outside the constructor. (^'u')^ - {yey}
		var width = 0, // This is determined by the height and length of local.text
			height = fontWidth ? fontWidth : 12;

		return creation.compose(
			this.drawable(),
			{
				text: "null",
				font: "Arial",
				color: "white",
				align: "start", // start, end, left, center, right
				baseline: "alphabetic", // top, bottom, middle, alphabetic, hanging
				// Set the height of the text.
				setSize: function(_height) {
					height = _height;
				},
				// get the size of the text.
				getSize: function() {
					return [width, height];
				},
				// Set the font on the context.
				setFont: function() {
					this.context.font = "{0} {1}".format(localContainer.makeCssPixel(String(height)), this.font);
				},
				// Set the font and get the width of the text
				getTextWidth: function() {
					this.setFont();
					width = this.context.measureText(this.text).width;
				},
				// Render the text
				updateGraphics: function() {

					this.context.globalAlpha = this.alpha;
					//this.context.globalCompositeOperation = "source-atop";
					this.context.fillStyle = this.color;
					this.context.textAlign = this.align;
					this.context.textBaseline = this.baseline;
					this.setFont();
					this.context.fillText(this.text, this.pos[0], this.pos[1]);
					//this.context.globalCompositeOperation = "source-over";
				}
			},
			config
		);
	};

	// Defines common things in shapes.
	localContainer.shape = function(config) {
		return creation.compose(
			localContainer.drawable(),
			{
				rotation: 0,
				area:[100, 100],
				color:"white" // Should it be black?
			},
			config
		);
	};

	// Defines common things with borders around shapes.
	// I don't need a superName since I have no functions
	localContainer.border = function(config) {
		return creation.extend(
			{
				borderWidth:1,
				borderColor:"black",
				borderStyle:"round", // bevel, round, miter
				borderAlpha:1,
				drawBorder: function() {
					this.context.globalAlpha = this.borderAlpha;

					this.context.lineJoin = this.borderStyle;
					this.context.lineWidth = this.borderWidth;
					this.context.strokeStyle = this.borderColor;
					this.context.stroke();
				}
			},
			config);
	};

	// Draws a rectangle without a border.
	localContainer.rectangle = function(config) {
		return creation.compose(
			localContainer.shape(),
			{
				updateGraphics: function() {
					this.context.beginPath();
					// this.context.shadowBlur = 20;
					// this.context.shadowColor = "black";
					this.context.rect(this.pos[0], this.pos[1], this.area[0], this.area[1]);
					this.context.globalAlpha = this.alpha;
					this.context.fillStyle = this.color;
					this.context.fill();
					// this.context.shadowBlur = 0;
				}
			},
			config
		);
	};

	localContainer.borderedRectangle = function(config) {
		return creation.compose(
			localContainer.rectangle(),
			localContainer.border(),
			{
				updateGraphics: function() {
					arguments.callee.super["rectangle"]();
					this.drawBorder();
				}
			},
			config
		);
	};


	// Not testing yet
	localContainer.circle = function(config) {
		return creation.compose(
			localContainer.drawable(),
			{
				angleArea: [0, 2*Math.PI],
				radius: 100,
				clockwise: true,
				color: "white",
				updateGraphics: function() {
					this.context.beginPath();
					this.context.arc(this.pos[0], this.pos[1], this.radius, this.angleArea[0], this.angleArea[1], this.clockwise);
					this.context.globalAlpha = this.alpha;
					this.context.fillStyle = this.color;
					this.context.fill();
				}
			},
			config
		);
	};

	localContainer.borderedCircle = function(config) {
		return creation.compose(
			localContainer.circle(),
			localContainer.border(),
			{
				updateGraphics: function() {
					arguments.callee.super["circle"]();
					this.drawBorder();
				}
			},
			config
		);
	};


	// Draws a line.
	localContainer.line = function(config) {
		return creation.compose(
			this.shape(),
			{
				style: "round",
				lineWidth: 1,
				updateGraphics: function() {
					this.context.globalAlpha = this.alpha;
					localContainer.contextTranslateRotate(this.context, [this.pos[0] += this.area[0], this.pos[1] += this.area[1]], this.rotation);
					this.context.beginPath(); // Needed. Major lag if removed.
					this.context.moveTo(this.pos[0], this.pos[1]);
					this.context.lineTo(this.pos[0] + this.area[0], this.pos[1] + this.area[1]);
					this.context.closePath(); // ? Not so sure if needed.
					this.context.lineJoin = this.style;
					this.context.lineWidth = this.lineWidth;
					this.context.strokeStyle = this.color;
					this.context.stroke();
					localContainer.contextReset(this.context);
				}
			},
			config
		);
	};

	// Draws multiple lines.
	localContainer.lines = function(config) {
		return creation.compose(
			this.shape(),
			{
				style: "round",
				lineWidth: 1,
				shape: [], // Holds lists of points, each new list is a new line -> [[startX,startY, x,y, ..], [startX,startY, x,y], ..]
				scale: function(scalar) { // Destructive atm.
					this.shape = this.shape.map(function(group) {
						return group.map(function(coord) { return coord * scalar; });
					});
					return this;
				},
				drawShape: function() {
					this.context.beginPath();
					for (var lineIdx=0, groupLen=this.shape.length; lineIdx < groupLen; lineIdx++) {
						var line = this.shape[lineIdx], place = [line[0], line[1]];
						this.context.moveTo(place[0], place[1]);
						for (var pointIdx=2, len=this.shape[lineIdx].length; pointIdx < len; pointIdx+=2) {
							this.context.lineTo(place[0] += line[pointIdx], place[1] += line[pointIdx+1]);
						}
					}
				},
				updateGraphics: function() {
					localContainer.contextTranslateRotate(this.context, this.pos, this.rotation);
					this.drawShape();
					this.context.globalAlpha = this.alpha;
					this.context.lineJoin = this.style;
					this.context.lineWidth = this.lineWidth;
					this.context.strokeStyle = this.color;
					this.context.stroke();
					localContainer.contextReset(this.context);
				}
			},
			config
		);
	};

	return localContainer;
};
