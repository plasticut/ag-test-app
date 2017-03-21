'use strict';

const
    _ = require('lodash'),
    gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    runSequence = require('run-sequence'),
    Path = require('path');

const
    defaultAssets = {
        gulpConfig: 'gulpfile.js',
        server: ['server/**/*.js', 'api/**/*.js'],
        tests: ['tests/bootstrap.js', 'tests/**/*.tests.js']
    };


// Set NODE_ENV to 'test'
gulp.task('env:test', () => process.env.NODE_ENV = 'test' );
gulp.task('env:dev',  () => process.env.NODE_ENV = 'development' );
gulp.task('env:prod', () => process.env.NODE_ENV = 'production' );

// Nodemon task
gulp.task('nodemon', function () {
    return plugins.nodemon({
        script: 'server/index.js',
        nodeArgs: ['--debug'],
        ext: 'js',
        watch: defaultAssets.server
    });
});

// Watch Files For Changes
gulp.task('watch', function () {

    // Add watch rules
    gulp.watch(defaultAssets.server, ['jshint'])

    if (process.env.NODE_ENV === 'production') {
    } else {
        gulp.watch(defaultAssets.gulpConfig, ['jshint']);
    }
});

// JS linting task
gulp.task('jshint', function () {
    var assets = _.union(
        defaultAssets.gulpConfig,
        defaultAssets.server,
        defaultAssets.tests
    );

    return gulp.src(assets)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.jshint.reporter('fail'));
});

// ESLint JS linting task
gulp.task('eslint', function () {
    var assets = _.union(
        defaultAssets.gulpConfig,
        defaultAssets.server,
        defaultAssets.tests
    );

    return gulp.src(assets)
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format());
});


gulp.task('istanbul-init', function () {

    return gulp.src( defaultAssets.server )
        // Covering files
        .pipe( plugins.istanbul() )
        // Force `require` to return covered files
        .pipe( plugins.istanbul.hookRequire() );

});

// Mocha tests task
gulp.task('mocha', ['istanbul-init'], function (done) {

    return gulp.src(defaultAssets.tests, { read: false })
        .pipe(plugins.mocha({
            reporter: 'spec',
            timeout: 10000
        }))
        .pipe( plugins.istanbul.writeReports() )
        // Enforce a coverage of at least 90%
        .pipe( plugins.istanbul.enforceThresholds({ thresholds: { global: 90 } }) );

});




// Lint CSS and JavaScript files.
gulp.task('lint', ['eslint', 'jshint']);

// Run the project tests
gulp.task('test', function (done) {
    runSequence('env:test', 'lint', 'mocha', done);
});

gulp.task('test:server', function (done) {
    runSequence('env:test', 'lint', 'mocha', done);
});

gulp.task('test:client', function (done) {
    runSequence('env:test', 'lint', done);
});


// Run the project in development mode
gulp.task('default', function (done) {
    runSequence('env:dev', 'lint', ['nodemon', 'watch'], done);
});

// Run the project in debug mode
gulp.task('debug', function (done) {
    runSequence('env:dev', 'lint', ['nodemon', 'watch'], done);
});
