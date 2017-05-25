// Maddix - Started 2/1/2014 (MM/DD/YYYY)

 /*ldp
	Wraps everything into a nice namespace.
 */
function Engine() {
	'use strict'; // Try putting 'var private = {};' somewhere. It should throw an error.

	var engine = {};
	engine.author = "Maddix";
	engine.Math = GameMath()
	engine.Creation = Creation();
	engine.Util = Util(engine.Creation);
	engine.Graphic = Graphic(engine.Creation);
	engine.GUI = GUI(engine);
	engine.Event = Event(engine.Creation);
	engine.Input = Input(engine.Creation);
	//engine.Particles = Particles();
	return engine;
};
