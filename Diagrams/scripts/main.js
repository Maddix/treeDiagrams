function main(DATA) {
	var engine = Engine();

	// Create the layerController (AKA - Graphic controller)
	var layerController = engine.Graphic.getLayerController({
		area: [1024, 640],
		container: document.getElementById("container")
	});

	// Create all the layers we are going to use, order matters
	layerController.add("background", engine.Graphic.getLayer());
	layerController.add("draw", engine.Graphic.getLayer());

	// Create input and an eventContext to handle it.
	var input = engine.Input.getInput();
	input.addListeners();
	var inputEventContext = null; //engine.Events.getEventContext();

	// Data object
	var DATA = {
		layerController: layerController,
		screenArea: layerController.area,
		input: input,
		inputEventContext: inputEventContext,
		mainLoop: null,
		engine: engine
	};

	// Create all the content
	createContent(DATA); // content.js

	// Make the loop
	DATA.mainLoop = DATA.engine.Util.loop({func:function(frame) {
		var keyInput = DATA.input.getInput();
		//console.log("Object: ", keyInput);
	}, fps:1, useRAF:true});

	// Kick off the loop
	DATA.mainLoop.start();
}
