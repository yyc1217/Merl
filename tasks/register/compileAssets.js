module.exports = function (grunt) {
	grunt.registerTask('compileAssets', [
		'clean:dev',
		'jst:dev',
		'less:dev',
		'autoprefixer',
		'copy:dev',
		'coffee:dev'
	]);
};
