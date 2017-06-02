function createContent(DATA) {
	var engine = DATA.engine;

	var backgroundLayer = DATA.layerContainer.get("background");
	var drawLayer = DATA.layerContainer.get("draw");
	var input = DATA.input;
	var eventGroup = DATA.eventGroup;



	var row = engine.GUI.containerRow({area:[850, DATA.screenArea[1]]});
	var row2 = engine.GUI.container();
	var container = engine.GUI.container();
	var rect = engine.Graphic.rectangle({color: "orange"}),
		rect2 = engine.Graphic.rectangle({color: "purple"}),
		rect3 = engine.Graphic.rectangle({color: "red"}),
		freeRect = engine.Graphic.rectangle({pos: [700, 100], color: "white", alpha:1}),
		textRect = engine.Graphic.rectangle({color: "gray"}),
		text = engine.Graphic.text({
			text:"Hello World!",
			align:"start",
			baseline: "middle",
			color: "white",
			font: "Hack"
		}, 17);

	drawLayer
	.add(textRect)
	.add(text)
	.add(rect)
	.add(rect2)
	.add(rect3)
	.add(freeRect);

	text.getTextWidth();

	var row2RectWidget = engine.GUI.widgetAbs({
		localPos: [40, 280],
		localArea: [.7, .1],
		localPosRatio: false,
		localAreaRatio: true,
		graphic: textRect
	});

	//container
	row2
	.add(row2RectWidget)
	.add(engine.GUI.widgetFit({ pad: [.5, 0], ratio: true, graphic: text }));

	var rect3Widget = engine.GUI.widget({ graphic: rect3 });
	rect3Widget.events.add(engine.Event.event({trigger: 3})
		.add(function(data) { console.log("3 Fired! Data: ", data); }));

	console.log("Rect3Widget: ", rect3Widget);

	row
	.add(engine.GUI.widgetFit({ pad: [.9, .9], ratio: true, graphic: rect2 }))
	.add(engine.GUI.widget({ graphic: rect }))
	.add(row2)
	.add(rect3Widget)
	.arrange();

	row2RectWidget.events.add(engine.Event.continuousEvent({trigger:1})
	.add(function(data) {
		var mouse = data[data.length-1].mouse;
		console.log("Pressed! Data: ", mouse);
		row2RectWidget.localPos = [
			mouse[0] - row2.pos[0],
			mouse[1] - row2.pos[1]
		].map(function(x) { return x < 0 ? 0 : x; });

		row.arrange();
	}));

	eventGroup
	.add(engine.Event.event({ eatOnSuccess: false, trigger: 1 })
		.add(function() {
			console.log(row.within(input.getMouse()));
		})//freeRect.pos = input.getMouse(); })
	)
	.add(row.events);

}
