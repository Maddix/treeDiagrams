// /////////////
// Window system

function WindowLib(engine) {
	var localContainer = {
		version: "1.0",
		frage: toFrage
	};

	localContainer.widget = function() {
		return {
			arrangePos: [0, 0], // 0 to 1
			arrangeShape: [1, 1], // 0 to 1
			//isMouseOver: function(mousePosition) {
			//	return localContainer.frage.Math.checkWithinBounds(mousePosition, this.pos, this.shape, 0);
			//}
		};
	};

	localContainer.dragEvents = function(config) {
		var local = {
			beingDragged: false,
			dragOffset: [0, 0]
		};
		this.frage.Base.extend(config, local);

		local.onClickDrag = function(data) {
			var mouseMove = data["mouseMove"];
			if (this.isMouseOver(mouseMove)) {
				this.beingDragged = true;
				this.dragOffset = [this.pos[0] - mouseMove[0], this.pos[1] - mouseMove[1]];
				return true;
			}
		};

		local.onReleaseDrag = function(data) {
			this.beingDragged = false;
			return true;
		};

		local.onMouseMoveDrag = function(data) {
			var mouseMove = data["mouseMove"];
			if (this.beingDragged) {
				this.pos = [mouseMove[0] + this.dragOffset[0], mouseMove[1] + this.dragOffset[1]];
				return true;
			}
		};

		//local.isMouseOver = function(mousePosition) {
		//	return localContainer.frage.Math.checkWithinBounds(mousePosition, this.pos, this.shape, 0);
		//};

		return local;
	};

	localContainer.resizeEvents = function(config) {
		var local = {
			beingResized: false,
			resizeOffset: 10,
			resizeBorders: [] // 1, 2, 3, 4 (left, top, right, bottom)
		};
		this.frage.Base.extend(config, local);

		local.onClickResize = function(data) {
			var mousePos = data["mouseMove"];
			var withinBounds = localContainer.frage.Math.checkWithinBounds;
			this.resizeBorders = [];
			if (this.isMouseOver(mousePos)) {
				// left - pos, [offset, shape[1]]
				if (withinBounds(mousePos, this.pos, [this.resizeOffset, this.shape[1]], 0)) this.resizeBorders.push(1);
				// top - pos, [shape[0], offset]
				if (withinBounds(mousePos, this.pos, [this.shape[0], this.resizeOffset], 0)) this.resizeBorders.push(2);
				// right - [pos[0] + (shape[0] - offset), pos[1]], [offset, shape[1]]
				if (withinBounds(mousePos, [this.pos[0] + (this.shape[0] - this.resizeOffset), this.pos[1]], [this.resizeOffset, this.shape[1]], 0)) this.resizeBorders.push(3);
				// bottom - [pos[0] + (shape[1] - offset), pos[0]], [shape[0], offset]
				if (withinBounds(mousePos, [this.pos[0], this.pos[1] + (this.shape[1] - this.resizeOffset)], [this.shape[0], this.resizeOffset], 0)) this.resizeBorders.push(4);
			}
			if (this.resizeBorders.length) {
				this.beingResized = true;
				return true;
			}
		};

		local.onReleaseResize = function(data) {
			this.beingResized = false;
			return true;
		};

		local.onMouseMoveResize = function(data) {
			var mousePos = data["mouseMove"];
			if (this.beingResized) {
				console.log("Fired! resize indexs:", this.resizeBorders);
				for (var index=0; index < this.resizeBorders.length; index++) {
					var side = this.resizeBorders[index];
					if (side == 1) { // left
						this.shape[0] = this.pos[0] + this.shape[0] - mousePos[0];
						this.pos[0] = mousePos[0];
					}
					if (side == 2) { // top
						this.shape[1] = this.pos[1] + this.shape[1] - mousePos[1];
						this.pos[1] = mousePos[1];
					}
					if (side == 3) { // right
						this.shape[0] = mousePos[0] - this.pos[0];
					}
					if (side == 4) { // bottom
						this.shape[1] = mousePos[1] - this.pos[1];
					}
				}
				return true;
			}
		};

		return local;
	};

	localContainer.container = function(config) {
		var local =  engine.Creation.compose(engine.Creation.orderedDictionary(), localContainer.widget(), {
			pos: [0, 0],
			shape: [0, 0],
			arrangePos: [.5, .5],
			arrangeShape: [.5, .5],
			context: undefined,
			validate: function(object) {
				if (object.setup
					&& object.arrangePos
					&& object.arrangeShape) return true;
			},
			setup: function(context) {
				this.context = context;
				this.iterateOverObjects(function(object) {
					object.setup(context);

				});
			},
			add: function(objectName, object) {
				if (arguments.callee.super["orderedDictionary"](objectName, object)) {
					if (this.context) object.setup(this.context);
					return true;
				}
			},
			updateLogic: function(frame) {
				// Arrange children - In this case arrange free
				this.iterateOverObjects(function(object) {
					object.pos = [
						local.pos[0] + (local.shape[0] * object.arrangePos[0]),
						local.pos[1] + (local.shape[1] * object.arrangePos[1])
					];
					object.shape = [
						local.shape[0] * object.arrangeShape[0],
						local.shape[1] * object.arrangeShape[1],
					];
					object.updateLogic(frame);
				});
			},
			updateGraphics: function() {
				this.iterateOverObjects(function(object) {
					object.updateGraphics();
				});
			}
		}, config);
		local.superName = "container";
		return local;
	};

	localContainer.square = function(config) {
		var local = this.frage.Base.extend(this.widget());
		this.frage.Base.extend(this.frage.Graphics.rectangle(config), local);
		local.updateLogic = function(frame) {
			//console.log(this.arrangePos);
		};

		return local;
	};

	localContainer.text = function(config, fontWidth) {
		var local = this.frage.Base.extend(this.widget());
		this.frage.Base.extend(this.frage.Graphics.text(config, fontWidth), local);

		local.setup = function(context) {
			this.context = context;
			this.getTextWidth();
		};

		local.updateLogic = function(frame) {
			//console.log(this.arrangePos);
		};

		local.inputContext = function(input) {
			return input;
		};

		return local;
	};

	return localContainer;
};
