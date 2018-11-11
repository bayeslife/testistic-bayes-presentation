var through = require('through2');
var debug = require('debug')('DocumentGenerator');


var path = require('path');

var Promise = require('bluebird');

var generator = require("../../dist/html.js.js");

var context={};
var template = null;

function toHtml(release,version,homepage,aTemplate, solutiondata={}){

  template = aTemplate;

  context = Object.assign({},solutiondata)
  context = Object.assign(solutiondata, {
    release: release,
    version: version,
    homepage: homepage
  });

    var transform = function(file, encoding, callback) {
      debug("Gen Doc:" + file.path);

      debug(('--------------------'))
      debug(process.cwd())
      debug(context)

      return generator
      .renderer.html(template,process.cwd()/*base path*/,context,file.path,file.content)
      .then(function(html){
        file.contents = new Buffer(html,'utf-8');
        callback(null,file);
      })
    };
  return through.obj(transform);
}

// function toHtml(transform){
//   return through.obj(transform);
// }

module.exports = {
  toHtml: toHtml
}
