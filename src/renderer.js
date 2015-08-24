

/**
* Primitive Renderer
* <br><br>
* This renders primitives using triangle strips.
* @class PrimitiveRenderer
* @constructor
* @namespace Kiwi.Renderers
* @param gl {WebGLRenderingContext} The WebGL rendering context in use.
* @param shaderManager {Kiwi.Renderers.ShaderManager} The Kiwi shader manager.
* @since 0.1.0
*/
Kiwi.Renderers.PrimitiveRenderer = function( gl, shaderManager ) {
	this.bufferItemSize = 6;
	this.indices = [];
	this.nullAtlas = new Kiwi.Plugins.Primitives.NullAtlas();
	this._tempPoint = new Kiwi.Geom.Point( 0, 0 );
	this._maxItems = 1000;
	this._vertexBuffer =
		new Kiwi.Renderers.GLArrayBuffer( gl, this.bufferItemSize );
	this._indexBuffer = new Kiwi.Renderers.GLElementArrayBuffer( gl, 1, [] );

	// Perform super functionality
	Kiwi.Renderers.Renderer.call( this, gl, shaderManager, true );

	this.setShaderPair( "PrimitiveShader" );
};
Kiwi.extend( Kiwi.Renderers.PrimitiveRenderer, Kiwi.Renderers.Renderer );

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
* Clears the vertex buffer
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

	// Because we cannot guarantee winding order, we must always assume
	// that we will require two connectors, except for the first triangle.
	if ( this.indices.length > 0 ) {
		this.indices.push( this.indices[ this.indices.length - 1 ] );
		this.indices.push( indices[ 0 ] + indexOffset );
	}

	for ( i = 0; i < indexLen; i++ ) {
		this.indices.push( indices[ i ] + indexOffset );
	}
};

/**
* Makes a draw call. This is where things actually
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

