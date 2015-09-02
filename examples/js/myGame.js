var gameOptions = {
	renderer: Kiwi.RENDERER_CANVAS
},
	MyGame = {};

MyGame.game = new Kiwi.Game( null, "game", null, gameOptions );

MyGame.state = new Kiwi.State( "state" );

MyGame.state.preload = function() {
	Kiwi.State.prototype.preload.call(this);
};

MyGame.state.create = function() {
	var blobFloaterAng, blobFloaterDist, blobGlowRenderer,
		i, params, vignetteStep,
		xStart = 120,
		xStep = 80;

	this.foregroundObjects = [];

	// Demo triangles
	params = {
		state: this,
		points: [ [ 25, 0 ], [ 50, 60 ], [ 0, 60 ] ],
		x: xStart,
		y: 80,
		color: [ 1.0, 0.2, 0.1 ]
	};
	this.triangleStroke = new Kiwi.Plugins.Primitives.Triangle( params );

	params.drawStroke = false;
	params.x += xStep;
	params.color = [ 1.0, 0.3, 0.1 ];
	this.triangleNoStroke = new Kiwi.Plugins.Primitives.Triangle( params );

	params.drawStroke = true;
	params.drawFill = false;
	params.x += xStep;
	this.triangleNoFill = new Kiwi.Plugins.Primitives.Triangle( params );

	// Demo rectangles
	params = {
		state: this,
		width: 50,
		height: 60,
		x: xStart,
		y: 180,
		color: [ 1.0, 0.4, 0.1 ]
	};
	this.rectangleStroke = new Kiwi.Plugins.Primitives.Rectangle( params );

	params.drawStroke = false;
	params.x += xStep;
	params.color = [ 1.0, 0.5, 0.1 ];
	this.rectangleNoStroke = new Kiwi.Plugins.Primitives.Rectangle( params );

	params.drawStroke = true;
	params.drawFill = false;
	params.x += xStep;
	this.rectangleNoFill = new Kiwi.Plugins.Primitives.Rectangle( params );

	// Demo ellipses
	params = {
		state: this,
		width: 50,
		height: 40,
		x: xStart,
		y: 280,
		color: [ 1.0, 0.6, 0.1 ]
	};
	this.ellipseStroke = new Kiwi.Plugins.Primitives.Ellipse( params );

	params.drawStroke = false;
	params.x += xStep;
	params.color = [ 1.0, 0.7, 0.1 ];
	this.ellipseNoStroke = new Kiwi.Plugins.Primitives.Ellipse( params );

	params.drawStroke = true;
	params.drawFill = false;
	params.x += xStep;
	this.ellipseNoFill = new Kiwi.Plugins.Primitives.Ellipse( params );

	// Demo stars
	params = {
		state: this,
		radius: 16,
		segments: 5,
		x: xStart,
		y: 380,
		color: [ 1.0, 0.8, 0.1 ]
	};
	this.starStroke = new Kiwi.Plugins.Primitives.Star( params );

	params.drawStroke = false;
	params.x += xStep;
	params.color = [ 1.0, 0.9, 0.1 ];
	this.starNoStroke = new Kiwi.Plugins.Primitives.Star( params );

	params.drawStroke = true;
	params.drawFill = false;
	params.x += xStep;
	this.starNoFill = new Kiwi.Plugins.Primitives.Star( params );

	// Demo lines
	params = {
		state: this,
		x: xStart,
		y: 480,
		strokeColor: [ 0.3, 1.0, 0.1 ],
		strokeWidth: 3,
		points: [ [ xStep * 2.8, 0 ] ]
	};
	for ( i = 0; i < xStep * 2.8; i += 4 ) {
		params.points.push( [
			i,
			16 * Math.sin( i * 0.1 )
		]);
	}
	this.line = new Kiwi.Plugins.Primitives.Line( params );

	// Background vignette
	this.vignette = new Kiwi.Group( this );
	vignetteStep = 16;
	for ( i = 0; i < 4; i++ ) {
		params = {
			state: this,
			width: this.game.stage.width - 2 * vignetteStep * i,
			height: this.game.stage.height - 2 * vignetteStep * i,
			x: vignetteStep * i,
			y: vignetteStep * i,
			drawStroke: false,
			color: [ 1.0, 0.6, 0.8 ],
			alpha: 0.2
		};
		this.vignette.addChild(
			new Kiwi.Plugins.Primitives.Rectangle( params ) );
	}



	Kiwi.State.prototype.create.call(this);


	// Define background
	this.game.stage.color = "000000";

	// Construct scene graph
	this.addChild( this.encase( this.vignette ) );

	this.addChild( this.encase( this.triangleStroke ) );
	this.addChild( this.encase( this.triangleNoStroke ) );
	this.addChild( this.encase( this.triangleNoFill ) );
	this.addChild( this.encase( this.rectangleStroke ) );
	this.addChild( this.encase( this.rectangleNoStroke ) );
	this.addChild( this.encase( this.rectangleNoFill ) );
	this.addChild( this.encase( this.ellipseStroke ) );
	this.addChild( this.encase( this.ellipseNoStroke ) );
	this.addChild( this.encase( this.ellipseNoFill ) );
	this.addChild( this.encase( this.starStroke ) );
	this.addChild( this.encase( this.starNoStroke ) );
	this.addChild( this.encase( this.starNoFill ) );
	this.addChild( this.encase( this.line ) );

	// Construct foreground object list
	this.foregroundObjects.push( this.triangleStroke );
	this.foregroundObjects.push( this.triangleNoStroke );
	this.foregroundObjects.push( this.triangleNoFill );
	this.foregroundObjects.push( this.rectangleStroke );
	this.foregroundObjects.push( this.rectangleNoStroke );
	this.foregroundObjects.push( this.rectangleNoFill );
	this.foregroundObjects.push( this.ellipseStroke );
	this.foregroundObjects.push( this.ellipseNoStroke );
	this.foregroundObjects.push( this.ellipseNoFill );
	this.foregroundObjects.push( this.starStroke );
	this.foregroundObjects.push( this.starNoStroke );
	this.foregroundObjects.push( this.starNoFill );
	this.foregroundObjects.push( this.line );
};

MyGame.state.update = function() {
	var i, fo,
		wobble = 4,
		wobbleRotation = 0.03;

	Kiwi.State.prototype.update.call( this );

	// Wobble foreground geometries
	for ( i = 0; i < this.foregroundObjects.length; i++ ) {
		fo = this.foregroundObjects[ i ];
		fo.x = wobble * Math.cos( this.game.idealFrame * 0.01 + i * i );
		fo.y = wobble * Math.sin( this.game.idealFrame * 0.011 + i * i );
		fo.rotation = wobbleRotation *
			Math.sin( this.game.idealFrame * 0.013 + i * i );
	}
};

// Push a GameObject into a group, and transfer its transforms to the group.
MyGame.state.encase = function( entity ) {
	var group = new Kiwi.Group( this );

	group.addChild( entity );
	group.x = entity.x;
	group.y = entity.y;
	entity.x = 0;
	entity.y = 0;

	return group;
};

MyGame.game.states.addState( MyGame.state );
MyGame.game.states.switchState( "state" );