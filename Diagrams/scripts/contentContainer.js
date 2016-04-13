/*  ---------------------------------------------------------------------  *
 *	Note we are NOT connecting the window to a logic or layer controller.  *
 *  ---------------------------------------------------------------------  */

function createContainer(data) {
	var frage = data.frage;
	var inputEventContext = data.inputEventContext;

	var mouseStateEvent = inputEventContext.get("mouseMove");


	/* 	===========================
		Create the widget container
		===========================  */

	var container = frage.WindowLib.container({
		pos: [100, 100],
		ratio: [200, 200]
	});

	// Create a background widget
	var backgroundWidget = frage.WindowLib.square({
		color: "gray",
		alpha: .7,
		borderColor: "white",
		borderWidth: 2,
		borderAlpha: .7,
		arrangePos: [0, 0],
		arrangeRatio: [1, 1]
	});
	container.add("backgroundWidget", backgroundWidget);


	/* 	=================
		Create the events
		=================  */

	// Overall events
	var containerEventContext = frage.Events.getEventContext();

	// -------------
	// Resize events
	// -------------

	var resizeEventGroup = frage.Events.getEventContext();

	resizeEventGroup.add("clickResize", frage.Events.actionEvent({
		triggers: [1, "mouseMove"],
		removeOnSuccess: [1]
	}));

	resizeEventGroup.add("releaseResize", frage.Events.actionEvent({
		triggers: [1],
		removeOnSuccess: [1],
		includeIfTriggered: ["mouseMove"],
		triggered: true,
		triggerOn: false
	}));

	// I feel like this is a hacky way of doing it. They should just layer automatically depending on what you have going on. :/
	resizeEventGroup.get("clickResize").add("containerResize", function(data) {
		if (container.onClickResize(data)) containerEventContext.get("dragEventGroup").suspend();
	});
	resizeEventGroup.get("releaseResize").add("containerResize", function(data) {
		if (container.onReleaseResize(data)) containerEventContext.get("dragEventGroup").resume();
	});
	// Add to the general mouseEvent
	mouseStateEvent.add("containerResize", function(data) { container.onMouseMoveResize(data); });

	// -----------
	// Drag events
	// -----------

	var dragEventGroup = frage.Events.getEventContext();

	dragEventGroup.add("clickDrag", frage.Events.actionEvent({
		triggers: [1, "mouseMove"],
		removeOnSuccess: [1]
	}));

	dragEventGroup.add("releaseDrag", frage.Events.actionEvent({
		triggers: [1],
		removeOnSuccess: [1],
		includeIfTriggered: ["mouseMove", "d"],
		triggered: true,
		triggerOn: false
	}));

	dragEventGroup.get("clickDrag").add("containerDrag", function(data) {
		container.onClickDrag(data);
	});
	dragEventGroup.get("releaseDrag").add("containerDrag", function(data) {
		container.onReleaseDrag(data);
	});
	// Add to the general mouseEvent
	mouseStateEvent.add("containerDrag", function(data) { container.onMouseMoveDrag(data); });

	// ------------------
	// Connect the events
	// ------------------

	containerEventContext.add("resizeEventGroup", resizeEventGroup);
	containerEventContext.add("dragEventGroup", dragEventGroup);

	// Add the container event group to the main input event context
	inputEventContext.add("containerEventContext", containerEventContext);

	// --------------------
	// Return the container
	// --------------------

	return container;
};
