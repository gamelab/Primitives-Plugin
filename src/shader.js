
/**
* Primitive Shader Pair
* @class PrimitiveShader
* @constructor
* @namespace Kiwi.Shaders
* @since 0.1.0
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
		"	vec2 pos = ( uCamMatrix * vec3( aXY, 1 ) ).xy; ",
		"	gl_Position = vec4( ( pos / uResolution * 2.0 - 1.0 ) *",
		"		vec2(1 , -1 ), 0, 1 );",
		"	vRGBA = aRGBA;",
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
