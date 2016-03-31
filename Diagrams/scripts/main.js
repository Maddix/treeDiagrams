function setup(toFrage) {
	var frage = toFrage;

	// Create the layerController (AKA - Graphic controller)
	var layerController = frage.Graphics.getLayerController({
		ratio: [1024, 640]
	});
	layerController.setup(document.getElementById("container"));

	// Create Logic controller
	var logicController = frage.Base.getLogicController();

	// Create all the layers we are going to use, order matters
	layerController.add("background", frage.Graphics.getLayer());
	layerController.add("draw", frage.Graphics.getLayer());
	// Create an eventContext to handle input.
	var inputEventContext = frage.Events.getEventContext();

	// Data object
	var DATA = {
		layerController: layerController,
		logicController: logicController,
		screenRatio: layerController.ratio,
		inputEventContext: inputEventContext,
		mainLoop: undefined,
		frage: frage,
	};

	// Start main
	main(DATA);
}

function main(DATA) {

	// Setup listeners for key and mouse input. It shouldn't be here but I'm moving things around.
	var input = DATA.toFrage.Input.getInput();
	input.addListeners();

	// Create all the content
	createContent(DATA);

	// Make the loop
	mainLoop = DATA.toFrage.Base.loop({func:function(frame) {
		// update keys
		//var gatheredData = DATA.toFrage.Base.extend(mouse.getInput(), key.getInput());
		DATA.inputEventContext.update(input.getInput()["input"]);
		// Add project/collision layer
		// update logic
		DATA.logicController.update(frame);
		// Update all the layers in the layerController
		DATA.layerController.update();

	}, fps:60, useRAF:true, modifier:1}); // opera won't do 60 FPS (canvas max) if set to 60, to get around that set it to 80.

	// Kick off the loop
	mainLoop.start();

	// Put a handle on the loop
	DATA.mainLoop = mainLoop;
}
