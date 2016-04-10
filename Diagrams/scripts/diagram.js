function Diagram(frage) {
	var localContainer = {
		frage: frage
	};

	localContainer.infoSquare = function(textConfig, rectangleConfig, config) {
		var local = {
			text: this.frage.Graphics.text(textConfig),
			rectangle: this.frage.Graphics.rectangle(rectangleConfig)
		};
		this.frage.Base.extend(config, local);

		local.updateGraphics = function() {
			this.rectangle.updateGraphics();
			this.text.updateGraphics();
		};

		return local;
	};

	localContainer.node = function(config) {
		var local = {
			diagram: undefined // This will be some kind of custom object.
		};

		this.frage.Base.extend(this.frage.WindowLib.widget(), local);
		this.frage.Base.extend(config, local);

		//local.updateLogic = function(frame) {
		//};

		local.updateGraphics = function() {
			this.diagram.updateGraphics();
		};

		return local;
	};

	localContainer.group = function() {
		var local = {

		};

		return local;
	};

	return localContainer;
}
