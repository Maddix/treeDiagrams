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

	var onResizeClick = frage.Events.actionEvent({
		triggers: [1, "mouseMove"],
		removeOnSuccess: [1]
	});
	// Add to the inputController
	inputEventContext.add("clickResize", onResizeClick);

	var onResizeRelease = frage.Events.actionEvent({
		triggers: [1],
		removeOnSuccess: [1],
		includeIfTriggered: ["mouseMove", "d"],
		triggered: true,
		triggerOn: false
	});
	// Add to the inputController
	inputEventContext.add("releaseResize", onResizeRelease);

	var onDragClick = frage.Events.actionEvent({
		triggers: [1, "mouseMove"],
		removeOnSuccess: [1]
	});
	// Add to the inputController
	inputEventContext.add("clickDrag", onDragClick);

	var onDragRelease = frage.Events.actionEvent({
		triggers: [1],
		removeOnSuccess: [1],
		includeIfTriggered: ["mouseMove", "d"],
		triggered: true,
		triggerOn: false
	});
	// Add to the inputController
	inputEventContext.add("releaseDrag", onDragRelease);

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
		ratio: [200, 200]
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


	// Resize
	onResizeClick.add("containerResize", function(data) { mainContainer.onClickResize(data); });
	onResizeRelease.add("containerResize", function(data) { mainContainer.onReleaseResize(data); });
	mouseState.add("containerResize", function(data) { mainContainer.onMouseMoveResize(data); });

	// Drag
	//onDragClick.add("containerDrag", function(data) { mainContainer.onClickDrag(data); });
	//onDragRelease.add("containerDrag", function(data) { mainContainer.onReleaseDrag(data); });
	//mouseState.add("containerDrag", function(data) { mainContainer.onMouseMoveDrag(data); });



}
