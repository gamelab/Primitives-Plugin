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
				"build/<%= pkg.name %>-<%= pkg.version %>.min.js": [ "<%= pkg.main %>" ]
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
		},

		copy: {
			whole: {
				expand: true,
				cwd: "src/",
				src: "**",
				dest: "build/",
				flatten: true,
				filter: "isFile",
			}
		}

	});

	grunt.loadNpmTasks( "grunt-contrib-uglify" );
	grunt.loadNpmTasks( "grunt-contrib-yuidoc" );
	grunt.loadNpmTasks( "grunt-contrib-jshint" );
	grunt.loadNpmTasks( "grunt-contrib-copy" );

	grunt.registerTask( "default", [ "jshint", "copy:whole", "uglify:build" ] );
	grunt.registerTask( "full", [ "jshint", "copy:whole", "uglify:build",
		"yuidoc:compile" ] );
};
