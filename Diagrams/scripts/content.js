function createContent(data) {
	var engine = data.engine;

	var backgroundLayer = data.layerController.get("background");
	var drawLayer = data.layerController.get("draw");

	var logicController = data.logicController;
	var inputEventContext = data.inputEventContext;

	drawLayer.add("background", engine.Graphics.rectangle({
		color: "#a26b59",
		area: data.screenArea
	}));

	var windowContainer = engine.GUI.container({
		pos:[100, 100],
		area: [600, 400]
	});

	var windowBackground = engine.GUI.square({
		color: "white",
		alpha: .5,
		arrangePos: [0, 0],
		arrangeArea: [1, 1]
	})

	var square = engine.GUI.square({
		arrangePos: [.25, .25],
		arrangeArea: [.5, .5],
		color: "orange"
	});

	var line = engine.GUI.line({
		arrangePos: [.02, .1],
		arrangeArea: [.96, 0],
		color: "black",
		lineWidth: 1
	});

	var x_box = engine.GUI.lines({
		arrangePos: [.95, .03],
		shape: [
			// Box
			[0, 0, 20, 0],
			[20, 0, 20, 20],
			[20, 20, 0, 20],
			[0, 20, 0, 0],
			// X in the box
			[5, 5, 15, 15],
			[15, 5, 5, 15]],
		color: "black",
		lineWidth: 2
	});

	windowContainer.add("windowBackground", windowBackground);
	windowContainer.add("square", square);
	windowContainer.add("line", line);
	windowContainer.add("x_box", x_box);

	drawLayer.add("windowContainer", windowContainer);
	logicController.add("windowContainer", windowContainer);

}
