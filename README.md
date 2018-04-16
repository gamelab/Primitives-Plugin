Primitives Plugin for KiwiJS
============================

	Version: 1.0.4
	Type: GameObject
	Author: Benjamin D. Richards for KiwiJS Team
	Website: www.kiwijs.org
	Kiwi.js Version Last Tested: 1.4.0


Versions:
---------

1.1.0
- Alter shaders for compatibility with KiwiJS 1.5.0

1.0.4
- `color` and `strokeColor` properties updated. They now use the `Kiwi.Utils.Color` class under the hood.
- Hitbox offsets now correctly set
- Primitives in Canvas render mode look better, thanks to faster and more accurate draw method

1.0.3
- Improve efficiency in rendering by recycling geometry points
- Add TypeScript type definitions, thanks to Github user @tkyaji

1.0.2
- Fix incompatibility with Canvas rendering
- Correct documentation for Triangle to refer to `points` (not `corners`)
- Fix hitboxes being shared, allowing proper input on multiple primitives

1.0.1
- Add input options as with Kiwi.GameObjects.Sprite
- Add `update()` method to support input
- Differentiate between params set to "0" and "undefined"

1.0.0
- Release

0.4.0
- Implement user-facing primitives
	- Ellipse
	- Line
	- Rectangle
	- Star
	- Triangle

0.3.0
- Implement triangle strip rendering
- Implement polygon stroke
- Implement combine method
- Implement shatter method

0.2.0
- Implement alternative buffer structures to support higher fill rates on devices

0.1.0
- Plugin created


Files/Folders:
--------------

	README.md		 - This readme file.
	build/			- Plugin and minified plugin
	src/			- The source files for the plugin
	docs/		- API documentation
	examples/		- Examples of primitives in action
	.gitignore		- General gitignore stuff.
	gruntfile.js	- A build file that populates folders with the appropriate content. Use this to build docs and minified versions.
	package.json	- Node packages required for the grunt build along with information for the gruntfile - to use when building


Description:
------------

Primitives are simple geometrical objects. They are rendered without textures. Primitives are best for clean, light imagery such as bars, buttons, grids and outlines.

This plugin provides the following primitives:

- Rectangle (including squares)
- Ellipse (including circles)
- Triangle
- Star (any number and length of points)
- Line
- Polygon (construct your own geometries)

This plugin is intended for use with [KiwiJS](http://www.kiwijs.org/).


How to Include:
---------------

Acquire the full plugin, with examples and API documentation, [from Github](https://github.com/gamelab/Primitives-Plugin).

Obtain the latest version of the plugin from the `src/` folder. Use the minified version when possible.

Include this in your html file after the Kiwi library:

```
<script src="libs/kiwi.js"></script>
<script src="libs/primitives.min.js"></script>
```


User's Guide:
-------------

Create and use primitives as you would create a normal GameObject such as a Sprite.

Primitives use a `params` object to receive all their configuration. This object must contain a reference to the current state. Different primitives have different configuration options, but they all share certain core style and rendering options. You do not have to specify any parameters except the current state; the primitive will select default values.

You cannot (easily) modify a primitive's structure after creation. You can only transform it using translation, rotation and scale. You may also use the `clone()`, `combine()` and `shatter()` methods.

Consult the API documentation in `docs/` for complete documentation.

The following cheat sheet shows the unique properties of all basic primitives.

```javascript
var rectangle = new Kiwi.Plugins.Primitives.Rectangle( {
	state: MyGame.state,
	width: 100,
	height: 50,
	centerOnTransform = true
} );

var triangle = new Kiwi.Plugins.Primitives.Triangle( {
	state: MyGame.state,
	points: [ [ 0, 0 ], [ 0, 100 ], [ 100, 0 ] ]
} );

var line = new Kiwi.Plugins.Primitives.Line( {
	state: MyGame.state,
	points: [ [ 0, 0 ], [ 0, 100 ], [ 100, 0 ] ]
} );

var ellipse1 = new Kiwi.Plugins.Primitives.Ellipse( {
	state: MyGame.state,
	radius: 64,
	segments: 16,
	centerOnTransform = true
} );

var star1 = new Kiwi.Plugins.Primitives.Star( {
	state: MyGame.state,
	radius: 32,
	segments: 8,
	spikeLength: 1,
	spikeRandom: 1,
	centerOnTransform = true
} );

// You may also specify width and height for stars and ellipses.
var ellipse2 = new Kiwi.Plugins.Primitives.Ellipse( {
	state: MyGame.state,
	width: 64,
	height: 64
} );

var star2 = new Kiwi.Plugins.Primitives.Star( {
	state: MyGame.state,
	width: 32,
	height: 16
} );

// You may create a polygon using any geometry you wish to define.
var polygon1 = new Kiwi.Plugins.Primitives.Polygon( {
	state: MyGame.state,
	indices: [ 0, 1, 2, 3 ],
	strokeIndices: [ 0, 1, 2, 0 ],
	vertices: [ [ 0, 0 ], [ 100, 100 ], [ 200, 0 ], [ 300, 100 ] ]
} );

// You may style any primitive using common values.
var polygon2 = new Kiwi.Plugins.Primitives.Polygon( {
	state: MyGame.state,
	color: [ 0.9, 0.6, 0.2 ],
	strokeColor: [ 0, 0, 0 ],
	drawFill: true,
	drawStroke: true,
	lineWidth: 4
} );

// You may specify common Entity properties on any primitive.
// This example redundantly specifies scale, scaleX and scaleY.
var polygon3 = new Kiwi.Plugins.Primitives.Polygon( {
	state: MyGame.state,
	alpha: 0.5,
	visible: true,
	x: 0,
	y: 100,
	scale: 2,
	scaleX: 2,
	scaleY: 2,
	rotation: Math.PI,
	anchorPointX: 0,
	anchorPointY: 100,
	enableInput: true
} );
```


Thank You
---------

We hope you enjoy using primitives in your games. If you have any suggestions, or find any issues with the plugin, don't hesitate to contact us at [KiwiJS](http://www.kiwijs.org/).
