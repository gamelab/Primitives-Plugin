
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
	this.cells = [ { hitboxes: [] } ];
};

/** Dummy texture enable method, doing the bare minimum to satisfy the
* texture manager requirements. Parameters don't matter.
* @method enableGL
* @public
* @since 0.1.0
*/
Kiwi.Plugins.Primitives.NullAtlas.prototype.enableGL = function() {};

