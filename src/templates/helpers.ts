import handlebars = require('handlebars');
import http = require('http');
import paramCase = require('param-case')
import pascalCase = require('pascal-case')
import camelCase = require('camel-case')
import fs = require('fs')

import changecase = require('change-case');

let marked = require('marked');

export const helpers = {

  readfile: function(val: string) {
      return fs.readFileSync(val,'utf-8');
  },

  paramCase: function(val: string) {
      return paramCase(val);
  },

  pascalCase: function(val: string) {
      return pascalCase(val);
  },

  cat: function(val: string, val2: string, val3: string) {
    return val+val2+val3;
 },

  echo: function(val: any) {
    console.log(val);
 },

  typeFromReference: function(val: any) {
   let answer : string =  val.substring("#/definitions/".length,val.length);
   return answer.trim();
 },

  documentationDescription: function(val: string,content: string) {
   if(val=='Description')
      return content;
  return "";
  },

  documentationEffort: function(val: string,content: string) {
    if(val=='Effort'){
      return content.trim();
    }
   return "";
 },

  documentationHistory: function(val: string,content: string) {
    if(val=='History')
       return content;
   return "";
  },

  json: function(text: string,id: string,options: any){
    //console.log(text);
     var j =  JSON.parse(text);
     j.id = id;
     return options.fn(j);
  },
  addId: function(context: any,id: string,options: any){
      context.id=id;
      return options.fn(context);
  },

  toLowerCase: function(text: string) {
    return text.toLowerCase();
  },
  toUpperCase: function(text: string) {
    return text.toUpperCase();
  },

  asJson: function(j: any) {
    if(typeof(j)=='object'){
      return JSON.stringify(j,null,2);
    }else {
      return j;
    }
  },
  asEscapedJson: function(j: any) {
    var j2 =  JSON.stringify(j,null,2);
    return JSON.stringify(j2,null,0);
  },

};

//}
