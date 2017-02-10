'use strict';
var gulp = require('gulp');
var babel = require('gulp-babel');
require("babel-register");

gulp.task('src', function () {
  return gulp.src(['src/**/*.js'])
    .pipe(babel())
    .pipe(gulp.dest('dist/'));
});


gulp.task('default',['src']);
