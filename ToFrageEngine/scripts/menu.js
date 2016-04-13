// /////////////
// Window system

function WindowLib(toFrage) {
	var localContainer = {
		version: "1.0",
		frage: toFrage
	};

	localContainer.widget = function() {
		return {
			arrangePos: [0, 0], // 0 to 1
			arrangeRatio: [1, 1], // 0 to 1
			isMouseOver: function(mousePosition) {
				return localContainer.frage.Math.checkWithinBounds(mousePosition, this.pos, this.ratio, 0);
			}
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
		//	return localContainer.frage.Math.checkWithinBounds(mousePosition, this.pos, this.ratio, 0);
		//};

		return local;
	};

	localContainer.resizeEvents = function(config) {
		var local = {
			beingResized: false,
			resizeOffset: 10,
			resizeInitialPos: [0, 0], // These are needed if the square is trying to move at the same time as resizing. (*Cough* DragEvent mismanagment *Cough*)
			resizeInitialRatio: [0, 0],
			resizeBorders: [] // 1, 2, 3, 4 (left, top, right, bottom
		};
		this.frage.Base.extend(config, local);

		local.onClickResize = function(data) {
			var mousePos = data["mouseMove"];
			var withinBounds = localContainer.frage.Math.checkWithinBounds;
			this.resizeBorders = [];
			if (this.isMouseOver(mousePos)) {
				// left - pos, [offset, ratio[1]]
				if (withinBounds(mousePos, this.pos, [this.resizeOffset, this.ratio[1]], 0)) this.resizeBorders.push(1);
				// top - pos, [ratio[0], offset]
				if (withinBounds(mousePos, this.pos, [this.ratio[0], this.resizeOffset], 0)) this.resizeBorders.push(2);
				// right - [pos[0] + (ratio[0] - offset), pos[1]], [offset, ratio[1]]
				if (withinBounds(mousePos, [this.pos[0] + (this.ratio[0] - this.resizeOffset), this.pos[1]], [this.resizeOffset, this.ratio[1]], 0)) this.resizeBorders.push(3);
				// bottom - [pos[0] + (ratio[1] - offset), pos[0]], [ratio[0], offset]
				if (withinBounds(mousePos, [this.pos[0], this.pos[1] + (this.ratio[1] - this.resizeOffset)], [this.ratio[0], this.resizeOffset], 0)) this.resizeBorders.push(4);
			}
			if (this.resizeBorders.length) {
				this.beingResized = true;
				this.resizeInitialPos = localContainer.frage.Base.deepCopy(this.pos);
				this.resizeInitialRatio = localContainer.frage.Base.deepCopy(this.ratio);
				return true;
			}
		};

		local.onReleaseResize = function(data) {
			this.beingResized = false;
			return true;
			// Confirm movement?

		};

		local.onMouseMoveResize = function(data) {
			var mousePos = data["mouseMove"];
			if (this.beingResized) {
				console.log("Fired! resize indexs:", this.resizeBorders);
				for (var index=0; index < this.resizeBorders.length; index++) {
					var side = this.resizeBorders[index];
					if (side == 1) { // left
						this.pos[0] = mousePos[0];
						this.ratio[0] = this.resizeInitialPos[0] + this.resizeInitialRatio[0] - mousePos[0];
					}
					if (side == 2) { // top
						this.pos[1] = mousePos[1];
						this.ratio[1] = this.resizeInitialPos[1] + this.resizeInitialRatio[1] - mousePos[1];
					}
					if (side == 3) { // right
						this.ratio[0] = mousePos[0] - this.pos[0];
						//this.pos[0] = this.pos[0] + mousePos[0];
					}
					if (side == 4) { // bottom
						this.ratio[1] = mousePos[1] - this.pos[1];
						//this.pos[1] = this.pos[1] + mousePos[1];
					}
				}
				return true;
			}
		};

		return local;
	};

	localContainer.container = function(config) {
		var local = {
			pos: [0, 0],
			ratio: [0, 0],
			arrangePos: [.5, .5],
			arrangeRatio: [.5, .5],
			context: undefined,
			validate: function(object) {
				if (object.setup
					&& object.arrangePos
					&& object.arrangeRatio) return true;
			}
		};
		this.frage.Base.extend(this.frage.Base.orderedObject(), local, true);
		this.frage.Base.extend(this.widget(), local);
		this.frage.Base.extend(this.dragEvents(this.resizeEvents(config)), local);

		local.setup = function(context) {
			this.context = context;
			this.iterateOverObjects(function(object) {
				object.setup(context);

			});
		};

		local.add_orderedObject = local.add;
		local.add = function(objectName, object) {
			if (this.add_orderedObject(objectName, object)) {
				if (this.context) object.setup(this.context);
				return true;
			}
		};

		local.updateLogic = function(frame) {
			// Arrange children - In this case arrange free
			this.iterateOverObjects(function(object) {
				object.pos = [
					local.pos[0] + (local.ratio[0] * object.arrangePos[0]),
					local.pos[1] + (local.ratio[1] * object.arrangePos[1])
				];
				object.ratio = [
					local.ratio[0] * object.arrangeRatio[0],
					local.ratio[1] * object.arrangeRatio[1],
				];
				object.updateLogic(frame);
			});
		};

		local.updateGraphics = function() {
			this.iterateOverObjects(function(object) {
				object.updateGraphics();
			});
		};

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
