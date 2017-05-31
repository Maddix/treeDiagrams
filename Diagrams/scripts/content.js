function createContent(DATA) {
	var engine = DATA.engine;

	var backgroundLayer = DATA.layerController.get("background");
	var drawLayer = DATA.layerController.get("draw");
	var input = DATA.input;
	var eventGroup = DATA.eventGroup;

	var row = engine.GUI.containerRow({area:DATA.screenArea});
	var container = engine.GUI.container();
	var rect = engine.Graphic.rectangle({color: "orange"}),
		rect2 = engine.Graphic.rectangle({color: "purple"}),
		rect3 = engine.Graphic.rectangle({color: "red"}),
		freeRect = engine.Graphic.rectangle({pos: [700, 100], color: "white", alpha:.6}),
		textRect = engine.Graphic.rectangle({color: "cyan"}),
		text = engine.Graphic.text({
			text:"Hello World!",
			align:"start",
			baseline: "middle",
			color: "black"
		}, 20);

	drawLayer.add("rect", rect);
	drawLayer.add("rect2", rect2);
	drawLayer.add("rect3", rect3);
	drawLayer.add("textRect", textRect);
	drawLayer.add("text", text);
	drawLayer.add("freeRect", freeRect);

	// Should be handled when added to the layer
	text.setup(drawLayer.context);
	textRect.setup(drawLayer.context);
	rect.setup(drawLayer.context);
	rect2.setup(drawLayer.context);
	rect3.setup(drawLayer.context);
	freeRect.setup(drawLayer.context);

	text.getTextWidth();

	container
	.add(engine.GUI.widgetFit({ pad: [.55, .05], ratio: true, graphic: textRect }))
	.add(engine.GUI.widgetFit({ pad: [.5, 0], ratio: true, graphic: text }));

	row
	.add(engine.GUI.widget({ graphic: rect }))
	.add(container)
	.add(engine.GUI.widgetFit({ pad: [.9, .9], ratio: true, graphic: rect2 }))
	.add(engine.GUI.widget({ graphic: rect3 }))
	.arrange();

	eventGroup
	.add(engine.Event.continuousEvent({ eatOnSuccess: true, trigger: 87 })
		.add(function() { freeRect.pos = input.getMouse(); })
	);

}
