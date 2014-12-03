module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig( {
		pkg: grunt.file.readJSON( "package.json" ),

		BASE_PATH: "",
		DEVELOPMENT_PATH: "",

		yuidoc: {
			compile: {
				name: "<%= pkg.name %>",
				description: "<%= pkg.description %>",
				version: "<%= pkg.version %>",
				url: "<%= pkg.homepage %>",
				options: {
					extension: ".js",
					paths: "<%= DEVELOPMENT_PATH %>" + "src/",
					outdir: "<%= BASE_PATH %>" + "docs/",
					exclude: "**/*.min.js"
				}
			}
		},

		uglify: {
			build: {
				files: {
				"src/<%= pkg.name %>.min.js": [ "<%= pkg.main %>" ]
				}
			}
		},

		jshint: {
			src: "src/**",
			options: {
				camelcase: true,
				curly: true,
				eqeqeq: true,
				eqnull: true,
				newcap: true,
				quotmark: "double"
			}
		}

	});

	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-yuidoc" );
	grunt.loadNpmTasks( "grunt-contrib-jshint" );

	grunt.registerTask( "default", [ "jshint", "uglify:build" ] );
	grunt.registerTask( "full", [ "jshint", "uglify:build",
		"yuidoc:compile" ] );
};
