

var Presentation = require('./presentation.js')
var presentation = Presentation(coordinator);
var rendercontext = presentation.render(window.innerWidth,0.8*window.innerHeight,"#model");


coordinator.on("modelchange",function(state){

  rendercontext.update();

  Object.keys(state.config).forEach(function(k){
    var inp = d3.select("#"+k)
    inp.property('value',state.config[k])
  })
})

// coordinator.on("timechange",function(time){
//   //console.log(time)
//   presentation.time(time)
//   rendercontext.update();
// })
//
// coordinator.on("timeline",function(state){
//   timeline.siteConfig(state)
//   timelinerender.update();
// })
