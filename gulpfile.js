var pkg = require('./package.json');

var debug = require('debug')('BuildArtefact')

console.log(pkg.version);

var release = require('./release.json');

var path = require('path');
var gulp = require('gulp');

var clean = require('gulp-rimraf');
var tap = require('gulp-tap');
var merge = require('merge-stream');

var insert = require("gulp-insert");

var rename = require("gulp-rename");

var strip = require('gulp-strip-comments');

//var Promise = require('bluebird');

var docGenerator = require("./src/js/document-generator.js");

gulp.task('strip', function () {
  return gulp.src('build/lib.prestrip.js')
    .pipe(strip())
    .pipe(rename(function(path){
      path.basename="bundle";
    }))
    .pipe(gulp.dest('build'));
});
  

gulp.task('build', [], function() {

  gulp.src("./release.json")
  .pipe(tap(generateHtml))

    function generateHtml(file,t){
      debug("Generating content")

      var f2 = function(){
         return new Promise(function(res,rej){
          gulp.src("./release.json")
          .pipe(docGenerator.toHtml(release,pkg.version,pkg.homepage,"src/handlebars/htmltemplates/main.hbs",{ sampledata: {} }))
          .pipe(rename(function(path){
            path.basename="Visualization";
            path.extname="."+pkg.version+".html";
          }))
          .pipe(gulp.dest('publish/'))
          .on('end',res)
        })
      }

        f2().then(function(){
        })
    }
})
