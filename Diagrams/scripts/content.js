function createContent(DATA) {
	var engine = DATA.engine;

	var backgroundLayer = DATA.layerContainer.get("background");
	var drawLayer = DATA.layerContainer.get("draw");
	var input = DATA.input;
	var eventGroup = DATA.eventGroup;

	console.log(DATA.screenArea);
	var topBar = engine.GUI.container({area:[DATA.screenArea[0], 80]});

	var debugRect = engine.Graphic.rectangle({color:"grey"});
	var wrenchIcon = engine.Graphic.lines({
		lineWidth: 2,
		color:"white",
		pos: [70, 70],
		//rotation: Math.PI/5
	});

	var wrenchWidget = engine.GUI.widgetAbs({
		localPos: [.9, .5],
		localArea:[20, 50],
		localAreaRatio: false,
		graphic: wrenchIcon
	});
	wrenchWidget.events
	.add(engine.Event.event({trigger: 1})
		.add(function() {
			console.log("Clicked!");
			wrenchIcon.color = "orange";
	}))
	.add(engine.Event.lateEvent({trigger: 1})
		.add(function() {
			wrenchIcon.color = "white";
			if (wrenchWidget.within(input.getMouse())) console.log("Released.");
	}));

	drawLayer
	.add(debugRect)
	.add(wrenchIcon);

	topBar
	.add(engine.GUI.widgetFit({pad:[1, 1], graphic: debugRect}))
	.add(wrenchWidget)
	.arrange();

	eventGroup
	.add(engine.Event.event({ eatOnSuccess: false, trigger: 1 })
		.add(function() {
			console.log(topBar.within(input.getMouse()));
		})
	)
	.add(topBar.events);

	wrenchIcon.shape = [
		[ // I. Handle
			17, 20, 10, 0, 0, 70, -8, 0, 0, -70],
		[ // II. Base
			30, 10, 0, 10, -30, 0, 0, -5, 15, 0, 5, -5, 10, 0],
		[ // III. Arm Pt 1
			5, 0, 0, 15, 5, 0, 0, -15],
		[ // III Arm Pt 2
			5, 20, 0, 25, 5, 0, 0, -25],
		[ // III Arm Pt 2 screw marks
			5, 20, 0, 4, 5, 0, 0, 4, -5, 0, 0, 4, 5, 0],
		[ // IV. Arm Head
			0, 0, 0, -10, 25, 0, 5, 5, -10, 0, -5, 5, -15, 0]
	];
	wrenchIcon.scale(.5);
	console.log(wrenchIcon);
}
