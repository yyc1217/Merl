/**
 * Autoprefixer parses CSS and adds vendor-prefixed CSS properties using the Can I Use database.
 *
 * ---------------------------------------------------------------
 *
 */
module.exports = function(grunt) {

	grunt.config.set('autoprefixer', {
		options: {
		  browsers: ['last 2 versions']
		},
		
	    // prefix all files
		no_dest: {
		  src: '.tmp/public/styles/*.css',
		},
	});

	grunt.loadNpmTasks('grunt-autoprefixer');
};