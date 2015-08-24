
/**
* Line Primitive
* <br><br>
* Create a line primitive. Define a params object including a reference
* to the current state. You may also add style parameters from the Polygon.
* For example:
* <br><br>
* new Kiwi.Plugins.Primitives.Line( {<br>
*	points: [ [ 0, 0 ], [ 100, 100 ], [ 200, 0 ] ],<br>
*	state: MyGame.state,<br>
*	strokeColor: [ 1, 0.1, 1 ],<br>
*	strokeWidth: 4<br>
* } );
* @class Line
* @constructor
* @extends Kiwi.Plugins.Primitives.Polygon
* @namespace Kiwi.Plugins.Primitives
* @param params {object} Parameter object
* @param params.state {Kiwi.State} Current state
* @param [params.points] {array} Array of x,y points to connect with lines
* @since 0.4.0
*/
Kiwi.Plugins.Primitives.Line = function( params ) {
	var i;

	params.vertices = [];
	params.strokeIndices = [];
	params.drawFill = false;
	params.drawStroke = true;
	if ( params.points ) {
		for ( i = 0; i < params.points.length; i++ ) {
			params.vertices.push( params.points[ i ] );
			params.strokeIndices.push( i );
		}
	}

	Kiwi.Plugins.Primitives.Polygon.call( this, params );
};
Kiwi.extend( Kiwi.Plugins.Primitives.Line,
	Kiwi.Plugins.Primitives.Polygon );

