'use strict';
var gulp = require('gulp');
var babel = require('gulp-babel');
require("babel-register");

gulp.task('lib', function () {
  return gulp.src(['lib/**/*.js', 'lib/**/*.jsx'])
    .pipe(babel())
    .pipe(gulp.dest('dist/lib'));
});

gulp.task('main', function () {
  return gulp.src(['index.js'])
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('default',['lib','main']);
