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

	// --------------
	// General events
	// --------------

	var mouseState = frage.Events.stateEvent({
		triggers: ["mouseMove"]
	});
	// Add to the inputController
	inputEventContext.add("mouseMove", mouseState);

	// ------------
	// Window stuff
	// ------------

	// Create the container
	var container = createContainer(data);

	// Add it to a draw and logic layer
	drawLayer.add("Container", container);
	logicController.add("Container", container);


}
