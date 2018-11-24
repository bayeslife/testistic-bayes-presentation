var Bayes  = require('testistic-bayes')

var relationships2 = [
{
  id: 4,
  description: 'test4',
  QS: 25,
  QF: 25,
  PS: 25,
  PF: 25
},
{
  id: 5,
  description: 'test5',
  QS: 10,
  QF: 40,
  PS: 30,
  PF: 20
}]

var relationships = [{
  id: 1,
  description: 'First test',
  QS: 18,
  QF: 2,
  PS: 22,
  PF: 58
}, {
  id: 2,
  description: 'Second Test',
  QS: 16,
  QF: 4,
  PS: 14,
  PF: 66
},
{
  id: 3,
  description: 'Third Test',
  QS: 20,
  QF: 0,
  PS: 10,
  PF: 70
},
{
  id: 4,
  description: 'Fourth Test',
  QS: 10,
  QF: 10,
  PS: 40,
  PF: 40
},
{
  id: 5,
  description: 'Fifth Test',
  QS: 14,
  QF: 6,
  PS: 16,
  PF: 64
}]

var testRelationships = relationships.map((rel)=>Bayes.TestRelationship.create(rel));
var modelState = Bayes.TestModelState.create(testRelationships)

var Presentation = require('./presentation.js')
var presentation = Presentation(coordinator, modelState);
var rendercontext = presentation.render(window.innerWidth,0.8*window.innerHeight,"#model");

coordinator.on("highlight",function(state){
  presentation.highlight(state)
})

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
