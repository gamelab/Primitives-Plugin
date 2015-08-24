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
	version:"1.0.4",

	minimumKiwiVersion:"1.3.0"

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
	
};

