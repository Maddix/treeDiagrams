function createContent(DATA) {
	var engine = DATA.engine;

	var backgroundLayer = DATA.layerContainer.get("background");
	var drawLayer = DATA.layerContainer.get("draw");
	var input = DATA.input;
	var eventGroup = DATA.eventGroup;

	var row = engine.GUI.containerRow({area:[850, DATA.screenArea[1]]});
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
			color: "black",
			font: "Hack"
		}, 17);

	drawLayer
	.add(rect)
	.add(rect2)
	.add(rect3)
	.add(textRect)
	.add(text)
	.add(freeRect);

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
	.add(engine.Event.continuousEvent({ eatOnSuccess: true, trigger: 1 })
		.add(function() {
			console.log(row.within(input.getMouse()));
		})//freeRect.pos = input.getMouse(); })
	);

}
