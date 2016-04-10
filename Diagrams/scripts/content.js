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


	// Events

	var LMB_clickEvent =  frage.Events.actionEvent({
		triggers: [16, 1],
		deleteOnSuccess: [1]
	});

	LMB_clickEvent.add("console", function(results) {
		console.log("LMB was pressed! Data from the action was '", results, "'");
	});

	inputEventContext.add("LMB", LMB_clickEvent);

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

}
