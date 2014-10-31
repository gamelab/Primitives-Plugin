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
	* @default "0.2.0"
	* @public
	*/
	version:"0.2.0"

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
// * Update Polygon renderer to use more efficient TRIANGLE_STRIP plus
//	degenerate triangles concatenation.
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
* @param params.lineExternal {boolean} If the wireframe renders only edge lines.
* @param params.lineWidth {number} How wide wireframes are rendered.
* @param params.state {Kiwi.State} The context state.
* @param params.triangles {array} Array of vertex triplets
*	([ [ 0, 1, 2 ], [1, 2, 3] ] etc).
* @param params.vertices {array} Array of vertex coordinate 
*	array pairs ([ [ x1, y1 ], [x2, y2 ] ] etc).
* @param params.wireframe {boolean} Whether the Polygon is wireframe or flat.
* @param params.x {number} The x-coordinate.
* @param params.y {number} The y-coordinate.
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.Polygon = function( params ) {

	var bounds,
		state = params.state;

	this._initProperties();

	// Super
	Kiwi.Entity.call( this, state, 0, 0 );

	this.parseParams( params );

	this.atlas = new Kiwi.Plugins.Primitives.NullAtlas();

	// Create WebGL renderer
	if (this.game.renderOption === Kiwi.RENDERER_WEBGL) {
		this.glRenderer =
			this.game.renderer.requestRendererInstance( "PrimitiveRenderer" );
	}

	// Compute width, height, and anchor points
	bounds = this.computeMinMaxXY( this.vertices );
	this.width = bounds.maxX - bounds.minX;
	this.height = bounds.maxY - bounds.minY;
	this.anchorPointX = bounds.maxX - 0.5 * this.width;
	this.anchorPointY = bounds.maxY - 0.5 * this.height;

	// Compute box
	this.box = this.components.add( new Kiwi.Components.Box(
		this, this.x + bounds.minX, this.x + bounds.minY,
		this.width, this.height ) );
};
Kiwi.extend( Kiwi.Plugins.Primitives.Polygon, Kiwi.Entity );

/**
* Controls whether the primitive should render only
* its external border in wireframe mode.
* @property lineExternal
* @type boolean
* @public
* @since 0.1.0
*/
Object.defineProperty(
		Kiwi.Plugins.Primitives.Polygon.prototype, "lineExternal", {
	get: function () {
		return this._lineExternal;
	},
	set: function ( value ) {
		this._lineExternal = value;
		this.dirty = true;
	},
	enumerable: true,
	configurable: true
} );

/**
* Controls width of lines in wireframe mode.
* @property lineWidth
* @type number
* @public
* @since 0.1.0
*/
Object.defineProperty(
		Kiwi.Plugins.Primitives.Polygon.prototype, "lineWidth", {
	get: function () {
		return this._lineWidth;
	},
	set: function ( value ) {
		this._lineWidth = value;
		this.dirty = true;
	},
	enumerable: true,
	configurable: true
} );

/**
* Array of triangles. Triangles are lists of vertex indices.
* @property triangles
* @type array
* @public
* @since 0.1.0
*/
Object.defineProperty(
		Kiwi.Plugins.Primitives.Polygon.prototype, "triangles", {
	get: function () {
		return this._triangles;
	},
	set: function ( value ) {
		if ( !this.wireframe ) {
			this._triangles = value;
		} else {
			this._fillTriangles = value;
		}
		this.dirty = true;
	},
	enumerable: true,
	configurable: true
} );

/**
* Array of vertices used to compose triangles.
* @property vertices
* @type array
* @public
* @since 0.1.0
*/
Object.defineProperty(
		Kiwi.Plugins.Primitives.Polygon.prototype, "vertices", {
	get: function () {
		return this._vertices;
	},
	set: function ( value ) {
		if ( !this.wireframe ) {
			this._vertices = value;
		} else {
			this._fillVertices = value;
		}
		this.dirty = true;
	},
	enumerable: true,
	configurable: true
} );

/**
* Controls whether the primitive should render as lines or filled.
* @property wireframe
* @type boolean
* @public
* @since 0.1.0
*/
Object.defineProperty( Kiwi.Plugins.Primitives.Polygon.prototype, "wireframe", {
	get: function () {
		return this._wireframe;
	},
	set: function ( value ) {
		if ( value ) {
			this._tagForConvertToWireframe = true;
		} else {
			this._tagForConvertToFill = true;
		}
	},
	enumerable: true,
	configurable: true
} );

/**
* Builds a mesh along the edges of the polygon's triangles.
* @method _buildWireframe
* @return {Object}
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype._buildWireframe = function() {
	var edges, edgesLen, i, wire,
		wireTris = [],
		wireVerts = [];

	edges = this._getUniqueEdges();
	edgesLen = edges.length;
	for ( i = 0; i < edgesLen; i++ ) {
		wire = this._createWire( edges[ i ], wireVerts.length );
		wireTris = wireTris.concat( wire.triangles );
		wireVerts = wireVerts.concat( wire.vertices );
	}

	return { triangles: wireTris, vertices: wireVerts };
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
* Sets object to display filled polygons.
* @method _convertToFill
* @return boolean
* @private
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype._convertToFill = function() {
	if ( this._wireframe ) {
		// Cache line polys
		this._lineTriangles = this._triangles;
		this._lineVertices = this._vertices;
		// Obtain fill polys
		if ( !( this._fillTriangles && this._fillVertices ) ) {
			return false;
		}
		this._triangles = this._fillTriangles;
		this._vertices = this._fillVertices;
		this._wireframe = false;
		return true;
	}
	return false;
};

/**
* Sets object to display wireframe.
* @method _convertToWireframe
* @return boolean
* @private
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype._convertToWireframe = function() {

	var wireframeData;

	if ( !this._wireframe ) {
		// Cache fill polys
		this._fillTriangles = this._triangles;
		this._fillVertices = this._vertices;
		// Obtain line polys
		if ( !( this._lineTriangles && this._lineVertices ) ) {
			wireframeData = this._buildWireframe();
			this._lineTriangles = wireframeData.triangles;
			this._lineVertices = wireframeData.vertices;
		}
		this._triangles = this._lineTriangles;
		this._vertices = this._lineVertices;
		this._wireframe = true;
		return true;
	}
	return false;
};

/**
* Builds a wire between two points.
* @method _createWire
* @param edge {Array} Array of two arrays of xy points.
* @return {Object} Object containing arrays of triangles and vertices
*/
Kiwi.Plugins.Primitives.Polygon.prototype._createWire =
		function( edge, offset ) {
	var ang, dx, dy, widthHalf,
		ptA1, ptA2, ptB1, ptB2,
		pt1 = new Kiwi.Geom.Point( edge[ 0 ][ 0 ], edge[ 0 ][ 1 ] ),
		pt2 = new Kiwi.Geom.Point( edge[ 1 ][ 0 ], edge[ 1 ][ 1 ] ),
		tris = [],
		verts = [];

	offset = offset || 0;

	ang = pt1.angleTo( pt2 );
	dx = Math.sin( ang );
	dy = Math.cos( ang );

	widthHalf = this.lineWidth * 0.5;

	ptA1 = new Kiwi.Geom.Point(
		widthHalf * dy,
		-widthHalf * dx );
	ptA2 = new Kiwi.Geom.Point(
		-widthHalf * dy,
		widthHalf * dx );
	ptB1 = new Kiwi.Geom.Point(
		widthHalf * dy,
		-widthHalf * dx );
	ptB2 = new Kiwi.Geom.Point(
		-widthHalf * dy,
		widthHalf * dx );

	ptA1.offset( pt1.x, pt1.y );
	ptA2.offset( pt1.x, pt1.y );
	ptB1.offset( pt2.x, pt2.y );
	ptB2.offset( pt2.x, pt2.y );

	tris.push(
		[ offset, offset + 1, offset + 2 ],
		[ offset + 1, offset + 2, offset + 3 ]
		);
	verts.push(
		[ ptA1.x, ptA1.y ],
		[ ptA2.x, ptA2.y ],
		[ ptB1.x, ptB1.y ],
		[ ptB2.x, ptB2.y ]
		);

	return { triangles: tris, vertices: verts };
};

/**
* Assesses where a given edge is in a given list of edges.
* <br>
* This method will not identify an edge P1->P2 with an edge P2->P1.
* Direction matters.
* @method _findEdgeIn
* @param edge {Array} Array of two vertices, each an xy array
* @param edges {Array} Array of edges, each an array of two xy vertex arrays
* @return {number} The first position of an identical edge in edges.
*/
Kiwi.Plugins.Primitives.Polygon.prototype._findEdgeIn =
		function( edge, edges) {
	var i, edge2;

	for ( i = 0; i < edges.length; i++ ) {
		edge2 = edges[ i ];
		if ( !(
				edge2[ 0 ][ 0 ] - edge[ 0 ][ 0 ] ||
				edge2[ 0 ][ 1 ] - edge[ 0 ][ 1 ] ||
				edge2[ 1 ][ 0 ] - edge[ 1 ][ 0 ] ||
				edge2[ 1 ][ 1 ] - edge[ 1 ][ 1 ] ) ) {
			return i;
		}
	}

	return -1;
};

/**
* Gets a list of all non-identical edges for this polygon.
* @method _getUniqueEdges
* @return {Array}
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype._getUniqueEdges = function() {
	var edge, edgeClash, i, pair, tri, vert1, vert2, vert3,
		edges = [],
		edgesInternal = [],
		triPoints = 3,
		trisLen = this.triangles.length;

	for ( i = 0; i < trisLen; i++ ) {
		tri = this.triangles[i];

		for ( pair = 0; pair < triPoints; pair++ ) {
			vert1 = this.vertices[ tri[ pair ] ];
			vert2 = this.vertices[ tri[ ( pair + 1 ) % triPoints ] ];

			// Skip zero-length lines
			if ( ( vert1[0] - vert2[0] !== 0 ) ||
					( vert1[1] - vert2[1] !== 0 ) ) {

				// Sort edge vertices to begin with low X, with Y as tiebreaker
				if ( vert1[ 0 ] < vert2[ 0 ] ||
						( vert1[ 0 ] === vert2[ 0 ] &&
							vert1[ 1 ] < vert2[ 1 ] ) ) {
					vert3 = vert1;
					vert1 = vert2;
					vert2 = vert3;
				}
				edge = [ vert1, vert2 ];

				// Check whether edge is already represented in edges
				edgeClash = this._findEdgeIn( edge, edges );
				if ( ( edgeClash === -1 ) && ( this.lineExternal ) ) {
					edgeClash = this._findEdgeIn( edge, edgesInternal );
				}
				if ( edgeClash === -1 ) {
					edges.push( edge );
				} else if ( this.lineExternal ) {
					// Remove internal edges
					edges.splice( edgeClash, 1 );
					edgesInternal.push( edge );
				}
			}
		}
	}

	return edges;
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

	/**
	* Tag for geometric recomposition
	* @property dirty
	* @type boolean
	* @public
	* @since 0.1.0
	*/
	this.dirty = false;

	/**
	* Should the dirty tasks convert to fill mode?
	* @property _tagForConvertToFill
	* @type boolean
	* @private
	* @since 0.1.0
	*/
	this._tagForConvertToFill = false;

	/**
	* Should the dirty tasks convert to wireframe mode?
	* @property _tagForConvertToWireframe
	* @type boolean
	* @private
	* @since 0.1.0
	*/
	this._tagForConvertToWireframe = false;

	/**
	* Cache for fill mode triangles
	* @property _fillTriangles
	* @type array
	* @private
	* @since 0.1.0
	*/
	this._fillTriangles = null;

	/**
	* Cache for fill mode vertices
	* @property _fillVertices
	* @type array
	* @private
	* @since 0.1.0
	*/
	this._fillVertices = null;

	/**
	* Cache for wireframe mode triangles
	* @property _lineTriangles
	* @type array
	* @private
	* @since 0.1.0
	*/
	this._lineTriangles = null;

	/**
	* Cache for wireframe mode vertices
	* @property _lineVertices
	* @type array
	* @private
	* @since 0.1.0
	*/
	this._lineVertices = null;

	// Mirror properties
	this._lineExternal = null;
	this._lineWidth = null;
	this._triangles = null;
	this._vertices = null;
	this._wireframe = null;
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
	this.lineExternal = params.lineExternal || false;
	this.lineWidth = params.lineWidth || 1;
	this.triangles = params.triangles || [];
	this.vertices = params.vertices || [];
	this.wireframe = params.wireframe || false;

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
* Removes duplicate triangles.
* @method _pruneTriangles
* @private
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype._pruneTriangles = function() {
	var i, j, tri1, tri2,
		triCount = this._triangles.length;

	for ( i = triCount - 1; i >= 0; i-- ) {
		tri1 = this._triangles[ i ];
		for ( j = i - 1; j >= 0; j-- ) {
			tri2 = this._triangles[ j ];
			if ( this._triangleEquals( tri1, tri2 ) ) {
				this._triangles.splice( i, 1 );
			}
		}
	}
};

/**
* Software rendering method
* @method render
* @param {Kiwi.Camera} camera
* @public
*/
Kiwi.Plugins.Primitives.Polygon.prototype.render = function( camera ) {
	var i, tri, triLen,
		p0 = new Kiwi.Geom.Point( 0, 0 ),
		p1 = new Kiwi.Geom.Point( 0, 0 ),
		p2 = new Kiwi.Geom.Point( 0, 0 );

	Kiwi.Entity.prototype.render.call( this, camera );

	this._runDirtyTasks();

	triLen = this.triangles.length;

	if ( this.alpha > 0 ) {
		var ctx = this.game.stage.ctx;
		ctx.save();

		ctx.fillStyle = "rgb(" + Math.round( this.color[ 0 ] * 255 ) + "," +
			Math.round( this.color[ 1 ] * 255 ) + "," +
			Math.round( this.color[ 2 ] * 255 ) + ")";

		if ( this.alpha <= 1 ) {
			ctx.globalAlpha = this.alpha;
		}

		var t = this.transform;
		var m = t.getConcatenatedMatrix();
		ctx.transform( m.a, m.b, m.c, m.d, m.tx, m.ty );

		for( i = 0; i < triLen; i++ ) {
			tri = this.triangles[ i ];
			p0.setTo(
				this.vertices[ tri[ 0 ] ][ 0 ] - t.anchorPointX,
				this.vertices[ tri[ 0 ] ][ 1 ] - t.anchorPointY );
			p1.setTo(
				this.vertices[ tri[ 1 ] ][ 0 ] - t.anchorPointX,
				this.vertices[ tri[ 1 ] ][ 1 ] - t.anchorPointY );
			p2.setTo(
				this.vertices[ tri[ 2 ] ][ 0 ] - t.anchorPointX,
				this.vertices[ tri[ 2 ] ][ 1 ] - t.anchorPointY );
			ctx.beginPath();
			ctx.moveTo( p0.x, p0.y );
			ctx.lineTo( p1.x, p1.y );
			ctx.lineTo( p2.x, p2.y );
			ctx.closePath();
			ctx.fill();
		}

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
		function( gl, camera ) {

	this._runDirtyTasks();

	this.glRenderer.addToBatch( gl, this, camera );
};

/**
* Runs tasks to update object if dirty
* @method _runDirtyTasks
*/
Kiwi.Plugins.Primitives.Polygon.prototype._runDirtyTasks = function() {

	var wireframeData;

	// // Rebuild geometry
	// if ( this.dirty ) {
	// 	if ( this.wireframe ) {
	// 		// Discard current wireframe
	// 		this._triangles = this._fillTriangles;
	// 		this._vertices = this._fillVertices;
	// 		this._sanitizeTriangles();
	// 		this._pruneTriangles();
	// 		wireframeData = this._buildWireframe();
	// 		this._triangles = wireframeData.triangles;
	// 		this._vertices = wireframeData.vertices;
	// 	} else {
	// 		this._sanitizeTriangles();
	// 		this._pruneTriangles();
	// 		wireframeData = this._buildWireframe();
	// 		this._lineTriangles = wireframeData.triangles;
	// 		this._lineVertices = wireframeData.vertices;
	// 	}
	// }
	// if ( this._tagForConvertToWireframe ) {
	// 	this._convertToWireframe();
	// 	this._tagForConvertToWireframe = false;
	// } else if ( this._tagForConvertToFill ) {
	// 	this._convertToFill();
	// 	this._tagForConvertToFill = false;
	// }

	// Consistency check

	if ( this.dirty ) {
		this.glRenderer.dirty = true;

		this.dirty = false;
	}

};

/**
* Ensure that vertices line up with triangles.
* <br>
* This will remove invalid triangles. Degenerate triangles are permitted.
* @method _sanitizeTriangles
* @private
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype._sanitizeTriangles = function() {
	var i, j, tri, triEl, triElements,
		triCount = this._triangles.length,
		triPoints = 3,
		vertCount = this._vertices.length;

	for ( i = triCount - 1; i >= 0; i-- ) {
		tri = this._triangles[ i ];
		triElements = tri.length;

		// Check that triangles have 3 points.
		if ( triElements !== triPoints ) {
			this._triangles.splice( i, 1 );
		} else {
			// Check that triangles refer to extant vertices.
			for ( j = tri.length - 1; j >= 0; j-- ) {
				triEl = tri[ j ];
				if ( isNaN( triEl ) || triEl < 0 || triEl >= vertCount) {
					this._triangles.splice( i, 1 );
					break;
				}
			}
		}
	}
};

/**
* Assesses whether two triangles share the same vertices.
* <br>
* Does not match triangles that overlap but have unique vertices.
* @method _triangleEquals
* @param triangle1 {array} Array of three vertex indices
* @param triangle2 {array} Array of three vertex indices
* @return {boolean}
* @private
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.Polygon.prototype._triangleEquals =
		function( triangle1, triangle2 ) {
	var tri1 = [ triangle1[0], triangle1[1], triangle1[2] ],
		tri2 = [ triangle2[0], triangle2[1], triangle2[2] ];

	// Reorder indices
	tri1.sort( function( a, b ){
		return a - b;
	} );
	tri2.sort( function( a, b ){
		return a - b;
	} );

	if (
			tri1[ 0 ] === tri2[ 0 ] &&
			tri1[ 1 ] === tri2[ 1 ] &&
			tri1[ 2 ] === tri2[ 2 ] ) {
		return true;
	}
	return false;
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
	var bufferItemSize = 2;

	this.dirty = true;
	this._maxItems = 1000;
	this._vertsPerTri = 3;
	this._vertexBuffer = new Kiwi.Renderers.GLArrayBuffer( gl, bufferItemSize );
	this._indexBuffer = new Kiwi.Renderers.GLElementArrayBuffer( gl, 1,
		this._generateIndices( this._maxItems * this._vertsPerTri ) );

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
};

/**
* Disables the renderer
* @method disable
* @param gl {WebGLRenderingContext}
* @public
*/
Kiwi.Renderers.PrimitiveRenderer.prototype.disable = function( gl ) {
	gl.disableVertexAttribArray( this.shaderPair.attributes.aXY );
};

/**
* Dummy method.
* @method clear
* @param gl {WebGLRenderingContext}
* @public
*/
Kiwi.Renderers.PrimitiveRenderer.prototype.clear = function( gl, params ) {};

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
		function( gl, entity ) {
	var cam, i, m, t, tri, worldMatrix3,
		p0 = new Kiwi.Geom.Point( 0, 0 ),
		p1 = new Kiwi.Geom.Point( 0, 0 ),
		p2 = new Kiwi.Geom.Point( 0, 0 ),
		triLen = entity.triangles.length;

	if( entity.alpha <= 0 ) {
		return;
	}

	t = entity.transform;
	m = t.getConcatenatedMatrix();

	if ( this.dirty ) {
		this._vertexBuffer.items = [];

		for ( i = 0; i < triLen; i++ ) {
			tri = entity.triangles[ i ];

			p0.setTo(
				entity.vertices[ tri[ 0 ] ][ 0 ] - t.anchorPointX,
				entity.vertices[ tri[ 0 ] ][ 1 ] - t.anchorPointY );
			p1.setTo(
				entity.vertices[ tri[ 1 ] ][ 0 ] - t.anchorPointX,
				entity.vertices[ tri[ 1 ] ][ 1 ] - t.anchorPointY );
			p2.setTo(
				entity.vertices[ tri[ 2 ] ][ 0 ] - t.anchorPointX,
				entity.vertices[ tri[ 2 ] ][ 1 ] - t.anchorPointY );

			// p0 = m.transformPoint( p0 );
			// p1 = m.transformPoint( p1 );
			// p2 = m.transformPoint( p2 );

			this._vertexBuffer.items.push(
				p0.x, p0.y,
				p1.x, p1.y,
				p2.x, p2.y
			);
		}

		this.dirty = false;
	}

	// Set entity uniforms
	// m.appendMatrix( entity.game.cameras.defaultCamera.
	// 	transform.getConcatenatedMatrix() );
	// m = entity.game.cameras.defaultCamera.transform.getConcatenatedMatrix().
	// 	translate( -entity.anchorPointX, -entity.anchorPointY );
	cam = entity.game.cameras.defaultCamera;
	m.appendMatrix( cam.transform.getConcatenatedMatrix().
		translate( -cam.transform.anchorPointX, -cam.transform.anchorPointY ) );
	worldMatrix3 = [
		m.a, m.b, 0,
		m.c, m.d, 0,
		m.tx, m.ty, 1
	];
	gl.uniformMatrix3fv( this.shaderPair.uniforms.uWorldMatrix.location,
		false, new Float32Array( worldMatrix3 ) );
	gl.uniform4f(
		this.shaderPair.uniforms.uColor.location,
		entity.color[ 0 ],
		entity.color[ 1 ],
		entity.color[ 2 ],
		entity.alpha
	);
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
		bytes = 8,
		bytesPerF32 = 4;

	// if ( !this._vertexBuffer.uploaded ) {

	// 	// Duplicate vertex buffer functionality for static draw
	// 	this._vertexBuffer.numItems =
	// 		this._vertexBuffer.items.length / this._vertexBuffer.itemSize;
	// 	var f32 = new Float32Array( this._vertexBuffer.items );
	// 	gl.bindBuffer( gl.ARRAY_BUFFER, this._vertexBuffer.buffer );
	// 	gl.bufferData( gl.ARRAY_BUFFER, f32, gl.STATIC_DRAW );
	// 	this._vertexBuffer._uploaded = true;
	// } else {
	// 	gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer.buffer);
	// }

	this._vertexBuffer.uploadBuffer( gl, this._vertexBuffer.items );

	gl.enableVertexAttribArray( this.shaderPair.attributes.aXY );
	gl.vertexAttribPointer( this.shaderPair.attributes.aXY,
		bytesPerF32, gl.FLOAT, false, bytes, byteHead );
	// byteHead += 2 * bytesPerF32;

	// // Expand index buffer when necessary
	// while ( 0.5 * this._vertexBuffer.items.length / bytes > this._maxItems ) {
	// 	this._expandMaxItems( gl );
	// }

	// Render
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer.buffer );
	gl.drawElements( gl.TRIANGLES,
		( this._vertexBuffer.items.length / bytes ) * 4,
		gl.UNSIGNED_SHORT, 0 );
};

Kiwi.Renderers.PrimitiveRenderer.prototype._expandMaxItems = function( gl ) {
	this._maxItems *= 2;
	this._indexBuffer = new Kiwi.Renderers.GLElementArrayBuffer( gl, 1,
		this._generateIndices( this._maxItems * this._vertsPerTri ) );
};


/*
 * Primitive Shader Pair
 */
Kiwi.Shaders.PrimitiveShader = function() {
	// Super call
	Kiwi.Shaders.ShaderPair.call( this );

	// Extended functionality

	this.attributes = {
		aXY: null
	};

	// Configure uniforms

	this.uniforms = {
		uWorldMatrix: {
			type: "mat3"
		},
		uResolution: {
			type: "2fv"
		},
		uColor: {
			type: "4f"
		}
	};

	// Declare shaders

	this.vertSource = [
		"attribute vec2 aXY;",
		"uniform mat3 uWorldMatrix;",
		"uniform vec2 uResolution;",
		"void main(void) {",
		"  vec2 pos = (uWorldMatrix * vec3(aXY,1)).xy; ",
		"  gl_Position = vec4((pos / uResolution * 2.0 - 1.0) * vec2(1, -1), 0, 1);",
		"}"
	];

	this.fragSource = [
		"precision mediump float;",
		"uniform vec4 uColor;",
		"void main(void) {",
		"  gl_FragColor = uColor;",
		"}"
	];
};
Kiwi.extend( Kiwi.Shaders.PrimitiveShader, Kiwi.Shaders.ShaderPair );

Kiwi.Shaders.PrimitiveShader.prototype.init = function( gl ) {
	Kiwi.Shaders.ShaderPair.prototype.init.call( this, gl );

	this.attributes.aXY = gl.getAttribLocation(this.shaderProgram, "aXY");

	this.initUniforms(gl);
};
