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

	var action = engine.Events.actionEvent({
		triggers: [87]
	});
	action.add("log", function(eventObject) {
		console.log(eventObject);
	});

	data.inputEventContext.add("wasd trigger", action);

}
