function createContent(DATA) {
	var engine = DATA.engine;

	var backgroundLayer = DATA.layerController.get("background");
	var drawLayer = DATA.layerController.get("draw");

	row = engine.GUI.containerRow({area:DATA.screenArea});
	var rect = engine.Graphic.rectangle({color: "orange"}),
		rect2 = engine.Graphic.rectangle({color: "purple"}),
		rect3 = engine.Graphic.rectangle({color: "red"});


	drawLayer.add("rect", rect);
	drawLayer.add("rect2", rect2);
	drawLayer.add("rect3", rect3);


	rect.setup(drawLayer.context);
	rect2.setup(drawLayer.context);
	rect3.setup(drawLayer.context);

	var widgetRect = engine.GUI.widget({
		graphic: rect
	});


	row
	.add(engine.GUI.widget({
		graphic: rect
	}))
	.add(engine.GUI.widgetFit({
		pad: [20, 50],
		ratio: false,
		graphic: rect2
	}))
	.add(engine.GUI.widget({
		graphic: rect3
	}))

	row.arrange();


	console.log("rect: ", rect);
}
