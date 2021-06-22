const { series, parallel } = require('gulp');
const del = require('del');
const gulp = require('gulp');
const ts = require('gulp-typescript');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
var runElectron = require("gulp-run-electron");
const { exec } = require('child_process');
var deploy      = require('gulp-gh-pages');

const tsProject = ts.createProject('tsconfig.json');


// Run the app in electron
var run = function () {
    return gulp.src("dist")
        .pipe(runElectron(["dist/app.js"], {}));
};

// Helper to browserify, bundle and compile code for a view
var makeBundle = function(toBundle,bundleName)
{
    return function () {
        return browserify({
            basedir: 'src',
            debug: true,
            entries: toBundle,
            cache: {},
            packageCache: {}
        })
            .plugin(tsify)
            .external('electron')
            .bundle()
            .pipe(source(bundleName))
            .pipe(gulp.dest('dist'));
    }
}

// Create bundles for the views in parallel
var bundle = parallel([
    makeBundle(['simmapper.ts'],'simmapper.js'),
    makeBundle(['data.ts'],'data.js'),
]);

// Compile the electron app
var compile = function () {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest('dist'));
};

// Copy html, css and images to dest folder
var copy = parallel([
    function() {return gulp.src(['view/**/*']).pipe(gulp.dest('dist/view/'))},
    function() {return gulp.src(['package.json']).pipe(gulp.dest('dist/'))}
]);

// Delete the target folder
var clean = function(){
    return del(['dist/**', 'dist'], {force:true});
};

function app() {
    return exec('electron-packager dist');
}

exports.clean = clean;
exports.build = series(clean, bundle, compile, copy);
exports.run = run;
exports.app = app;
exports.default = series(clean, bundle, compile, copy, run);

