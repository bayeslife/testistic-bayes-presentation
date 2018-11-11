import handlebars = require('handlebars')
import fs = require('fs')
import Promise = require('bluebird')
import path = require('path');

import { helpers } from './helpers'
let hlprs: any = helpers;

let apiVersion="v1"

let environmentUrls: any[]= [];

var Visitor = handlebars.Visitor;

class ImportScanner  extends Visitor {
      partials : any = [];

      PartialStatement(partial:any){
         var name = partial.name.original;

      if (!path.isAbsolute(name)) {
        name = path.join('/src/handlebars/htmltemplates/', name);
      }
      partial.name.original = name
      //console.log(name);
      this.partials.push(name);
      }
}

class Renderer {
   ctx: any;

   ids: any={};
   templates: any = {};
   baseUri: string ="http://localhost";
   partials : any = [];

   constructor(public defaultBasePath: string, public filepath: any){
     console.log("BP:::"+defaultBasePath);

     for (var name in hlprs) {
       let helperFn = hlprs[name];
       //console.log(name);
        handlebars.registerHelper(name,helperFn);
      }
   }

   slug(name: string) {
      return name
          .replace(/ /g, '-')
          .replace(/[?!]/g, '')
          .replace(/_/g, '-')
          .replace(/['"]/g, '')
          .replace(/[(){}]/g, '')
          .replace(/\[/g, '')
          .replace(/\]/g, '')
          .replace(/[\/\\]/g, '-')
          .toLowerCase();
    }

   newId(name: string) {
    name = this.slug(name);
    var id = name;
    var index = 0;

    while (id in this.ids) {
      index++;
      id = name + index;
    }

    return id;
  }

  readFile(filename: string) : Promise<string> {
     return new Promise<string>(function(resolve, reject) {
       //fs.readFile(filename, { encoding: 'utf-8'}, function(err, text) {
       var rs = fs.readFileSync(filename,'utf-8');
       resolve(rs);
     });
   }

  template(name: string, context: any) {
     try {
       console.log('Running template:'+ name);
       //fs.writeFileSync('./doc.json',JSON.stringify(context,null,1));
       //console.log(JSON.stringify(context));
      return this.templates[name](context);
     }catch(e){
       console.log(e);
     }
  }

  prepare(filename: string) : Promise<any> {

    var r = this;

    var basepath = this.defaultBasePath;

    return new Promise(function(resolve: any,reject: any){
      if (r.templates[filename]) {
          resolve();
      }else {

        r.readFile(basepath+'/'+filename)
        .then(function(content: string) {

          try {
            var ast = handlebars.parse(content);

            let scanner  = new ImportScanner();

            scanner.accept(ast);
            var promises = scanner.partials.map(function(fn:string){
              console.log("tt"+fn)
              return r.prepare(fn);
            });
            r.templates[filename] = handlebars.compile(ast);
            handlebars.registerPartial(filename,r.templates[filename]);
            if(promises.length>0){
              Promise.all(promises).then(function(){
                resolve();
              })
            }else
              resolve();

          }catch(exception){
            console.log(exception)
            reject(exception);
          }
        })
        .catch(function(msg: string){
          console.log(msg);
          reject();
        });
      }
  });
}

  render(filename: string,context: any) : Promise<any>{

    var t = this;

    this.ctx =context;
    return new Promise(function(resolve: any,reject: any){
      if (!filename) {
        throw new Error("template file is not defined");
      }

      if (t.templates[filename]!= undefined) {

          var res = t.template(filename, t.ctx );
          //files[key]= res;
          resolve(res);
      }else {
          t.prepare(filename)
            .then(function() {

              var res = t.template(filename, t.ctx);
              //files[key]= res;
              resolve(res);
            })
            .catch(function(msg: any){
              console.log(msg);
            })
        }


    });
  }
}

export const renderer = {
  html: function (template: string, basepath: string,context: any, path: any,content: string) {
    let renderer: Renderer = new Renderer(basepath,path);
    return renderer.render(template,context);
  }
}
