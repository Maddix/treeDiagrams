function GUI(engine) {
	var localContainer = {};

	// PLEASE NOTE: This isn't a normal factory in that it doesn't return something runnable.
	localContainer.absolutePositionPiece = function(config) {
		return engine.Creation.compose(
			{
				// REQUIRES: area: [int, int]
				// REQUIRES: pos: [int, int]
				// REQUIRES: arrange: function() {}
				localPos: [.5, .5],
				localArea: [.5, .5],
				localPosRatio: true,
				localAreaRatio: true,
				update: function(newPos, newArea) {
					// Prioritize area over pos
					if (this.localAreaRatio) {
						this.area = [
							newArea[0]*this.localArea[0],
							newArea[1]*this.localArea[1]
						].map(Math.abs);
					} else {
						var area = [
							this.localArea[0] < 0 ? newArea[0] + this.localArea[0] : this.localArea[0],
							this.localArea[1] < 0 ? newArea[1] + this.localArea[1] : this.localArea[1]
						].map(Math.abs);
						this.area = [
							area[0] < newArea[0] ? area[0] : newArea[0],
							area[1] < newArea[1] ? area[1] : newArea[1]
						];
					}
					if (this.localPosRatio) {
						this.pos = [
							newPos[0] + (newArea[0] - this.area[0])*this.localPos[0],
							newPos[1] + (newArea[1] - this.area[1])*this.localPos[1]
						];
					} else {
						var posSpace = [
							newArea[0] - this.area[0],
							newArea[1] - this.area[1]
						];
						var negativePos = [
							posSpace[0] + this.localPos[0],
							posSpace[1] + this.localPos[1]
						].map(function(x) { return x < 0 ? 0 : x; });
						var pos = [
							this.localPos[0] < 0 ? negativePos[0] : this.localPos[0],
							this.localPos[1] < 0 ? negativePos[1] : this.localPos[1]
						].map(Math.abs);
						this.pos = [
							newPos[0] + (pos[0] + this.area[0] <= newArea[0] ? pos[0] : posSpace[0]),
							newPos[1] + (pos[1] + this.area[1] <= newArea[1] ? pos[1] : posSpace[1])
						];
					}
					this.arrange();
				}
			},
			config
		);
	}

	localContainer.container = function(config) {
		return engine.Creation.compose(
			{
				pos: [0, 0], // 0,0 (x, y - ie position on the screen)
				area: [100, 100], // 720x480 (Width, height)
				children: [],
				events: engine.Event.eventGroup({ active: false }),
				add: function(item) {
					this.children.push(item);
					this.events.add(item.events);
					return this;
				},
				remove: function(item) {
					var found = this.children.indexOf(item);
					if (found) {
						this.events.remove(this.children[found].events);
						return this.children.splice(found, 1);
					}
				},
				arrange: function() {
					var self = this;
					this.children.forEach(function(child) {
						child.update(self.pos, self.area);
					});
				},
				within: function(position) {
					var results = this.children.map(function(child, idx) {
						var within = child.within(position);
						if (Array.isArray(within)) return [idx, within];
						else return within ? idx : false;
					}).filter(function(result) { return result !== false; });
					this.events.active = true;
					if (!results.length) {
						var within = engine.Math.checkWithinBounds(position, this.pos, this.area, 0);
						this.events.active = within;
						return within;
					}
					return results;
				},
				update: function(newPos, newArea) {
					this.pos = newPos;
					this.area = newArea;
					this.arrange();
				}
			},
			config
		);
	}

	localContainer.containerAbs = function(config) {
		return engine.Creation.compose(
			this.container(),
			this.absolutePositionPiece(),
			config
		);
	}

	localContainer.containerRow = function(config) {
		return engine.Creation.compose(
			this.container(),
			{
				arrangeFunc: function(total, pos, area) {
					var area = [area[0]/total, area[1]];
					return engine.Creation.genArray(total, function(_, idx) {
						return [[pos[0] + (area[0]*idx), pos[1]], area];
					});
				},
				arrange: function() {
					var totalCells = this.children.length;
					if (totalCells) {
						var positionalData = this.arrangeFunc(totalCells, this.pos, this.area);
						this.children.forEach(function(child, idx) {
							var data = positionalData[idx];
							child.update(data[0], data[1]);
						});
					}
				}
			},
			config
		);
	}

	localContainer.containerColumn = function(config) {
		return engine.Creation.compose(
			this.containerRow(),
			{
				arrangeFunc: function(total, pos, area) {
					var area = [area[0], area[1]/total];
					return engine.Creation.genArray(total, function(_, idx) {
						return [[pos[0], pos[1] + (area[1]*idx)], area];
					});
				}
			},
			config
		);
	}

	localContainer.widget = function(config) {
		return engine.Creation.compose(
			{
				pos: [0, 0],
				area: [0, 0],
				graphic: null,
				events: engine.Event.eventGroup({ active: false }),
				arrange: function() {
					this.graphic.pos = this.pos;
					this.graphic.area = this.area;
				},
				within: function(position) {
					var result = engine.Math.checkWithinBounds(position, this.pos, this.area, 0);
					this.events.active = result;
					//console.log("Widget event active: ", this.events.active);
					return result;
				},
				update: function(newPos, newArea) {
					this.pos = newPos;
					this.area = newArea;
					this.arrange();
				}
			},
			config
		);
	}

	// Fit as in Fit the available space and pad the graphic.
	localContainer.widgetFit = function(config) {
		return engine.Creation.compose(
			this.widget(),
			{
				pad: [1, 1],
				ratio: true,
				arrange: function() {
					if (this.ratio) {
						this.graphic.area = [
							this.area[0]*this.pad[0],
							this.area[1]*this.pad[1]
						];
						this.graphic.pos = [
							this.pos[0] + ((this.area[0] - this.graphic.area[0])/2),
							this.pos[1] + ((this.area[1] - this.graphic.area[1])/2)
						];
					} else {
						this.graphic.pos = [
							this.pos[0] + this.pad[0],
							this.pos[1] + this.pad[1]
						];
						this.graphic.area = [
							this.area[0] - this.pad[0]*2,
							this.area[1] - this.pad[1]*2
						];
					}
				}
			},
			config
		);
	}

	localContainer.widgetAbs = function(config) {
		return engine.Creation.compose(
			this.widget(),
			this.absolutePositionPiece(),
			{
				arrange: function() {
					this.graphic.pos = this.pos;
					this.graphic.area = this.area;
				}
			},
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
