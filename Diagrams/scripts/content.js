function createContent(data) {
	var frage = data.frage;

	var backgroundLayer = data.layerController.get("background");
	var drawLayer = data.layerController.get("draw");

	var logicController = data.logicController;
	var inputEventContext = data.inputEventContext;

	drawLayer.add("background", frage.Graphics.rectangle({
		includeBorder: false,
		color: "#a26b59",
		ratio: data.screenRatio
	}));

	// Create a Action and state event for dragging the container.
	// -----------------------------------------------------------

	var onClick = frage.Events.actionEvent({
		triggers: [1]
	});
	// Add to the inputController
	inputEventContext.add("click", onClick);

	var onRelease = frage.Events.actionEvent({
		triggers: [1],
		triggered: true,
		triggerOn: false
	});
	// Add to the inputController
	inputEventContext.add("clickRelease", onRelease);

	var mouseState = frage.Events.stateEvent({
		triggers: ["mouseMove"]
	});
	// Add to the inputController
	inputEventContext.add("mouseMove", mouseState);

	// ------------
	// Window stuff
	// ------------

	// Create a container to hold widgets
	var mainContainer = frage.WindowLib.container({
		pos: [100, 100],
		ratio: [200, 200],
		drag: false
	});

	// Add it to a draw and logic layer
	drawLayer.add("Container", mainContainer);
	logicController.add("Container", mainContainer);

	// Create a background widget
	var backgroundWidget = frage.WindowLib.square({
		color: "gray",
		alpha: .7,
		borderColor: "white",
		borderWidth: 2,
		borderAlpha: .7,
		arrangePos: [0, 0],
		arrangeRatio: [1, 1]
	});
	// Add it to the mainContainer
	mainContainer.add("backgroundWidget", backgroundWidget);

	onRelease.add("container", function() {
		mainContainer.drag = false;
	});

	onClick.add("container", function() {
		mainContainer.drag = true;
	});

	mouseState.add("container", function(results) {
		var mousePos = results["mouseMove"];
		if (mainContainer.drag) mainContainer.pos = mousePos;
	});
}
