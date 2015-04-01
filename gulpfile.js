var gulp = require('gulp');
var mocha = require('gulp-mocha');
var mongoose = require('mongoose');

gulp.task('default', function () {

	mongoose.connect('mongodb://127.0.0.1/mongooseRelativesTest', function () {
		gulp.src(['spec/**/*-spec*'], {
				read: false
			}).pipe(mocha({
				includeStack: true
			}))
			.on('end', function () {
				process.exit();
			});
	});
});