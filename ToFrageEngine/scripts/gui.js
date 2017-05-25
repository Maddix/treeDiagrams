// /////////////
// Window system

function GUI(engine) {
	var localContainer = {};

	localContainer.grid = function(config) {
		var children = engine.Creation.orderedDictionary();
		return engine.Creation.compose(
			{
				boundPos: [0, 0], // 0,0 (x, y - ie position on the screen)
				boundArea: [100, 100], // 720x480 (Width, height)
				fillArea: [1, 1], // Should it fill its space or should it be smaller than it?
				position: "center", // Should it fill the center

				children: children,
				add: children.add,
				get: children.get,
				remove: children.remove,
				changePosition: children.changePosition,
				iterateOverObjects: children.iterateOverObjects,

				positionChildren: function() {
					
				},

				update: function() {

				},



			}
			config
		);
	}


	// localContainer.widget = function() {
	// 	return {
	// 		arrangePos: [0, 0], // 0 to 1
	// 		arrangeArea: [1, 1], // 0 to 1
	// 		isMouseOver: function(mousePosition) {
	// 			return localContainer.frage.Math.checkWithinBounds(mousePosition, this.pos, this.area, 0);
	// 		}
	// 	};
	// };
	//
	// localContainer.dragEvents = function(config) {
	// 	var local = {
	// 		beingDragged: false,
	// 		dragOffset: [0, 0]
	// 	};
	// 	this.frage.Base.extend(config, local);
	//
	// 	local.onClickDrag = function(data) {
	// 		var mouseMove = data["mouseMove"];
	// 		if (this.isMouseOver(mouseMove)) {
	// 			this.beingDragged = true;
	// 			this.dragOffset = [this.pos[0] - mouseMove[0], this.pos[1] - mouseMove[1]];
	// 			return true;
	// 		}
	// 	};
	//
	// 	local.onReleaseDrag = function(data) {
	// 		this.beingDragged = false;
	// 		return true;
	// 	};
	//
	// 	local.onMouseMoveDrag = function(data) {
	// 		var mouseMove = data["mouseMove"];
	// 		if (this.beingDragged) {
	// 			this.pos = [mouseMove[0] + this.dragOffset[0], mouseMove[1] + this.dragOffset[1]];
	// 			return true;
	// 		}
	// 	};
	//
	// 	//local.isMouseOver = function(mousePosition) {
	// 	//	return localContainer.frage.Math.checkWithinBounds(mousePosition, this.pos, this.area, 0);
	// 	//};
	//
	// 	return local;
	// };
	//
	// localContainer.resizeEvents = function(config) {
	// 	var local = {
	// 		beingResized: false,
	// 		resizeOffset: 10,
	// 		resizeBorders: [] // 1, 2, 3, 4 (left, top, right, bottom)
	// 	};
	// 	this.frage.Base.extend(config, local);
	//
	// 	local.onClickResize = function(data) {
	// 		var mousePos = data["mouseMove"];
	// 		var withinBounds = localContainer.frage.Math.checkWithinBounds;
	// 		this.resizeBorders = [];
	// 		if (this.isMouseOver(mousePos)) {
	// 			// left - pos, [offset, area[1]]
	// 			if (withinBounds(mousePos, this.pos, [this.resizeOffset, this.area[1]], 0)) this.resizeBorders.push(1);
	// 			// top - pos, [area[0], offset]
	// 			if (withinBounds(mousePos, this.pos, [this.area[0], this.resizeOffset], 0)) this.resizeBorders.push(2);
	// 			// right - [pos[0] + (area[0] - offset), pos[1]], [offset, area[1]]
	// 			if (withinBounds(mousePos, [this.pos[0] + (this.area[0] - this.resizeOffset), this.pos[1]], [this.resizeOffset, this.area[1]], 0)) this.resizeBorders.push(3);
	// 			// bottom - [pos[0] + (area[1] - offset), pos[0]], [area[0], offset]
	// 			if (withinBounds(mousePos, [this.pos[0], this.pos[1] + (this.area[1] - this.resizeOffset)], [this.area[0], this.resizeOffset], 0)) this.resizeBorders.push(4);
	// 		}
	// 		if (this.resizeBorders.length) {
	// 			this.beingResized = true;
	// 			return true;
	// 		}
	// 	};
	//
	// 	local.onReleaseResize = function(data) {
	// 		this.beingResized = false;
	// 		return true;
	// 	};
	//
	// 	local.onMouseMoveResize = function(data) {
	// 		var mousePos = data["mouseMove"];
	// 		if (this.beingResized) {
	// 			console.log("Fired! resize indexs:", this.resizeBorders);
	// 			for (var index=0; index < this.resizeBorders.length; index++) {
	// 				var side = this.resizeBorders[index];
	// 				if (side == 1) { // left
	// 					this.area[0] = this.pos[0] + this.area[0] - mousePos[0];
	// 					this.pos[0] = mousePos[0];
	// 				}
	// 				if (side == 2) { // top
	// 					this.area[1] = this.pos[1] + this.area[1] - mousePos[1];
	// 					this.pos[1] = mousePos[1];
	// 				}
	// 				if (side == 3) { // right
	// 					this.area[0] = mousePos[0] - this.pos[0];
	// 				}
	// 				if (side == 4) { // bottom
	// 					this.area[1] = mousePos[1] - this.pos[1];
	// 				}
	// 			}
	// 			return true;
	// 		}
	// 	};
	//
	// 	return local;
	// };
	//
	// localContainer.container = function(config) {
	// 	var local =  engine.Creation.compose(engine.Creation.orderedDictionary(), localContainer.widget(), {
	// 		pos: [0, 0],
	// 		area: [100, 100],
	// 		arrangePos: [.5, .5],
	// 		arrangeArea: [.5, .5],
	// 		context: undefined,
	// 		validate: function(object) {
	// 			if (object.setup
	// 				&& object.arrangePos
	// 				&& object.arrangeArea) return true;
	// 		},
	// 		setup: function(context) {
	// 			this.context = context;
	// 			this.iterateOverObjects(function(object) {
	// 				object.setup(context);
	//
	// 			});
	// 		},
	// 		add: function(objectName, object) {
	// 			if (arguments.callee.super["orderedDictionary"](objectName, object)) {
	// 				if (this.context) object.setup(this.context);
	// 				return true;
	// 			}
	// 		},
	// 		updateLogic: function(frame) {
	// 			// Arrange children - In this case arrange free
	// 			this.iterateOverObjects(function(object) {
	// 				object.pos = [
	// 					local.pos[0] + (local.area[0] * object.arrangePos[0]),
	// 					local.pos[1] + (local.area[1] * object.arrangePos[1])
	// 				];
	// 				object.area = [
	// 					local.area[0] * object.arrangeArea[0],
	// 					local.area[1] * object.arrangeArea[1],
	// 				];
	// 				object.updateLogic(frame);
	// 			});
	// 		},
	// 		updateGraphics: function() {
	// 			this.iterateOverObjects(function(object) {
	// 				object.updateGraphics();
	// 			});
	// 		}
	// 	}, config);
	// 	local.superName = "container";
	// 	return local;
	// };
	//
	// localContainer.square = function(config) {
	// 	return engine.Creation.compose(this.widget(), engine.Graphics.rectangle(), {
	// 		updateLogic: function(frame) { }
	// 	}, config);
	// };
	//
	// localContainer.text = function(config, fontWidth) {
	// 	var local = this.frage.Base.extend(this.widget());
	// 	this.frage.Base.extend(this.frage.Graphics.text(config, fontWidth), local);
	//
	// 	local.setup = function(context) {
	// 		this.context = context;
	// 		this.getTextWidth();
	// 	};
	//
	// 	local.updateLogic = function(frame) {
	// 		//console.log(this.arrangePos);
	// 	};
	//
	// 	local.inputContext = function(input) {
	// 		return input;
	// 	};
	//
	// 	return local;
	// };
	//
	// localContainer.line = function(config) {
	// 	return engine.Creation.compose(this.widget(), engine.Graphics.line(), {
	// 		updateLogic: function(frame) { }
	// 	}, config);
	// }
	//
	// localContainer.lines = function(config) {
	// 	return engine.Creation.compose(this.widget(), engine.Graphics.lines(), {
	// 		updateLogic: function(frame) { }
	// 	}, config);
	// }

	return localContainer;
};
