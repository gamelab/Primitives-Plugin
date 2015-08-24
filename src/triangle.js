

/**
* Triangle Primitive
* <br><br>
* Create a triangle primitive. Define a params object including a reference
* to the current state. You may also add style parameters from the Polygon.
* For example:
* <br><br>
* new Kiwi.Plugins.Primitives.Triangle( {<br>
*	points: [ [ 0, 0 ], [ 100, 100 ], [ 200, 0 ] ],<br>
*	state: MyGame.state,<br>
*	x: 10,<br>
*	y: 10,<br>
*	scale: 2<br>
* } );
* <br><br>
* If you do not specify points in the param object, the Triangle will default to
* [ [ 0, 0 ], [ 0, 8 ], [ 8, 0 ] ]
* @class Triangle
* @constructor
* @extends Kiwi.Plugins.Primitives.Polygon
* @namespace Kiwi.Plugins.Primitives
* @param params {object} Parameter object
* @param params.state {Kiwi.State} Current state
* @param [params.points] {array} Array of x,y pairs to form triangle's corners.
* @since 0.4.0
*/
Kiwi.Plugins.Primitives.Triangle = function( params ) {
	var i,
		defaultDimension = 8;

	params.indices = [ 0, 1, 2 ];
	params.strokeIndices = [ 0, 1, 2, 0 ];
	params.vertices = [];
	
	// Create triangle geometry data
	if ( params.points ) {
		for ( i = 0; i < 3; i++ ) {
			if ( params.points[ i ] ) {
				params.vertices.push( params.points[ i ] );
			} else {
				params.vertices.push( [ 0, 0 ] );
			}
		}
	} else {
		params.vertices.push(
			[ 0, 0 ],
			[ 0, defaultDimension ],
			[ defaultDimension, 0 ]
		);
	}
	
	Kiwi.Plugins.Primitives.Polygon.call( this, params );
};
Kiwi.extend( Kiwi.Plugins.Primitives.Triangle,
	Kiwi.Plugins.Primitives.Polygon );

