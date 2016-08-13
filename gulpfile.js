var gulp = require('gulp');
var install = require('gulp-install');
var tslint = require('gulp-tslint');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var del = require('del');
var srcmap = require('gulp-sourcemaps');
var config = require('./tasks/config');

require('./tasks/htmltasks')

gulp.task('ext:tslint', () => {
    return gulp.src([
        config.paths.project.root + '/src/**/*.ts',
        '!' + config.paths.project.root + '/src/views/htmlcontent/**/*',
        config.paths.project.root + '/test/**/*.ts'
    ])
    .pipe((tslint({
        formatter: "verbose"
    })))
    .pipe(tslint.report());
});

gulp.task('ext:compile-src', () => {
    return gulp.src([
                config.paths.project.root + '/src/**/*.ts',
                config.paths.project.root + '/typings/**/*.ts',
                '!' + config.paths.project.root + '/src/views/htmlcontent/**/*'])
                .pipe(srcmap.init())
                .pipe(ts(tsProject))
                .pipe(srcmap.write('.', {
                   sourceRoot: function(file){ return file.cwd + '/src'; }
                }))
                .pipe(gulp.dest('out/src/'));
});

gulp.task('ext:compile-tests', () => {
    return gulp.src([
                config.paths.project.root + '/test/**/*.ts',
                config.paths.project.root + '/typings/**/*.ts'])
                .pipe(srcmap.init())
                .pipe(ts(tsProject))
                .pipe(srcmap.write('.', {
                   sourceRoot: function(file){ return file.cwd + '/src'; }
                }))
                .pipe(gulp.dest('out/test/'));

})

gulp.task('ext:compile', gulp.series('ext:compile-src', 'ext:compile-tests'));

gulp.task('ext:copy-tests', () => {
    return gulp.src(config.paths.project.root + '/test/resources/**/*')
            .pipe(gulp.dest(config.paths.project.root + '/out/test/resources/'))
})

gulp.task('ext:copy-html', () => {
    return gulp.src(config.paths.project.root + '/src/views/htmlcontent/src/**/*')
            .pipe(gulp.dest(config.paths.project.root + '/out/src/views/htmlcontent/'))
})

gulp.task('ext:copy', gulp.series('ext:copy-tests', 'ext:copy-html'))

gulp.task('ext:build', gulp.series('ext:compile', 'ext:copy'));

gulp.task('ext:clean', () => {
    return del('out')
});

gulp.task('build-extension', gulp.series('ext:tslint', 'ext:clean', 'ext:build'));

gulp.task('build-all', gulp.series('build-html', 'build-extension'));

gulp.task('install', function(){
    return gulp.src(['./package.json', './src/views/htmlcontent/package.json'])
                .pipe(install());
})

gulp.task('watch', function(){
    return gulp.watch(config.paths.project.root + '/src/**/*', gulp.series('build-all'))
})