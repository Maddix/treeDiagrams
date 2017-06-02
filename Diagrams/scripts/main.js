function main() {
	var engine = Engine();

	// Create the layerContainer (AKA - Graphic controller)
	var layerContainer = engine.Graphic.layerContainer({
		area: [1024, 640],
		container: document.getElementById("container")
	});

	// Create all the layers we are going to use, order matters
	layerContainer.add(engine.Graphic.layer(), "background");
	layerContainer.add(engine.Graphic.layer(), "draw");

	// eventGroup
	var eventGroup = engine.Event.eventGroup();

	// Create input and an eventContext to handle it.
	var input = engine.Input.getInput();
	input.addListeners();

	// Data object
	var DATA = {
		layerContainer: layerContainer,
		screenArea: layerContainer.area,
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
		layerContainer.update();
	}, fps:80, useRAF:true});

	// Kick off the loop
	DATA.mainLoop.start();
}
