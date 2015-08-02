/**
* @module Plugins
* @submodule Primitives
*/
declare module Kiwi.Plugins.Primitives {
	/**
	* Polygon Gameobject
	* <br><br>
	* This is the master system which handles all primitives. When you create
	* another primitive (Ellipse, Line, Rectangle, Star or Triangle) you are
	* really creating a Polygon with some options pre-set. All primitives
	* inherit parameters and methods from Polygon.
	* <br><br>
	* Polygons are defined with a params object. This must contain the non-optional
	* parameter "state", which is a reference to the current state. It also contains
	* optional transform and style information.
	* <br><br>
	* You may specify common transform options in the params of any primitive.
	* This includes alpha, visible, x, y, rotation, scale, scaleX, scaleY,
	* anchorPointX, and anchorPointY. If not specified, these default to alpha = 1,
	* visible = true, x = 0, y = 0, rotation = 0, scale = 1, and the anchorPoint
	* defaults to the geometric center of the object.
	* <br><br>
	* All primitives contain both a fill and a stroke. You may style these
	* separately and enable or disable rendering of either. Available style options
	* include color (the color with which the primitive is filled; an array of 3
	* normalized values, from black [ 0, 0, 0 ] to white [ 1, 1, 1 ] ), drawFill
	* (whether to render the fill), strokeColor (as color, but for the stroke),
	* drawStroke (whether to render the stroke), and strokeWidth (the width of the
	* stroke line, in pixels).
	* <br><br>
	* If the default primitives do not meet your requirements, you can define your
	* own by using the Polygon. You will need to provide the params object with
	* arrays of vertices, indices, and strokeIndices.
	* <br><br>
	* new Kiwi.Plugins.Primitives.Polygon( {<br>
	* 	state: MyGame.state,<br>
	* 	indices: [ 0, 1, 2, 3 ],<br>
	* 	vertices: [[ 0, 0 ], [ 100, 100 ], [ 200, 0 ], [ 300, 100 ] ],<br>
	* 	strokeIndices: [ 0, 1, 2, 0 ]<br>
	* } );
	* <br><br>
	* All three arrays are processed to create new internal representations.
	* Two Polygons created from the same arrays will not contain the same data.
	* This prevents unexpected modifications from one object affecting another.
	* <br><br>
	* The "vertices" param is a list of points, each defined as an array of two
	* points. The order of vertices does not matter for rendering, but you must be
	* aware of it. A simple vertices array might read [ [ 0, 0 ], [ 100, 100 ],
	* [ 200, 0 ], [ 300, 100 ] ]. Each is an XY coordinate.
	* <br><br>
	* The "indices" param is a list of references to vertices. It is processed
	* using a TRIANGLE_STRIP procedure. This means that every three consecutive
	* values on the list define a new triangle. You can add new triangles simply
	* by appending a single new index. Each index is the array position of a vertex.
	* For example, to draw a single triangle you could pass [ 0, 1, 2 ]. To draw two
	* triangles, you could pass [ 0, 1, 2, 3 ].
	* <br><br>
	* The TRIANGLE_STRIP procedure is very succinct, but it doesn't allow for every
	* desirable form of geometry. If you need to stop positioning triangles in one
	* place and start adding them elsewhere, you can't skip over empty space.
	* Fortunately, you can use a concept called "degenerate triangles" to cheat.
	* <br><br>
	* A degenerate triangle is one with zero area. It is formed when a triangle has
	* two or three vertices in the same place. It is very easy to simply not draw a
	* degenerate triangle. We can use these to connect disparate triangles. (In
	* fact, the renderer uses these behind the scenes to efficiently render numerous
	* primitives at once.)
	* <br><br>
	* To create degenerate triangles, just double up an index on either side of the
	* gap. For example, if you want to draw triangles at indices [ 0, 1, 2 ] and
	* [ 8, 9, 10 ], you can combine them into one with the indices
	* [ 0, 1, 2, 2, 8, 8, 9, 10 ]. This creates the degenerate triangles
	* [ 1, 2, 2 ], [ 2, 2, 8 ], [ 2, 8, 8 ] and [ 8, 8, 9 ]. Although this
	* introduces some overhead, it is often quicker than rendering them as separate
	* objects.
	* <br><br>
	* You may reduce the degenerate data to a single index if you know what you're
	* doing with winding orders. This is left as an exercise for the user.
	* <br><br>
	* The "strokeIndices" param is used to create a stroke. This is usually a line
	* around the edge of a polygon, but it can be any sort of line. It is, like the
	* indices param, a list of array positions in the vertices param. Unlike
	* indices, strokeIndices does not use TRIANGLE_STRIP. It just connects points in
	* order.
	* <br><br>
	* Technically, the stroke is itself a series of triangles, a sort of
	* mini-polygon. It will usually have more triangles than the fill. For this
	* reason, you should be careful about overusing stroke.
	* <br><br>
	* You may also construct polygons by building several objects and combining
	* them using the ".combine()" method. This may not be as efficient as
	* defining a polygon by hand, and will introduce several degenerate triangles,
	* but for large-scale constructions it is very convenient.
	*
	* @class Polygon
	* @extends Kiwi.Entity
	* @namespace Kiwi.Plugins.Primitives
	* @constructor
	* @param params {Object} The parameter object.
	*   @param state {Kiwi.State} Context state
	*   @param [color=[0.5,0.5,0.5] {Array} RGB normalized color
	*   @param [drawFill=true] {Boolean} Whether to fill the polygon
	*   @param [drawStroke=true] {Boolean} Whether to draw the stroke
	*   @param [enableInput=false] {Boolean} Whether to enable input
	*   @param [indices] {Array} Array of vertices for triangle strips
	*   @param [strokeColor=[0.5,0.5,0.5] {Array} RGB normalized color
	*   @param [strokeWidth=1] {Number} Width of stroke in pixels
	*   @param [strokeIndices] {Array} Array of vertices for strokes
	*   @param [vertices] {Array} Array of vertex coordinates
	*   		array pairs ([ [ x1, y1 ], [x2, y2 ] ] etc).
	*/
	class Polygon extends Kiwi.Entity {
		constructor(params: Object);

		/**
		* Index of pointers to vertices. The sequence of points
		* which constructs the poly.
		* @property indices
		* @type {array}
		* @public
		*/
		public indices: Object;

		/**
		* Index of vertices.
		* @property vertices
		* @type {array}
		* @public
		*/
		public vertices: Object;

		/**
		* Index of pointers to vertices. The sequence of points which
		* constructs the stroke. To be distinguished from the strokePolyIndices,
		* which define the actual shape of the stroke.
		* @property strokeIndices
		* @type {array}
		* @public
		*/
		public strokeIndices: Object;

		/**
		* Index of pointers to vertices. The sequence of points which
		* make up the stroke. To be distinguished from the strokeIndices,
		* which define the construction of the stroke.
		* @property strokePolyIndices
		* @type {array}
		* @public
		*/
		public strokePolyIndices: Object;

		/**
		* Index of vertices for stroke shape.
		* @property strokePolyVertices
		* @type {array}
		* @public
		*/
		public strokePolyVertices: Object;

		/**
		* Constructs a miter, a building block for strokes.
		* Miters sit atop vertices and form the endpoints for two stroke segments.
		* @method _buildMiter
		* @param line1 {Array} The first line, an array of 2 Points
		* @param line2 {Array} The second line, an array of 2 Points;
		* the first point on line2 is the actual position of the miter
		* @return {Object}
		* @private
		*/
		private _buildMiter(line1: Object, line2: Object): Object;

		/**
		* Construct a stroke by tracing a connection through all vertices.
		* @method _buildStroke
		* @param srcIndices {Array} List of points to connect in order.
		* @param srcVertices {Array} Definition of points.
		* @private
		*/
		private _buildStroke(srcIndices: Object, srcVertices: Object): void;

		/**
		* Creates a copy of this polygon.
		* @method clone
		* @return {Kiwi.Plugins.Primitives.Polygon}
		* @public
		*/
		public clone(): Kiwi.Plugins.Primitives.Polygon;

		/**
		* Determines the min and max x and y coordinates from an array.
		* @method computeMinMaxXY
		* @param array {Array} Array of points, defined as arrays [ x, y ]
		* @return object
		* @public
		*/
		public computeMinMaxXY(array: Object): any;

		/**
		* Adds another poly to this.
		* @method combine
		* @param poly {Kiwi.Plugins.Primitives.Polygon} Primitive to combine.
		* @param [discard=true] {Boolean} Discard the combination source?
		* @return {Boolean}
		* @public
		*/
		public combine(poly: Kiwi.Plugins.Primitives.Polygon, discard?: boolean): boolean;

		/**
		* Reports an error message.
		* @method complain
		* @param string {String} Text to report
		* @public
		*/
		public complain(string: string): void;

		/**
		* Put a stroke on this Polygon, following the strokeIndices vertex list.
		* You should not need to do this manually.
		* @method createstroke
		* @return boolean
		* @public
		*/
		public createstroke(): any;

		/**
		* Initialise internal properties
		* @method _initProperties
		* @private
		*/
		private _initProperties(): void;

		/**
		* Part of the WebGL rendering pipeline
		* @property glRenderer
		* @type Kiwi.Renderers.Renderer
		* @public
		*/
		public glRenderer: Kiwi.Renderers.Renderer;

		/**
		* Returns the type of object that this is.
		* @method objType
		* @return {String}
		* @public
		*/
		public objType(): string;

		/**
		* Sets default parameters on primitive. Note that this will redefine the
		* entire primitive. If you call parseParams after creation, you will have to
		* take steps to preserve any shape, style, or transform data you wish to keep.
		* @method parseParams
		* @param params {Object} The param objects
		* @return boolean
		* @public
		*/
		public parseParams(params: Object): any;

		/**
		* RGB color triplet, normalized to the range 0-1
		* @property color
		* @type {array}
		* @public
		*/
		public color: Object;

		/**
		* Whether the fill will draw
		* @property drawFill
		* @type {boolean}
		* @public
		*/
		public drawFill: boolean;

		/**
		* Whether the stroke will draw
		* @property drawFill
		* @type {boolean}
		* @public
		*/
		public drawFill: boolean;

		/**
		* Whether to enable input
		* @property enableInput
		* @type {Boolean}
		* @public
		*/
		public enableInput: boolean;

		/**
		* RGB color triplet, normalized to the range 0-1
		* @property strokeColor
		* @type {array}
		* @public
		*/
		public strokeColor: Object;

		/**
		* Width of the stroke, in pixels. If the primitive is scaled, the stroke
		* will also change size.
		* @property strokeWidth
		* @type {number}
		* @public
		*/
		public strokeWidth: number;

		/**
		* Perform a strict compliance check on data. If this fails,
		* it's because somebody passed bad data.
		* @method parseStrict
		* @return boolean
		* @public
		*/
		public parseStrict(): any;

		/**
		* Compute width, height, box, anchor points etc
		* @method rebuildBounds
		* @public
		*/
		public rebuildBounds(): void;

		/**
		* Software rendering method
		* @method render
		* @param camera {Kiwi.Camera}
		* @public
		*/
		public render(camera: Kiwi.Camera): void;

		/**
		* Hardware rendering method using WebGL
		* @method renderGL
		* @param gl {WebGLRenderingContext}
		* @param camera {Kiwi.Camera}
		* @param params {Object}
		* @undefined
		*/
		renderGL(gl: WebGLRenderingContext, camera: Kiwi.Camera, params: Object): void;

		/**
		* Decompose a polygon into its constituent triangles.
		* This will destroy the original polygon and substitute a group
		* containing the triangles.
		* @method shatter
		* @return {Kiwi.Group}
		* @public
		*/
		public shatter(): Kiwi.Group;

		/**
		* Automatically called once per update loop.
		* Handles input. If you override this, make sure to call the prototype:
		* <code>Kiwi.Plugins.prototype.update.calL( this );</code>
		* @method update
		* @public
		*/
		public update(): void;

	}
}

/**
* @module Plugins
* @submodule Primitives
*/
declare module Kiwi.Plugins.Primitives {
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
	* 	drawStroke: false,<br>
	* 	radius: 32,<br>
	* 	state: MyGame.state,<br>
	* 	segments: 6<br>
	* } );
	*
	* @class Ellipse
	* @extends Polygon
	* @namespace Kiwi.Plugins.Primitives
	* @constructor
	* @param params {Object} Parameter object
	*   @param state {Kiwi.State} Current state
	*   @param [centerOnTransform=false] {Boolean} If true, ellipse is centered
	*   	on transform; if false, ellipse has top left corner on transform
	*   @param [height=8] {Number} Height of the ellipse
	*   @param [radius] {Number} Radius of a circle; overide width and height
	*   @param [radiusPointer=false] {Boolean} Whether to draw the radius,
	*   	useful for debugging rotation on circles.
	*   @param [segments=32] {Number} Number of radial segments; detail.
	*   @param [width=8] {Number} Width of the ellipse
	*/
	class Ellipse extends Kiwi.Plugins.Primitives.Polygon {
		constructor(params: Object);

	}
}

/**
* @module Plugins
* @submodule Primitives
*/
declare module Kiwi.Plugins.Primitives {
	/**
	* Line Primitive
	* <br><br>
	* Create a line primitive. Define a params object including a reference
	* to the current state. You may also add style parameters from the Polygon.
	* For example:
	* <br><br>
	* new Kiwi.Plugins.Primitives.Line( {<br>
	* 	points: [ [ 0, 0 ], [ 100, 100 ], [ 200, 0 ] ],<br>
	* 	state: MyGame.state,<br>
	* 	strokeColor: [ 1, 0.1, 1 ],<br>
	* 	strokeWidth: 4<br>
	* } );
	*
	* @class Line
	* @extends Polygon
	* @namespace Kiwi.Plugins.Primitives
	* @constructor
	* @param params {Object} Parameter object
	*   @param state {Kiwi.State} Current state
	*   @param [points] {Array} Array of x,y points to connect with lines
	*/
	class Line extends Kiwi.Plugins.Primitives.Polygon {
		constructor(params: Object);

	}
}

/**
* @module Plugins
* @submodule Primitives
*/
declare module Kiwi.Plugins.Primitives {
	/**
	* Rectangle Primitive
	* <br><br>
	* Create a rectangular primitive. Define a params object including a reference
	* to the current state. You may also add style parameters from the Polygon.
	* For example:
	* <br><br>
	* new Kiwi.Plugins.Primitives.Rectangle( {<br>
	* 	state: MyGame.state,<br>
	* 	color: [ 0.9, 0.3, 0.7 ],<br>
	* 	strokeWidth: 4,<br>
	* 	width: 32,<br>
	* 	height: 16<br>
	* } );
	*
	* @class Rectangle
	* @extends Polygon
	* @namespace Kiwi.Plugins.Primitives
	* @constructor
	* @param params {Object} Parameter object
	*   @param state {Kiwi.State} Current state
	*   @param [centerOnTransform=true] {Boolean} If true, rectangle is centered
	*   	on transform; if false, rectangle has top left corner on transform
	*   @param [height=8] {Number} Height of the rectangle
	*   @param [width=8] {Number} Width of the rectangle
	*/
	class Rectangle extends Kiwi.Plugins.Primitives.Polygon {
		constructor(params: Object);

	}
}

/**
* @module Plugins
* @submodule Primitives
*/
declare module Kiwi.Plugins.Primitives {
	/**
	* Star Primitive
	* <br><br>
	* Create a star primitive. Define a params object including a reference
	* to the current state. You may also add style parameters from the Polygon.
	* <br><br>
	* You may draw semi-random stars. For example, to draw a cartoon impact flare:
	* <br><br>
	* new Kiwi.Plugins.Primitives.Star( {<br>
	* 	centerOnTransform: true,<br>
	* 	color: [ 1, 0.01, 1 ],<br>
	* 	drawStroke: false,<br>
	* 	radius: 32,<br>
	* 	spikeRandom: 1,<br>
	* 	state: MyGame.state,<br>
	* 	segments: 16<br>
	* } );
	*
	* @class Star
	* @extends Polygon
	* @namespace Kiwi.Plugins.Primitives
	* @constructor
	* @param params {Object} Parameter object
	*   @param state {Kiwi.State} Current state
	*   @param [centerOnTransform=false] {Boolean} If true, star is centered
	*   	on transform; if false star has top left corner on transform
	*   @param [height=8] {Number} Height of the star
	*   @param [spikeLength=1] {Number} Length of spikes relative to radius
	*   @param [spikeRandom=0] {Number} Randomness of star spikes, where 0 is
	*   	no randomness and 1 will make some spikes up to twice as long;
	*   	there is no cap.
	*   @param [radius] {Number} Radius of a star; overide width and height
	*   @param [segments=32] {Number} Number of points
	*   @param [width=8] {Number} Width of the star
	*/
	class Star extends Kiwi.Plugins.Primitives.Polygon {
		constructor(params: Object);

	}
}

/**
* @module Plugins
* @submodule Primitives
*/
declare module Kiwi.Plugins.Primitives {
	/**
	* Triangle Primitive
	* <br><br>
	* Create a triangle primitive. Define a params object including a reference
	* to the current state. You may also add style parameters from the Polygon.
	* For example:
	* <br><br>
	* new Kiwi.Plugins.Primitives.Triangle( {<br>
	* 	points: [ [ 0, 0 ], [ 100, 100 ], [ 200, 0 ] ],<br>
	* 	state: MyGame.state,<br>
	* 	x: 10,<br>
	* 	y: 10,<br>
	* 	scale: 2<br>
	* } );
	* <br><br>
	* If you do not specify points in the param object, the Triangle will default to
	* [ [ 0, 0 ], [ 0, 8 ], [ 8, 0 ] ]
	*
	* @class Triangle
	* @extends Polygon
	* @namespace Kiwi.Plugins.Primitives
	* @constructor
	* @param params {Object} Parameter object
	*   @param state {Kiwi.State} Current state
	*   @param [points] {Array} Array of x,y pairs to form triangle's corners.
	*/
	class Triangle extends Kiwi.Plugins.Primitives.Polygon {
		constructor(params: Object);

	}
}

/**
* @module Plugins
* @submodule Primitives
*/
declare module Kiwi.Plugins.Primitives {
	/**
	* Null Texture Atlas interfaces with KiwiJS rendering system
	* which expects a texture atlas, and provides it with an atlas
	* that has no texture.
	*
	* @class NullAtlas
	* @namespace Kiwi.Plugins.Primitives
	* @constructor
	*/
	class NullAtlas {
		constructor();

		/**
		* texture manager requirements. Parameters don't matter.
		* @method enableGL
		* @public
		*/
		public enableGL(): void;

	}
}

/**
* @module Kiwi
* @submodule Renderers
*/
declare module Kiwi.Renderers {
	/**
	* Primitive Renderer
	* <br><br>
	* This renders primitives using triangle strips.
	*
	* @class PrimitiveRenderer
	* @namespace Kiwi.Renderers
	* @constructor
	* @param gl {WebGLRenderingContext} The WebGL rendering context in use.
	* @param shaderManager {Kiwi.Renderers.ShaderManager} The Kiwi shader manager.
	*/
	class PrimitiveRenderer {
		constructor(gl: WebGLRenderingContext, shaderManager: Kiwi.Renderers.ShaderManager);

		/**
		* Returns a null atlas so that all primitives share a texture object.
		* @method getAtlas
		* @return Kiwi.Plugins.Primitives.NullAtlas
		* @public
		*/
		public getAtlas(): any;

		/**
		* Enables the renderer for drawing
		* @method enable
		* @param gl {WebGLRenderingContext}
		* @param [params=null] {Object}
		* @public
		*/
		public enable(gl: WebGLRenderingContext, params?: Object): void;

		/**
		* Disables the renderer
		* @method disable
		* @param gl {WebGLRenderingContext}
		* @public
		*/
		public disable(gl: WebGLRenderingContext): void;

		/**
		* Clears the vertex buffer
		* @method clear
		* @param gl {WebGLRenderingContext}
		* @public
		*/
		public clear(gl: WebGLRenderingContext): void;

		/**
		* Updates the stage resolution uniforms
		* @method updateStageResolution
		* @param gl {WebGLRenderingContext}
		* @param res {Float32Array}
		* @public
		*/
		public updateStageResolution(gl: WebGLRenderingContext, res: Float32Array): void;

		/**
		* Sets shader pair by name
		* @method setShaderPair
		* @param shaderPair {String}
		* @public
		*/
		public setShaderPair(shaderPair: string): void;

		/**
		* Collates all xy and uv coordinates into a buffer
		* ready for upload to video memory
		* @method _collateVertexAttributeArrays
		* @param gl {WebGLRenderingContext}
		* @param entity {Kiwi.Entity}
		* @param camera {Camera}
		* @public
		*/
		public _collateVertexAttributeArrays(gl: WebGLRenderingContext, entity: Kiwi.Entity, camera: Camera): void;

		/**
		* Makes a draw call. This is where things actually
		* get rendered to the draw buffer (or a framebuffer).
		* @method draw
		* @param gl {WebGLRenderingContext}
		* @public
		*/
		public draw(gl: WebGLRenderingContext): void;

	}
}

/**
* @module Kiwi
* @submodule Shaders
*/
declare module Kiwi.Shaders {
	/**
	* Primitive Shader Pair
	*
	* @class PrimitiveShader
	* @namespace Kiwi.Shaders
	* @constructor
	*/
	class PrimitiveShader {
		constructor();

	}
}
