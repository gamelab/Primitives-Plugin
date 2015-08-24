
/**
* Rectangle Primitive
* <br><br>
* Create a rectangular primitive. Define a params object including a reference
* to the current state. You may also add style parameters from the Polygon.
* For example:
* <br><br>
* new Kiwi.Plugins.Primitives.Rectangle( {<br>
*	state: MyGame.state,<br>
*	color: [ 0.9, 0.3, 0.7 ],<br>
*	strokeWidth: 4,<br>
*	width: 32,<br>
*	height: 16<br>
* } );
* @class Rectangle
* @constructor
* @extends Kiwi.Plugins.Primitives.Polygon
* @namespace Kiwi.Plugins.Primitives
* @param params {object} Parameter object
* @param params.state {Kiwi.State} Current state
* @param [params.centerOnTransform=true] {boolean} If true, rectangle is centered
*	on transform; if false, rectangle has top left corner on transform
* @param [params.height=8] {number} Height of the rectangle
* @param [params.width=8] {number} Width of the rectangle
* @since 0.4.0
*/
Kiwi.Plugins.Primitives.Rectangle = function( params ) {
	var defaultDimension = 8;

	// Create rectangle geometry data
	params.indices = [ 0, 1, 2, 3 ];
	params.strokeIndices = [ 0, 1, 3, 2, 0 ];
	if ( typeof params.width === "undefined" ) {
		params.width = defaultDimension;
	}
	if ( typeof params.height === "undefined" ) {
		params.height = defaultDimension;
	}

	// Position rectangle relative to transform
	if ( params.centerOnTransform ) {
		params.vertices = [
			[ -params.width * 0.5, -params.height * 0.5 ],
			[ params.width * 0.5, -params.height * 0.5 ],
			[ -params.width * 0.5, params.height * 0.5 ],
			[ params.width * 0.5, params.height * 0.5 ]
		];
	} else {
		params.vertices = [
			[ 0, 0 ],
			[ params.width, 0 ],
			[ 0, params.height ],
			[ params.width, params.height ]
		];
	}

	Kiwi.Plugins.Primitives.Polygon.call ( this, params );
};
Kiwi.extend( Kiwi.Plugins.Primitives.Rectangle,
	Kiwi.Plugins.Primitives.Polygon );

