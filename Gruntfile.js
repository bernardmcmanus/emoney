module.exports = function( grunt ){
	// always print a stack trace if something goes wrong
	grunt.option( 'stack' , true );

	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),
		gitinfo: {},
		clean: {
			'dist': [ 'dist' ],
			'compiled': [ 'compiled' ],
			'test': [ 'test/*.compiled.js*' ]
		},
		jshint: {
			all: 'src/**/*.js',
			options: { esnext: true }
		},
		'import-clean': {
			all: 'src/**/*.js'
		},
		browserify: {
			options: {
				transform: [
					[ 'babelify' , { presets: [ 'es2015' ]}]
				],
				plugin: [
					[ 'browserify-derequire' ]
				],
				browserifyOptions: {
					'paths': [ 'src' ],
					'debug': 'debug',
					'standalone': 'E$'
				}
			},
			compiled: {
				files: {
					'compiled/<%= pkg.name %>.js': 'src/index.js'
				}
			},
			test: {
				files: {
					'test/imports.compiled.js': 'test/imports.js'
				}
			}
		},
		wrap: {
			options: {
				args: (function(){
					var args = [
						['$global','this'],
						'Array',
						'Object',
						'Date',
						'Error',
						['UNDEFINED']
					];

					var leadingWrapArgs = args.map(function( arg ){
						return Array.isArray( arg ) ? arg.shift() : arg;
					})
					.filter(function( arg ){
						return !!arg;
					});

					var trailingWrapArgs = args.map(function( arg ){
						return Array.isArray( arg ) ? arg.pop() : arg;
					})
					.filter(function( arg ){
						return !!arg;
					});

					return {
						leading: leadingWrapArgs,
						trailing: trailingWrapArgs
					};
				}()),
				wrapper: [
					'(function(<%= wrap.options.args.leading %>){\n"use strict";\n',
					'\n}(<%= wrap.options.args.trailing %>))'
				]
			},
			compiled: {
				files: {
					'compiled/<%= pkg.name %>.js': 'compiled/<%= pkg.name %>.js'
				}
			},
			test: {
				files: {
					'test/imports.compiled.js': 'test/imports.compiled.js'
				}
			}
		},
		exorcise: {
			compiled: {
				files: {
					'compiled/<%= pkg.name %>.js.map': 'compiled/<%= pkg.name %>.js'
				}
			},
			test: {
				files: {
					'test/imports.compiled.js.map': 'test/imports.compiled.js'
				}
			}
		},
		concat: {
			options: {
				banner: '<%= pkg.config.banner %>\n'
			},
			compiled: {
				files: {
					'compiled/<%= pkg.name %>.js': 'compiled/<%= pkg.name %>.js'
				}
			}
		},
		uglify: {
			options: {
				banner: '<%= pkg.config.banner %>'
			},
			compiled: {
				files: {
					'compiled/<%= pkg.name %>.min.js': 'compiled/<%= pkg.name %>.js'
				}
			}
		},
		mochaTest: {
			dist: { src: 'test' }
		},
		copy: {
			dist: {
				files: [{
					expand: true,
					src: '*',
					dest: 'dist/',
					cwd: 'compiled/'
				}]
			}
		},
		watch: {
			options: { interrupt: true },
			debug: {
				files: [ 'src/**/*.js' , 'test/!(*.compiled).js' ],
				tasks: [ 'test' ]
			}
		},
		'release-describe': {
			dist: {
				files: {
					'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js'
				}
			}
		},
	});
	
	grunt.loadTasks( 'tasks' );
	
	[
		'grunt-contrib-jshint',
		'grunt-contrib-clean',
		'grunt-contrib-concat',
		'grunt-contrib-uglify',
		'grunt-contrib-watch',
		'grunt-import-clean',
		'grunt-browserify',
		'grunt-gitinfo',
		'grunt-contrib-copy',
		'grunt-mocha-test',
		'grunt-exorcise',
		'grunt-wrap'
	]
	.forEach( grunt.loadNpmTasks );

	grunt.registerTask( 'default' , [
		'clean',
		'build',
		'test',
		'clean:test',
		'uglify',
		'copy:dist',
		'release-describe'
	]);

	grunt.registerTask( 'build' , [
		'jshint',
		'import-clean',
		'gitinfo',
		'browserify',
		'wrap',
		'exorcise',
		'concat'
	]);

	grunt.registerTask( 'test' , function(){
		try {
			grunt.task.requires( 'build' );
		}
		catch( err ){
			grunt.task.run( 'build' );
		}
		grunt.task.run( 'mochaTest' );
	});

	grunt.registerTask( 'debug' , [
		'test',
		'watch:debug'
	]);
};
