

/**
* Ellipse Primitive
* <br><br>
* Create a ellipse primitive. Define a params object including a reference
* to the current state. You may also add style parameters from the Polygon.
* <br><br>
* You may draw regular polygons by reducing the segments. For example,
* to draw a hexagon:
* <br><br>
* new Kiwi.Plugins.Primitives.Ellipse( {<br>
*	drawStroke: false,<br>
*	radius: 32,<br>
*	state: MyGame.state,<br>
*	segments: 6<br>
* } );
* @class Ellipse
* @constructor
* @extends Kiwi.Plugins.Primitives.Polygon
* @namespace Kiwi.Plugins.Primitives
* @param params {object} Parameter object
* @param params.state {Kiwi.State} Current state
* @param [params.centerOnTransform=false] {boolean} If true, ellipse is centered
*	on transform; if false, ellipse has top left corner on transform
* @param [params.height=8] {number} Height of the ellipse
* @param [params.radius] {number} Radius of a circle; overide width and height
* @param [params.radiusPointer=false] {boolean} Whether to draw the radius,
*	useful for debugging rotation on circles.
* @param [params.segments=32] {number} Number of radial segments; detail.
* @param [params.width=8] {number} Width of the ellipse
* @since 0.4.0
*/
Kiwi.Plugins.Primitives.Ellipse = function( params ) {
	var angle, i,
		defaultDimension = 8,
		offsetX = 0,
		offsetY = 0;

	// Create elliptical geometry data
	if ( typeof params.segments === "undefined" ) {
		params.segments = 32;
	}
	if ( typeof params.radius !== "undefined" ) {
		params.width = params.radius * 2;
		params.height = params.radius * 2;
	}
	if ( typeof params.width !== "number" ) {
		params.width = defaultDimension;
	}
	if ( typeof params.height !== "number" ) {
		params.height = defaultDimension;
	}
	if ( !params.centerOnTransform ) {
		offsetX = params.width * 0.5;
		offsetY = params.height * 0.5;
	}
	params.indices = [];
	params.vertices = [];
	params.strokeIndices = [];
	for ( i = 0; i < params.segments; i++ ) {

		// Define indices, looping from the middle
		params.indices.push( i );
		params.indices.push( params.segments );
		params.indices.push( ( i + 1 ) % params.segments );

		// Define vertices
		angle = Math.PI * 2 * i / params.segments;
		params.vertices.push( [
			params.width * 0.5 * Math.cos( angle ) + offsetX,
			params.height * 0.5 * Math.sin( angle ) + offsetY
		] );

		// Define stroke
		params.strokeIndices.push( i );
	}

	// Define central vertex
	params.vertices.push( [ offsetX, offsetY ] );

	// Complete stroke
	params.strokeIndices.push( 0 );

	// Add radius pointer
	if ( params.radiusPointer ) {
		params.strokeIndices.push( params.segments );
	}

	Kiwi.Plugins.Primitives.Polygon.call( this, params );
};
Kiwi.extend( Kiwi.Plugins.Primitives.Ellipse,
	Kiwi.Plugins.Primitives.Polygon );
