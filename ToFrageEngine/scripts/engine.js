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
	engine.Util = Util();
	engine.Graphics = Graphics();
	engine.WindowLib = WindowLib();
	engine.Events = Events();
	engine.Input = Input(engine.Creation);
	engine.Particles = Particles();
	return engine;
};
