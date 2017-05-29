function main() {
	var engine = Engine();

	// Create the layerController (AKA - Graphic controller)
	var layerController = engine.Graphic.getLayerController({
		area: [1024, 640],
		container: document.getElementById("container")
	});

	// Create all the layers we are going to use, order matters
	layerController.add("background", engine.Graphic.getLayer());
	layerController.add("draw", engine.Graphic.getLayer());

	// eventGroup
	var eventGroup = engine.Event.eventGroup();

	// Create input and an eventContext to handle it.
	var input = engine.Input.getInput();
	input.addListeners();

	// Data object
	var DATA = {
		layerController: layerController,
		screenArea: layerController.area,
		input: input,
		eventGroup: eventGroup,
		mainLoop: null,
		engine: engine
	};

	// Create all the content
	createContent(DATA); // content.js

	// Make the loop
	DATA.mainLoop = DATA.engine.Util.loop({func:function(frame) {
		var keyInput = DATA.input.getInput();
		//console.log("Object: ", keyInput);
		eventGroup.update(keyInput);
		layerController.update();
	}, fps:30, useRAF:true});

	// Kick off the loop
	DATA.mainLoop.start();
}
