function createContent(DATA) {
	var engine = DATA.engine;

	var backgroundLayer = DATA.layerContainer.get("background");
	var drawLayer = DATA.layerContainer.get("draw");
	var input = DATA.input;
	var eventGroup = DATA.eventGroup;


	var debugRect = engine.Graphic.rectangle({color:"grey"});
	var redButton = engine.Graphic.rectangle({color:"red"});
	var blueButton = engine.Graphic.rectangle({color:"blue"});
	var wrenchIcon = engine.Graphic.lines({
		lineWidth: 2,
		color:"white",
		pos: [70, 70],
		shape: [
			[17, 20, 10, 0, 0, 70, -8, 0, 0, -70], 				// I. Handle
			[30, 10, 0, 10, -30, 0, 0, -5, 15, 0, 5, -5, 10, 0], // II. Base
			[5, 0, 0, 15, 5, 0, 0, -15], 						// III. Arm Pt 1
			[5, 20, 0, 25, 5, 0, 0, -25], 						// III Arm Pt 2
			[5, 20, 0, 4, 5, 0, 0, 4, -5, 0, 0, 4, 5, 0], 		// III Arm Pt 2 screw marks
			[0, 0, 0, -10, 25, 0, 5, 5, -10, 0, -5, 5, -15, 0] 	// IV. Arm Head
		]
	});
	// wrenchIcon.scale(.3);
	// wrenchIcon.area = engine.Creation.sizeOfShape(wrenchIcon.shape);

	function addButtonEvents(widget, trigger, eat, pressed, released) {
		widget.events
		.add(engine.Event.event({trigger: trigger, eatOnSuccess: eat}).add(pressed.bind(widget)))
		.add(engine.Event.lateEvent({trigger: trigger, eatOnSuccess: eat}).add(released.bind(widget)));
		return widget;
	}

	function addEvent(widget, event) {
		widget.events.add(event);
		return widget;
	}

	drawLayer
	.add(debugRect)
	.add(redButton)
	.add(blueButton);

	var mainContainer = engine.GUI.container({area: DATA.screenArea});
	mainContainer
	.add(
		engine.GUI.containerAbs({
			localPos: [-10, 10],
			localArea: [200, 40],
			localPosRatio: false,
			localAreaRatio: false
		})
		.add(engine.GUI.widgetFit({pad:[1, 1], graphic: debugRect}))
		.add(engine.GUI.containerRow()
			.add(
				addButtonEvents(
					engine.GUI.widgetFit({ pad:[.9, .95], graphic: redButton }),
					1,
					true,
					function() {
						this.graphic.color = "#990000";
						console.log("Pressed Red!");
					},
					function() {
						this.graphic.color = "red";
						if (this.within(input.getMouse())) console.log("Released Red.");
					}
				)
			)
			.add(
				addButtonEvents(
					engine.GUI.widgetFit({ pad:[.9, .95], graphic: blueButton }),
					1,
					true,
					function() {
						this.graphic.color = "#000080";
						console.log("Pressed Blue!");
					},
					function() {
						this.graphic.color = "blue";
						if (this.within(input.getMouse())) console.log("Released Blue.");
					}
				)
			)
		)
	)
	.arrange();

	eventGroup
	// Required to activate the GUI event path
	.add(engine.Event.event({ eatOnSuccess: false, trigger: 1 })
		.add(function() {
			console.log("Clicked items: ", mainContainer.within(input.getMouse()));
		})
	)
	.add(mainContainer.events);

}
