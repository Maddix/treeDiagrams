function setup() {
	var engine = Engine();

	// Create the layerController (AKA - Graphic controller)
	var layerController = engine.Graphics.getLayerController({
		area: [1024, 640],
		container: document.getElementById("container")
	});

	// Create Logic controller
	var logicController = engine.Util.getLogicController();

	// Create all the layers we are going to use, order matters
	layerController.add("background", engine.Graphics.getLayer());
	layerController.add("draw", engine.Graphics.getLayer());

	// Create input and an eventContext to handle it.
	var input = engine.Input.getInput();
	input.addListeners();
	var inputEventContext = engine.Events.getEventContext();

	// Data object
	var DATA = {
		layerController: layerController,
		logicController: logicController,
		screenArea: layerController.area,
		input: input,
		inputEventContext: inputEventContext,
		mainLoop: undefined,
		engine: engine,
	};

	// Start main
	main(DATA);
}

function main(DATA) {

	// Create all the content
	createContent(DATA);

	//console.log(DATA.inputEventContext);

	// Make the loop
	mainLoop = DATA.engine.Util.loop({func:function(frame) {
		var keyInput = DATA.input.getInput()["input"];
		DATA.inputEventContext.updateEvent(keyInput); 	// Get latest input
		DATA.logicController.update(frame); 			// Update the logic
		DATA.layerController.update(); 					// Update the graphics
	}, fps:60, useRAF:true, modifier:1});

	// Kick off the loop
	mainLoop.start();

	// Put a handle on the loop
	DATA.mainLoop = mainLoop;
}
