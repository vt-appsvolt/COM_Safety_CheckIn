module.exports = function(grunt) {
	'use strict';
	
	// Force use of Unix newlines
	grunt.util.linefeed = '\n';

	var _pkg = grunt.file.readJSON('package.json', { encoding: 'utf8' }),
		concatFiles = {},
		distFiles = {},
		jsHintFiles = [];
	
	function _getPath( name, path ){
		return [_pkg.system.basePath, _pkg.system.js.path, path || '', name, _pkg.system.js.suffix].join('');
	}
	function _isEnabled( enabled ){
		return typeof enabled === 'boolean' && enabled;
	}
	function _registerFile( file ){
		var name = _getPath( file.name, [_pkg.system.js.distPath, file.outputPath || ''].join('') );
		var	location = file.location.map( function(locationName){
					return _getPath(locationName);
				});
		concatFiles[name] = location;
		distFiles[name.replace('.js', '.min.js')] = name;
		if( _isEnabled(file.jsHint) ){
			Array.prototype.push.apply(jsHintFiles, location);
		}
	}
	
	_pkg.system.js.files.forEach( function( file ) {
		if( typeof file.name === 'string' ){
			_registerFile(file);
		}else if( typeof file.components === 'object' ){
			file.components.forEach( function(component) {
				_registerFile(component);
			});
		}
	});
	
	
	grunt.initConfig({
		pkg: _pkg,
		banner: '/*!\n'+
				' * Login v<%= pkg.version %> (<%= grunt.template.today("dd-mm-yyyy") %>)\n'+
				' * Copyright 2019-<%= grunt.template.today("yyyy") %> <%= pkg.author %>'+
				' */\n',
	    concat: {
	      options: {
	        separator: ';',
	        sourceMap: 'true'
	      },
	      basic_and_extras: {
	    	  files: concatFiles
	      }
	    },
	    uglify: {
	      options: {
	        banner: '<%= banner %>'
	      },
	      dist: {
	        files: distFiles
	      }
	    },
	    qunit: {
//	    	options: {
//	    		inject: [_pkg.system.basePath, _pkg.system.js.path, 'tests/unit/phantom.js'].join('')
//	    	},
	    	files: [_pkg.system.basePath, _pkg.system.js.path, 'tests/index.html'].join('')
	    },
	    jshint: {
	      options:{
	    	  globals: _pkg.jshintConfig.core
	      },
	      grunt: {
	    	  src: 'Gruntfile.js'
	      },
	      core: {
	    	  src: jsHintFiles
	      },
	      test: {
	    	 options: {
	    		globals: Object.assign({}, _pkg.jshintConfig.core, _pkg.jshintConfig.test), 
	    	 },
	    	 src: [_pkg.system.basePath, _pkg.system.js.path, 'tests/unit/*.js'].join('')
	      }
	    },
	    watch: {
	      configFiles: {
    	    files: [ 'Gruntfile.js'],
    	    options: {
    	      reload: true
    	    }
    	  },	
	      src: {
	    	  files: [jsHintFiles],
	    	  /*tasks: ['jshint:core', 'qunit', 'concat', 'uglify']*/
	    	  tasks: ['jshint:core', 'concat', 'uglify']
	      },
	      test: {
	    	  files: [ [_pkg.system.basePath, _pkg.system.js.path, 'tests/unit/*.js'].join('') ],
	    	  tasks: ['jshint:test', 'qunit']
	      }
	    }
	  });
	
	  grunt.loadNpmTasks('grunt-contrib-uglify');
	  grunt.loadNpmTasks('grunt-contrib-jshint');
	  grunt.loadNpmTasks('grunt-contrib-qunit');
	  grunt.loadNpmTasks('grunt-contrib-watch');
	  grunt.loadNpmTasks('grunt-contrib-concat');
	
	  grunt.registerTask('test', ['jshint:core', 'jshint:test', 'jshint:grunt']); /*grunt.registerTask('test', ['jshint:core', 'jshint:test', 'jshint:grunt', 'qunit']);*/
	  grunt.registerTask('default', ['test', 'concat', 'uglify']);
};