function createContent(DATA) {
	var engine = DATA.engine;

	var backgroundLayer = DATA.layerContainer.get("background");
	var drawLayer = DATA.layerContainer.get("draw");
	var input = DATA.input;
	var eventGroup = DATA.eventGroup;
	var keyMap = engine.Input.textKeyMap;
	var keyMapUpper = engine.Input.textKeyMapUpper;


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
	var textRect = engine.Graphic.rectangle({color: "gray", alpha:.6});
	var text = engine.Graphic.text({color:"orange", text: "Text!", baseline:"hanging"});

	function addButtonEvents(widget, trigger, eat, pressed, released) {
		widget.events
		.add(engine.Event.event({trigger: trigger, eatOnSuccess: eat}).add(pressed.bind(widget)))
		.add(engine.Event.lateEvent({trigger: trigger, eatOnSuccess: eat}).add(released.bind(widget)));
		return widget;
	}

	function textFieldEvents(config) {
		var object = engine.Creation.compose(
			{
				cursor:0,
				cursorKey:"|",
				text:"",
				renderText:"",
				last:"",
				shift:false,
				events: engine.Event.eventGroup()
			},
			config
		);

		object.events
		.add(engine.Event.event({trigger: 16, eatOnSuccess: true}) //Shift on
			.add(function(data) { this.shift = true; }.bind(object))
		)
		.add(engine.Event.lateEvent({trigger: 16}) // Shift off
			.add(function(data) { this.shift = false; }.bind(object))
		)
		.add(engine.Event.event({trigger:37, eatOnSuccess: true})
			.add(function(data) { // Left arrow
				if (this.cursor > 0) this.cursor--;
			}.bind(object))
		)
		.add(engine.Event.event({trigger:39, eatOnSuccess: true})
			.add(function(data) { // Right arrow
				if (this.cursor < this.text.length) this.cursor++;
			}.bind(object))
		)
		.add(engine.Event.event({trigger:8, eatOnSuccess: true})
			.add(function(data) { // Backspace arrow
				if (this.cursor > 0) {
					this.text = this.text.splice(this.cursor-1, 1, "");
					this.cursor--;
				}

			}.bind(object))
		)
		.add(engine.Event.event({trigger:46, eatOnSuccess: true})
			.add(function(data) { // Delete arrow
				if (this.cursor < this.text.length) this.text = this.text.splice(this.cursor, 1, "");
			}.bind(object))
		)
		.add(engine.Event.continuousDiffEvent()
			.add(function(data) {
				var shift = this.shift,
					newString = data[1].map(function(num) {
					return shift ? keyMapUpper[num] : keyMap[num];
				}).join("");
				this.text = this.text.splice(this.cursor, 0, newString);
				this.cursor += newString.length;
			}.bind(object))
			.add(function() {
				this.renderText = [
					this.text.slice(0, this.cursor),
					this.cursorKey,
					this.text.slice(this.cursor, this.text.length)
				].join("");
			}.bind(object))
		);
		return object;
	}

	function textInputEvents(widget) {
		var field = textFieldEvents();
		widget.textField = field;
		// Hack btw - renderText will update itself, Need a way to pull it.
		field.events.events[6].add(function(data) { widget.graphic.text = field.renderText; });
		widget.events
		.add(field.events);
		return widget;
	}

	function addEvent(widget, event) {
		widget.events.add(event);
		return widget;
	}

	drawLayer
	.add(debugRect)
	.add(redButton)
	.add(blueButton)
	.add(textRect)
	.add(text);

	var settingsWindow = engine.GUI.container({area: [300, 200]});

	settingsWindow
	.add(
		engine.GUI.widgetAbs({
			localPos: [.5, .5],
			localArea: [.7, .3]
		})
	);


	var mainContainer = engine.GUI.container({area: DATA.screenArea});
	mainContainer
	.add(
		engine.GUI.containerAbs({
			localPosRatio: false,
			localPos: [-10, 10],
			localAreaRatio: false,
			localArea: [200, 40]
		})
		.add(engine.GUI.widgetFit({pad:[1, 1], graphic: debugRect}))
		.add(engine.GUI.containerRow()
			.add(
				addButtonEvents(
					engine.GUI.widgetFit({ pad:[.9, .95], graphic: redButton }),
					1, // Changing this to something different from event groups first event trigger does odd stuff. :/
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
	.add(
		engine.GUI.containerAbs({
			localPos: [.5, .5],
			localAreaRatio: false,
			localArea: [300, 20]
		})
		.add(engine.GUI.widgetFit({graphic: textRect}))
		.add(textInputEvents(engine.GUI.widgetFit({pad:[.9, .5], graphic:text})))
	)
	.arrange();

	eventGroup
	// Required to activate the GUI event path
	.add(engine.Event.event({ eatOnSuccess: false, trigger: 1 })
		.add(function() {
			console.log("Clicked items: ", mainContainer.within(input.getMouse()));
		})
	)
	.add(mainContainer.events)
	//.add(engine.Event.continuousDiffEvent()
	//	.add(function(data) { console.log(data[0], '\n', data[1]); })
	//);
}
