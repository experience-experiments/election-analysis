// Generated on 2015-04-16 using
// generator-webapp 0.5.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Configurable paths
	var config = {
		app: 'app',
		dist: 'dist'
	};

	var awsConfig = {};

	// Define the configuration for all the tasks
	grunt.initConfig({

		// Project settings
		config: config,

		s3: {
			options: {
				accessKeyId: "<%= awsConfig.accessKeyId %>",
				secretAccessKey: "<%= awsConfig.secretAccessKey %>",
				bucket: "election2015.rmalabs.com",
				region: "eu-west-1",
				access: "public-read",
				gzip: true
			},
			publish: {
				cwd: "dist/",
				src: "**"
			}
		},

		// Watches files for changes and runs tasks based on the changed files
		watch: {
			js: {
				files: ['<%= config.app %>/scripts/{,*/}*.js'],
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			styles: {
				files: ['<%= config.app %>/styles/{,*/}*.css'],
				tasks: ['newer:copy:styles']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'<%= config.app %>/{,*/}*.html',
					'.tmp/styles/{,*/}*.css'
				]
			}
		},

		// The actual grunt server settings
		connect: {
			options: {
				port: 9000,
				open: true,
				livereload: 35729,
				// Change this to '0.0.0.0' to access the server from outside
				hostname: 'localhost'
			},
			livereload: {
				options: {
					middleware: function(connect) {
						return [
							connect.static('.tmp'),
							connect().use('/bower_components', connect.static('./bower_components')),
							connect.static(config.app)
						];
					}
				}
			},
			dist: {
				options: {
					base: '<%= config.dist %>',
					livereload: false
				}
			}
		},

		// Empties folders to start fresh
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'<%= config.dist %>/*',
						'!<%= config.dist %>/.git*'
					]
				}]
			},
			server: '.tmp'
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [
				'Gruntfile.js',
				'<%= config.app %>/scripts/{,*/}*.js'
			]
		},

		// Copies remaining files to places other tasks can use
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= config.app %>',
					dest: '<%= config.dist %>',
					src: [
						'scripts/*.js',
						'data/*.json',
						'data/edited.svg',
						'styles/*.css',
						'{,*/}*.html'
					]
				}, {
					expand: true,
					dot: true,
					cwd: 'bower_components',
					src: [
						'bootstrap/dist/css/bootstrap.min.css',
						'd3/d3.min.js'
					],
					dest: '<%= config.dist %>/bower_components/'
				}]
			},
			styles: {
				expand: true,
				dot: true,
				cwd: '<%= config.app %>/styles',
				dest: '.tmp/styles/',
				src: '{,*/}*.css'
			}
		},

		// Run some tasks in parallel to speed up build process
		concurrent: {
			server: [
				'copy:styles'
			]
		}
	});


	grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function (target) {
		if (grunt.option('allow-remote')) {
			grunt.config.set('connect.options.hostname', '0.0.0.0');
		}
		if (target === 'dist') {
			return grunt.task.run(['build', 'connect:dist:keepalive']);
		}

		grunt.task.run([
			'clean:server',
			'concurrent:server',
			'connect:livereload',
			'watch'
		]);
	});

	grunt.registerTask('build', [
		'clean:dist',
		'copy:dist'
	]);

	grunt.registerTask('release', function(target) {
		awsConfig = grunt.file.readJSON("aws-s3-credentials.json");
		
		grunt.task.run([
			'build',
			's3:publish'
		]);
	});

	grunt.registerTask('default', [
		'newer:jshint',
		'build'
	]);
};
