/**
* Primitive Gameobjects plugin, providing geometric objects to the designer.
*
* @module Kiwi
* @submodule Plugins
* @namespace Kiwi.Plugins
* @class Primitives
*/
Kiwi.Plugins.Primitives = {

	/**
	* The name of this plugin.
	* @property name
	* @type String
	* @default "Primitives"
	* @public
	*/
	name:"Primitives",

	/**
	* The version of this plugin.
	* @property version
	* @type String
	* @public
	*/
	version:"0.3.0"

};

/**
* Registers this plugin with the Global Kiwi Plugins Manager if it is avaiable.
* 
*/
Kiwi.PluginManager.register(Kiwi.Plugins.Primitives);

/**
* This create method is executed when Kiwi Game that has been told to
* use this plugin reaches the boot stage of the game loop.
* @method create
* @param game{Kiwi.Game} The game that is current in the boot stage.
* @private 
*/
Kiwi.Plugins.Primitives.create = function(game) {
	console.log( "Hello " + game.name );
};



// TODO
// * Implement Rectangle, Ellipse, and Triangle versions.



/**
* Polygon Gameobject
*
* @class Polygon
* @constructor
* @namespace Kiwi.Plugins.Primitives
* @extends Kiwi.Entity
* @param params {Object} The parameter object. Only state is non-optional.
* @param params.color {array} RGB normalized color.
* @param params.state {Kiwi.State} The context state.
* @param params.indices {array} Array of vertices for triangle strips.
* @param params.vertices {array} Array of vertex coordinate 
*	array pairs ([ [ x1, y1 ], [x2, y2 ] ] etc).
* @param params.x {number} The x-coordinate.
* @param params.y {number} The y-coordinate.
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.Polygon = function( params ) {

	var state = params.state;

	this._initProperties();

	// Super
	Kiwi.Entity.call( this, state, 0, 0 );

	this.parseParams( params );

	// Create WebGL renderer
	if (this.game.renderOption === Kiwi.RENDERER_WEBGL) {
		this.glRenderer =
			this.game.renderer.requestSharedRenderer( "PrimitiveRenderer" );
		this.atlas = this.glRenderer.getAtlas();
	}

	this.rebuildBounds();
};
Kiwi.extend( Kiwi.Plugins.Primitives.Polygon, Kiwi.Entity );

/**
* Index of pointers to vertex pairs. The sequence of points
* which constructs the poly.
* @property indices
* @type {array}
* @public
* @since 0.3.0
*/
Object.defineProperty( Kiwi.Plugins.Primitives.Polygon.prototype, "indices", {
	get: function() {
		return this._indices;
	},
	set: function( value ) {
		var i;
		this._indices = [];

		if ( value.length > 2 ) {

			// Double up the first index to prevent strip connexion
			if ( value.length === 3 ) {
				this._indices.push( value[ 0 ] );
			}

			for ( i = 0; i < value.length; i++ ) {
				this._indices.push( value[ i ] );
			}
		}
	}
} );

/**
* Index of vertex pairs.
* @property vertices
* @type {array}
* @public
* @since 0.3.0
*/
Object.defineProperty( Kiwi.Plugins.Primitives.Polygon.prototype, "vertices", {
	get: function() {
		return this._vertices;
	},
	set: function( value ) {
		var i;
		this._vertices = [];
		for ( i = 0; i < value.length; i++ ) {
			this._vertices.push( [
				value[ i ][ 0 ],
				value[ i ][ 1 ]
			] );
		}
	}
} );

/**
* Index of pointers to vertex pairs. The sequence of points which
* constructs the stroke. To be distinguished from the strokePolyIndices,
* which define the actual shape of the stroke.
* @property strokeIndices
* @type {array}
* @public
* @since 0.3.0
*/
Object.defineProperty(
		Kiwi.Plugins.Primitives.Polygon.prototype, "strokeIndices", {
	get: function() {
		return this._strokeIndices;
	},
	set: function( value ) {
		var i;
		this._strokeIndices = [];

		if ( value.length > 1 ) {
			for ( i = 0; i < value.length; i++ ) {
				this._strokeIndices.push( value[ i ] );
			}
			this.createstroke( this._strokeIndices, this._vertices );
		}
	}
} );

/**
* Index of pointers to vertex pairs. The sequence of points which
* make up the stroke. To be distinguished from the strokeIndices,
* which define the construction of the stroke.
* @property strokePolyIndices
* @type {array}
* @public
* @since 0.3.0
*/
Object.defineProperty(
		Kiwi.Plugins.Primitives.Polygon.prototype, "strokePolyIndices", {
	get: function() {
		return this._strokePolyIndices;
	},
	set: function( value ) {
		var i;
		this._strokePolyIndices = [];

		if ( value.length > 2 ) {

			// Double up the first index to prevent strip connexion
			if ( value.length === 3 ) {
				this._strokePolyIndices.push( value[ 0 ] );
			}

			for ( i = 0; i < value.length; i++ ) {
				this._strokePolyIndices.push( value[ i ] );
			}
		}
	}
} );

/**
* Index of vertex pairs for stroke shape.
* @property strokePolyVertices
* @type {array}
* @public
* @since 0.3.0
*/
Object.defineProperty(
		Kiwi.Plugins.Primitives.Polygon.prototype, "strokePolyVertices", {
	get: function() {
		return this._strokePolyVertices;
	},
	set: function( value ) {
		var i;
		this._strokePolyVertices = [];
		for ( i = 0; i < value.length; i++ ) {
			this._strokePolyVertices.push( [
				value[ i ][ 0 ],
				value[ i ][ 1 ]
			] );
		}
	}
} );

/**
* Constructs a miter, a building block for strokes.
* Miters sit atop vertices and form the endpoints for two wire segments.
* @method _buildMiter
* @param line1 {Array} The first line, an array of 2 Points
* @param line2 {Array} The second line, an array of 2 Points;
* the first point on line2 is the actual position of the miter
* @return {object}
* @private
* @since 0.3.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype._buildMiter =
		function( line1, line2) {
	var angle, angleDiffHalf, dx, dy, innerDist, line1Angle, line2Angle,
		line1Length, line2Length, lineMinLength, pointA, pointB,
		indices = [],
		vertices = [],
		pointN = line2[ 0 ];

	// Compute the length of the two lines
	line1Length = line1[0].distanceTo( line1[1] );
	line2Length = line2[0].distanceTo( line2[1] );
	lineMinLength = Math.min( line1Length, line2Length );

	// Compute the angles of the two lines
	line1Angle = Math.atan2(
		line1[ 1 ].y - line1[ 0 ].y,
		line1[ 1 ].x - line1[ 0 ].x );
	line2Angle = Math.atan2(
		line2[ 1 ].y - line2[ 0 ].y,
		line2[ 1 ].x - line2[ 0 ].x );
	line1Angle = Kiwi.Utils.GameMath.normalizeAngle( line1Angle );
	line2Angle = Kiwi.Utils.GameMath.normalizeAngle( line2Angle );

	// Compute the angle between the lines, then halve it for future use
	angleDiffHalf = line2Angle - line1Angle;
	if ( angleDiffHalf > Math.PI ) {
		angleDiffHalf = Math.PI * 2 - angleDiffHalf;
	} else if ( angleDiffHalf < -Math.PI ) {
		angleDiffHalf = -Math.PI * 2 - angleDiffHalf;
	}
	angleDiffHalf *= 0.5;

	// Compute the average angle of the two lines
	if ( Math.abs( line1Angle - line2Angle ) > Math.PI ) {
		if ( line1Angle < line2Angle ) {
			line1Angle += Math.PI * 2;
		} else {
			line2Angle += Math.PI * 2;
		}
	}
	angle = Kiwi.Utils.GameMath.normalizeAngle(
		( line1Angle + line2Angle ) * 0.5 );

	// Cache some trig
	dx = Math.cos( angle );
	dy = -Math.sin( angle );

	// Compute the distance to the inner corner, where two miter points overlap
	innerDist = this.lineWidth / ( 2 * Math.cos( angleDiffHalf ) );
	if ( innerDist > lineMinLength ) {
		innerDist = lineMinLength;
	}

	// Create sharp miters
	pointA = new Kiwi.Geom.Point(
		dy * innerDist,
		dx * innerDist
	);
	pointB = new Kiwi.Geom.Point(
		dy * -innerDist,
		dx * -innerDist
	);
	pointA.x += pointN.x;
	pointA.y += pointN.y;
	pointB.x += pointN.x;
	pointB.y += pointN.y;

	indices = [ 0, 1, 0, 1 ];
	vertices = [ [ pointA.x, pointA.y ], [ pointB.x, pointB.y ] ];

	return { indices: indices, vertices: vertices };
};

/**
* Construct a stroke by tracing a connection through all vertices.
* @method _buildWire
* @param srcIndices {array} List of points to connect in order.
* @param srcVertices {array} Definition of points.
* @private
* @since 0.3.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype._buildWire =
		function( srcIndices, srcVertices ) {
	var dx, dy, end, i, j, miter, point1, point2, point3,
		inds = [],
		offset = 0,
		vertLen = srcIndices.length,
		verts = [];

	if ( vertLen > 1 ) {

		// Begin with a double-up on vertex 0
		point1 = new Kiwi.Geom.Point(
			srcVertices[ srcIndices[ 0 ] ][ 0 ],
			srcVertices[ srcIndices[ 0 ] ][ 1 ]
		);
		point2 = new Kiwi.Geom.Point(
			srcVertices[ srcIndices[ 1 ] ][ 0 ],
			srcVertices[ srcIndices[ 1 ] ][ 1 ]
		);
		miter = this._buildMiter( [ point1, point2 ], [ point1, point2 ] );
		inds = inds.concat( miter.indices );
		verts = verts.concat( miter.vertices );
		offset += miter.vertices.length;

		// Connect all additional vertices
		for ( i = 1; i < vertLen - 1; i++ ) {
			point1 = new Kiwi.Geom.Point(
				srcVertices[ srcIndices[ i - 1 ] ][ 0 ],
				srcVertices[ srcIndices[ i - 1 ] ][ 1 ]
			);
			point2 = new Kiwi.Geom.Point(
				srcVertices[ srcIndices[ i ] ][ 0 ],
				srcVertices[ srcIndices[ i ] ][ 1 ]
			);
			point3 = new Kiwi.Geom.Point(
				srcVertices[ srcIndices[ i + 1 ] ][ 0 ],
				srcVertices[ srcIndices[ i + 1 ] ][ 1 ]
			);
			miter = this._buildMiter( [ point1, point2 ], [ point2, point3 ] );
			for ( j = 0; j < miter.indices.length; j++ ) {
				miter.indices[ j ] += offset;
			}
			inds = inds.concat( miter.indices );
			verts = verts.concat( miter.vertices );
			offset += miter.vertices.length;
		}

		// Finish with a double-up on the last vertex
		// We must first construct an extension of the last line segment
		end = srcIndices.length - 1;
		dx = srcVertices[ srcIndices[ end ] ][ 0 ] -
			srcVertices[ srcIndices[ end - 1 ] ][ 0 ];
		dy = srcVertices[ srcIndices[ end ] ][ 1 ] -
			srcVertices[ srcIndices[ end - 1 ] ][ 1 ];
		point1 = new Kiwi.Geom.Point(
			srcVertices[ srcIndices[ end ] ][ 0 ],
			srcVertices[ srcIndices[ end ] ][ 1 ]
		);
		point2 = new Kiwi.Geom.Point(
			srcVertices[ srcIndices[ end ] ][ 0 ] + dx,
			srcVertices[ srcIndices[ end ] ][ 1 ] + dy
		);
		miter = this._buildMiter( [ point1, point2 ], [ point1, point2 ] );
		for ( j = 0; j < miter.indices.length; j++ ) {
			miter.indices[ j ] += offset;
		}
		inds = inds.concat( miter.indices );
		verts = verts.concat( miter.vertices );

		return { indices: inds, vertices: verts };
	}

	return null;
};

/**
* Creates a copy of this polygon.
* @method clone
* @return {Kiwi.Plugins.Primitives.Polygon}
* @public
* @since 0.3.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype.clone = function() {
	var params = {
			color: this.color,
			indices: this._indices,
			state: this.state,
			strokeColor: this.strokeColor,
			strokeIndices: this._strokeIndices,
			vertices: this._vertices,

			x: this.x,
			y: this.y,
			rotation: this.rotation,
			scaleX: this.scaleX,
			scaleY: this.scaleY,
			anchorPointX: this.anchorPointX,
			anchorPointY: this.anchorPointY
		};

	return (new Kiwi.Plugins.Primitives.Polygon( params ) );
};

/**
* Determines the min and max x and y coordinates from an array.
* @method computeMinMaxXY
* @param array {array} Array of points, defined as arrays [ x, y ]
* @return object
* @public
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype.computeMinMaxXY = function( array ) {
	var i, vert,
		vertLen = array.length,
		maxX = 0,
		maxY = 0,
		minX = 0,
		minY = 0;

	for ( i = 0; i < vertLen; i++ ) {
		vert = array[ i ];
		if ( vert[0] < minX ) {
			minX = vert[0];
		}
		if ( vert[0] > maxX ) {
			maxX = vert[0];
		}
		if ( vert[1] < minY ) {
			minY = vert[1];
		}
		if ( vert[1] > maxY ) {
			maxY = vert[1];
		}
	}

	return {
		maxX: maxX,
		maxY: maxY,
		minX: minX,
		minY: minY
	};
};

/**
* Adds another poly to this.
* <br>
* Note: This method assumes that this primitive is at the default transform
* (position 0,0, rotation 0, scale 1). The transforms of the target poly
* are applied with regard to the rest position.
* @method combine
* @param poly {Kiwi.Plugins.Primitives.Polygon} Primitive to combine.
* @param discard {boolean} Discard the combination source? Default true.
* @return {boolean}
* @public
* @since 0.3.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype.combine = function( poly, discard ) {
	if ( typeof discard === "undefined" ) {
		discard = true;
	}

	// Do not self-combine
	if ( this.poly === this ) {
		return false;
	}

	var indexOffset,
		inverseMatrix = this.transform.getConcatenatedMatrix().invert(),
		matrix = poly.transform.getConcatenatedMatrix(),
		point = new Kiwi.Geom.Point( 0, 0 ),
		polyIndicesLen = poly.indices.length,
		polyVerticesLen = poly.vertices.length,
		polyStrokeIndicesLen = poly.strokePolyIndices.length,
		polyStrokeVerticesLen = poly.strokePolyVertices.length;


	// Attach fill
	if ( polyIndicesLen > 2 ) {
		indexOffset = this._vertices.length;

		// Create degenerate attachment
		// Always apply a single degenerate link
		if ( this._indices.length > 0 ) {
			this._indices.push( this._indices[ this._indices.length - 1 ] );
		}

		// For opposite vertex order, we need two degenerate connectors.
		if ( indexOffset % 2 === 0 ) {
			this._indices.push( poly.indices[ 0 ] + indexOffset );
		}

		// Add vertices and indices
		for ( i = 0; i < polyIndicesLen; i++ ) {
			this._indices.push( poly.indices[ i ] + indexOffset );
		}
		for ( i = 0; i < polyVerticesLen; i++ ) {
			point.setTo(
				poly.vertices[ i ][ 0 ] - poly.anchorPointX,
				poly.vertices[ i ][ 1 ] - poly.anchorPointY
			);

			point = matrix.transformPoint( point );
			point = inverseMatrix.transformPoint( point );

			this._vertices.push( [
				point.x + this.anchorPointX,
				point.y + this.anchorPointY
			] );
		}
	}
	

	// Attach stroke
	if ( polyStrokeIndicesLen > 2 ) {
		indexOffset = this._strokePolyVertices.length;

		// Create degenerate attachment
		// Always apply a single degenerate link
		if ( this._strokePolyIndices.length > 0 ) {
			this._strokePolyIndices.push(
				this._strokePolyIndices[ this._strokePolyIndices.length - 1 ] );
		}

		// For opposite vertex order, we need two degenerate connectors.
		if ( indexOffset % 2 === 0 ) {
			this._strokePolyIndices.push(
				poly.strokePolyIndices[ 0 ] + indexOffset );
		}

		// Add vertices and indices
		for ( i = 0; i < polyStrokeIndicesLen; i++ ) {
			this._strokePolyIndices.push(
				poly.strokePolyIndices[ i ] + indexOffset );
		}
		for ( i = 0; i < polyStrokeVerticesLen; i++ ) {
			point.setTo(
				poly.strokePolyVertices[ i ][ 0 ] - poly.anchorPointX,
				poly.strokePolyVertices[ i ][ 1 ] - poly.anchorPointY
			);

			point = matrix.transformPoint( point );
			point = inverseMatrix.transformPoint( point );

			this._strokePolyVertices.push( [
				point.x + this.anchorPointX,
				point.y + this.anchorPointY
			] );
		}
	}

	

	// Discard source
	if ( discard ) {
		poly.destroy();
	}

	return true;
};

/**
* Put a stroke on this Polygon, following the strokeIndices vertex list.
* @method createstroke
* @public
* @return boolean
* @since 0.3.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype.createstroke = function() {
	var wireData = this._buildWire( this.strokeIndices, this.vertices );

	if ( wireData ) {
		this.strokePolyIndices = wireData.indices;
		this.strokePolyVertices = wireData.vertices;
	}
};

/**
* Initialise internal properties
* @method _initProperties
* @private
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype._initProperties = function() {
	/**
	* Part of the WebGL rendering pipeline
	* @property glRenderer
	* @type Kiwi.Renderers.Renderer
	* @public
	* @since 0.1.0
	*/
	this.glRenderer = undefined;

	// Mirror properties: private data accessed by getters/setters
	this._indices = null;
	this._vertices = null;
	this._strokeIndices = null;
	this._strokePolyIndices = null;
	this._strokePolyVertices = null;
};

/**
* Returns the type of object that this is.
* @method objType
* @return {string}
* @public
*/
Kiwi.Plugins.Primitives.Polygon.prototype.objType = function() {
	return "Primitive Polygon";
};

/**
* Sets default parameters on primitive.
* @method parseParams
* @param params {object} The param objects
* @public
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype.parseParams = function( params ) {

	this.color = params.color || [ 0.5, 0.5, 0.5 ];
	this.drawFill = ( typeof params.drawFill !== "undefined" ) ?
		params.drawFill :
		true;
	this.drawStroke = ( typeof params.drawStroke !== "undefined" ) ?
		params.drawStroke :
		true;
	this.indices = params.indices || [];
	this.lineWidth = params.lineWidth || 1;
	this.vertices = params.vertices || [];
	this.strokeColor = params.strokeColor || [ 0, 0, 0 ];
	this.strokeIndices = params.strokeIndices || [];
	this.strokePolyIndices = this._strokePolyIndices || [];
	this.strokePolyVertices = this._strokePolyVertices || [];

	// Universal entity params
	this.alpha = params.alpha || 1;
	this.anchorPointX = params.anchorPointX || 0;
	this.anchorPointX = params.anchorPointY || 0;
	this.rotation = params.rotation || 0;
	if (
			typeof params.scaleX === "undefined" &&
			typeof params.scaleY === "undefined" ) {
		this.scale = params.scale || 1;
	} else {
		this.scaleX = params.scaleX || 1;
		this.scaleY = params.scaleY || 1;
	}
	this.visible = params.visible || true;
	this.x = params.x || 0;
	this.y = params.y || 0;
};

/**
* Compute width, height, box, anchor points etc
*/
Kiwi.Plugins.Primitives.Polygon.prototype.rebuildBounds = function() {

	// Compute width, height, and anchor points
	var bounds = this.computeMinMaxXY( this._vertices );
	this.width = bounds.maxX - bounds.minX;
	this.height = bounds.maxY - bounds.minY;
	this.anchorPointX = bounds.maxX - 0.5 * this.width;
	this.anchorPointY = bounds.maxY - 0.5 * this.height;

	// Compute box
	this.box = this.components.add( new Kiwi.Components.Box(
		this, this.x + bounds.minX, this.x + bounds.minY,
		this.width, this.height ) );
};

/**
* Software rendering method
* @method render
* @param {Kiwi.Camera} camera
* @public
*/
Kiwi.Plugins.Primitives.Polygon.prototype.render = function( camera ) {

	var ctx, i, pTemp,
		indicesLen = this._indices.length,
		p0 = new Kiwi.Geom.Point( 0, 0 ),
		p1 = new Kiwi.Geom.Point( 0, 0 ),
		p2 = new Kiwi.Geom.Point( 0, 0 );

	Kiwi.Entity.prototype.render.call( this, camera );
	if ( this.alpha > 0 ) {
		ctx = this.game.stage.ctx;
		ctx.save();

		if ( this.alpha <= 1 ) {
			ctx.globalAlpha = this.alpha;
		}

		var t = this.transform;
		var m = t.getConcatenatedMatrix();
		ctx.transform( m.a, m.b, m.c, m.d, m.tx, m.ty );


		// Draw fill
		if ( this.drawFill && this._indices.length > 3 ) {
			ctx.fillStyle = "rgb(" + Math.round( this.color[ 0 ] * 255 ) + "," +
				Math.round( this.color[ 1 ] * 255 ) + "," +
				Math.round( this.color[ 2 ] * 255 ) + ")";

			p1.setTo(
				this._vertices[ this._indices[ 1 ] ][ 0 ] - t.anchorPointX,
				this._vertices[ this._indices[ 1 ] ][ 1 ] - t.anchorPointY
			);
			p2.setTo(
				this._vertices[ this._indices[ 0 ] ][ 0 ] - t.anchorPointX,
				this._vertices[ this._indices[ 0 ] ][ 1 ] - t.anchorPointY
			);

			for ( i = 2; i < indicesLen; i++ ) {

				// Overwrite start point
				p0.setTo(
					this._vertices[ this._indices[ i ] ][ 0 ] - t.anchorPointX,
					this._vertices[ this._indices[ i ] ][ 1 ] - t.anchorPointY
				);

				// Draw
				ctx.beginPath();
				ctx.moveTo( p0.x, p0.y );
				ctx.lineTo( p1.x, p1.y );
				ctx.lineTo( p2.x, p2.y );
				ctx.closePath();
				ctx.fill();

				// Cycle points
				pTemp = p2;
				p2 = p1;
				p1 = p0;
				p0 = pTemp;
			}
		}


		// Draw stroke
		if ( this.drawStroke && this._strokePolyIndices.length > 3 ) {
			indicesLen = this._strokePolyIndices.length;

			ctx.fillStyle =
				"rgb(" + Math.round( this.strokeColor[ 0 ] * 255 ) + "," +
				Math.round( this.strokeColor[ 1 ] * 255 ) + "," +
				Math.round( this.strokeColor[ 2 ] * 255 ) + ")";

			p1.setTo(
				this._strokePolyVertices[
					this._strokePolyIndices[ 1 ] ][ 0 ] - t.anchorPointX,
				this._strokePolyVertices[
					this._strokePolyIndices[ 1 ] ][ 1 ] - t.anchorPointY
			);
			p2.setTo(
				this._strokePolyVertices[
					this._strokePolyIndices[ 0 ] ][ 0 ] - t.anchorPointX,
				this._strokePolyVertices[
					this._strokePolyIndices[ 0 ] ][ 1 ] - t.anchorPointY
			);

			for ( i = 2; i < indicesLen; i++ ) {

				// Overwrite start point
				p0.setTo(
					this._strokePolyVertices[
						this._strokePolyIndices[ i ] ][ 0 ] - t.anchorPointX,
					this._strokePolyVertices[
						this._strokePolyIndices[ i ] ][ 1 ] - t.anchorPointY
				);

				// Draw
				ctx.beginPath();
				ctx.moveTo( p0.x, p0.y );
				ctx.lineTo( p1.x, p1.y );
				ctx.lineTo( p2.x, p2.y );
				ctx.closePath();
				ctx.fill();

				// Cycle points
				pTemp = p2;
				p2 = p1;
				p1 = p0;
				p0 = pTemp;
			}
		}
		


		// Clean up context
		ctx.restore();
	}
};



/**
* Hardware rendering method using WebGL
* @method renderGL
* @param gl {WebGLRenderingContext}
* @param camera {Kiwi.Camera}
* @param params {object}
*/
Kiwi.Plugins.Primitives.Polygon.prototype.renderGL =
		function( gl ) {
	if ( this.alpha > 0 ) {
		if ( this.drawFill ) {
			this.glRenderer.addToBatch( gl, this,
				this._indices, this._vertices, this.color
			);
		}
		if ( this.drawStroke ) {
			this.glRenderer.addToBatch( gl, this,
				this._strokePolyIndices, this._strokePolyVertices,
				this.strokeColor
			);
		}
	}
};

/**
* Decompose a polygon into its constituent triangles.
* This will destroy the original polygon and substitute a group
* containing the triangles.
* @method shatter
* @return {Kiwi.Group}
* @public
* @since 0.3.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype.shatter = function() {
	var dVert12, dVert13, dVert23, i, params, tri, vert1, vert2, vert3,
		indices = [ 0, 1, 2 ],
		group = new Kiwi.Group( this.state );

	for ( i = 0; i < this._indices.length - 2; i++ ) {

		vert1 = this._vertices[ this._indices[ i ] ];
		vert2 = this._vertices[ this._indices[ i + 1 ] ];
		vert3 = this._vertices[ this._indices[ i + 2 ] ];

		dVert12 = Math.sqrt(
			Math.pow( vert1[ 0 ] - vert2[ 0 ], 2 ) +
			Math.pow( vert1[ 1 ] - vert2[ 1 ], 2 )
		);
		dVert13 = Math.sqrt(
			Math.pow( vert1[ 0 ] - vert3[ 0 ], 2 ) +
			Math.pow( vert1[ 1 ] - vert3[ 1 ], 2 )
		);
		dVert23 = Math.sqrt(
			Math.pow( vert2[ 0 ] - vert3[ 0 ], 2 ) +
			Math.pow( vert2[ 1 ] - vert3[ 1 ], 2 )
		);

		// Avoid degenerate triangles
		if ( dVert12 !== 0 && dVert13 !== 0 && dVert23 !== 0 ) {
			params = {
				indices: indices,
				vertices: [ vert1, vert2, vert3 ],
				state: this.state,
				color: this.color,
				x: this.x,
				y: this.y,
				rotation: this.rotation,
				scaleX: this.scaleX,
				scaleY: this.scaleY,
				anchorPointX: this.anchorPointX,
				anchorPointY: this.anchorPointY
			};
			tri = (new Kiwi.Plugins.Primitives.Polygon( params ) ).clone();
			group.addChild( tri );
		}
	}

	// Eliminate original
	if ( this.parent ) {
		this.parent.addChildBefore( group, this );
	}
	this.destroy();

	return group;
};


/**
* Null Texture Atlas interfaces with KiwiJS rendering system
* which expects a texture atlas, and provides it with an atlas
* that has no texture.
*
* @class NullAtlas
* @constructor
* @namespace Kiwi.Plugins.Primitives
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.NullAtlas = function() {
	this.cells = [];
};

/** Dummy texture enable method, doing the bare minimum to satisfy the
* texture manager requirements. Parameters don't matter.
* @method enableGL
* @param gl {WebGLRenderingContext}
* @param renderer {Kiwi.Renderers.Renderer}
* @param textureManager {Kiwi.Renderers.GLTextureManager}
* @public
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.NullAtlas.prototype.enableGL = function() {};



/**
*
*/
Kiwi.Renderers.PrimitiveRenderer = function( gl, shaderManager ) {
	this.bufferItemSize = 6;
	this.indices = [];
	this.nullAtlas = new Kiwi.Plugins.Primitives.NullAtlas();
	this._tempPoint = new Kiwi.Geom.Point( 0, 0 );
	this._maxItems = 1000;
	this._vertexBuffer = new Kiwi.Renderers.GLArrayBuffer( gl, this.bufferItemSize );
	this._indexBuffer = new Kiwi.Renderers.GLElementArrayBuffer( gl, 1,
		this._generateIndices( this._maxItems ) );

	// Perform super functionality
	Kiwi.Renderers.Renderer.call( this, gl, shaderManager, true );

	this.setShaderPair( "PrimitiveShader" );
};
Kiwi.extend( Kiwi.Renderers.PrimitiveRenderer, Kiwi.Renderers.Renderer );

/**
* Generates quad indices
* @method _generateIndices
* @param numQuads {number}
* @private
*/
Kiwi.Renderers.PrimitiveRenderer.prototype._generateIndices =
		function( numTris ) {
	var i,
		triVerts = 3,
		tris = [];
	for ( i = 0; i < numTris; i++ ) {
		tris.push( i * triVerts + 0, i * triVerts + 1, i * triVerts + 2 );
	}
	return tris;
};

/**
* Returns a null atlas so that all primitives share a texture object.
* @method getAtlas
* @return Kiwi.Plugins.Primitives.NullAtlas
* @public
* @since 0.3.0
*/
Kiwi.Renderers.PrimitiveRenderer.prototype.getAtlas = function() {
	return this.nullAtlas;
};

/**
* Enables the renderer for drawing
* @method enable
* @param gl {WebGLRenderingContext}
* @param [params=null] {object}
* @public
*/
Kiwi.Renderers.PrimitiveRenderer.prototype.enable = function( gl, params ) {
	// Boilerplate extension
	Kiwi.Renderers.Renderer.
		prototype.enable.call( this, gl, params );

	this.shaderPair = this.shaderManager.requestShader(gl,
		this._shaderPairName, true);

	gl.uniform2fv( this.shaderPair.uniforms.uResolution.location,
		params.stageResolution );
	gl.uniformMatrix3fv( this.shaderPair.uniforms.uCamMatrix.location,
		false, params.camMatrix );
};

/**
* Disables the renderer
* @method disable
* @param gl {WebGLRenderingContext}
* @public
*/
Kiwi.Renderers.PrimitiveRenderer.prototype.disable = function( gl ) {
	gl.disableVertexAttribArray( this.shaderPair.attributes.aXY );
	gl.disableVertexAttribArray( this.shaderPair.attributes.aRGBA );
};

/**
* Clears the vertex buffer.
* @method clear
* @param gl {WebGLRenderingContext}
* @public
*/
Kiwi.Renderers.PrimitiveRenderer.prototype.clear = function( gl, params ) {
	this._vertexBuffer.clear();
	gl.uniformMatrix3fv( this.shaderPair.uniforms.uCamMatrix.location,
		false, params.camMatrix );
};

/**
* Updates the stage resolution uniforms
* @method updateStageResolution
* @param gl {WebGLRenderingContext}
* @param res {Float32Array}
* @public
*/
Kiwi.Renderers.PrimitiveRenderer.prototype.updateStageResolution =
		function( gl, res ) {
	gl.uniform2fv(this.shaderPair.uniforms.uResolution.location, res);
};

/**
* Sets shader pair by name
* @method setShaderPair
* @param shaderPair {String}
* @public
*/
Kiwi.Renderers.PrimitiveRenderer.prototype.setShaderPair =
		function( shaderPair ) {
	if ( typeof shaderPair === "string" ) {
		this._shaderPairName = shaderPair;
	}
};

/**
* Collates all xy and uv coordinates into a buffer
* ready for upload to video memory
* @method _collateVertexAttributeArrays
* @param gl {WebGLRenderingContext}
* @param entity {Kiwi.Entity}
* @param camera {Camera}
* @public
*/
Kiwi.Renderers.PrimitiveRenderer.prototype.addToBatch =
		function( gl, entity, indices, vertices, color ) {

	var i,
		indexLen = indices.length,
		indexOffset = this._vertexBuffer.items.length / this.bufferItemSize,
		vertLen = vertices.length;

	var t = entity.transform;
	var m = t.getConcatenatedMatrix();

	for ( i = 0; i < vertLen; i++ ) {
		this._tempPoint.setTo(
			vertices[ i ][ 0 ] - t.anchorPointX,
			vertices[ i ][ 1 ] - t.anchorPointY );

		this._tempPoint = m.transformPoint( this._tempPoint );

		this._vertexBuffer.items.push(
			this._tempPoint.x, this._tempPoint.y,
			color[ 0 ], color[ 1 ], color[ 2 ],
			entity.alpha
		);
	}

	// Append indices

	// Apply degenerate connections
	// Always apply a single degenerate link
	if ( this.indices.length > 0 ) {
		this.indices.push( this.indices[ this.indices.length - 1 ] );
	}

	// For opposite vertex order, we need two degenerate connectors.
	if ( indexOffset % 2 === 0 ) {
		this.indices.push( indices[ 0 ] + indexOffset );
	}

	for ( i = 0; i < indexLen; i++ ) {
		this.indices.push( indices[ i ] + indexOffset );
	}
};

/**
* Makes a draw call, this is where things actually
* get rendered to the draw buffer (or a framebuffer).
* @method draw
* @param gl {WebGLRenderingContext}
* @public
*/
Kiwi.Renderers.PrimitiveRenderer.prototype.draw = function( gl ) {
	var byteHead = 0,
		bytesPerF32 = 4,
		bytes = this.bufferItemSize * bytesPerF32;

	this._vertexBuffer.uploadBuffer( gl, this._vertexBuffer.items );

	gl.enableVertexAttribArray( this.shaderPair.attributes.aXY );
	gl.vertexAttribPointer( this.shaderPair.attributes.aXY,
		bytesPerF32, gl.FLOAT, false, bytes, byteHead );
	byteHead += 2 * bytesPerF32;

	gl.enableVertexAttribArray( this.shaderPair.attributes.aRGBA );
	gl.vertexAttribPointer( this.shaderPair.attributes.aRGBA,
		bytesPerF32, gl.FLOAT, false, bytes, byteHead );
	// byteHead += 4 * bytesPerF32;

	// Generate vertex index strip
	this._indexBuffer.indices = this.indices;
	this._indexBuffer.refresh( gl );

	// Render
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer.buffer );
	gl.drawElements( gl.TRIANGLE_STRIP,
		this._indexBuffer.numItems,
		gl.UNSIGNED_SHORT, 0 );

	// Clear index buffer
	this.indices = [];
};


/*
 * Primitive Shader Pair
 */
Kiwi.Shaders.PrimitiveShader = function() {
	// Super call
	Kiwi.Shaders.ShaderPair.call( this );

	// Extended functionality

	this.attributes = {
		aXY: null,
		aRGBA: null
	};

	// Configure uniforms

	this.uniforms = {
		uCamMatrix: {
			type: "mat3",
		},
		uResolution: {
			type: "2fv",
		}
	};

	// Declare shaders

	this.vertSource = [
		"attribute vec2 aXY;",
		"attribute vec4 aRGBA;",
		"uniform mat3 uCamMatrix;",
		"uniform vec2 uResolution;",
		"varying vec4 vRGBA;",
		"void main(void) {",
		"  vec2 pos = (uCamMatrix * vec3(aXY,1)).xy; ",
		"  gl_Position = vec4((pos / uResolution * 2.0 - 1.0) * vec2(1, -1), 0, 1);",
		"  vRGBA = aRGBA;",
		"}"
	];

	this.fragSource = [
		"precision mediump float;",
		"varying vec4 vRGBA;",
		"void main(void) {",
		"  gl_FragColor = vRGBA;",
		"}"
	];
};
Kiwi.extend( Kiwi.Shaders.PrimitiveShader, Kiwi.Shaders.ShaderPair );

Kiwi.Shaders.PrimitiveShader.prototype.init = function( gl ) {
	Kiwi.Shaders.ShaderPair.prototype.init.call( this, gl );

	this.attributes.aXY = gl.getAttribLocation(this.shaderProgram, "aXY");
	this.attributes.aRGBA = gl.getAttribLocation(this.shaderProgram, "aRGBA");

	this.initUniforms(gl);
};
