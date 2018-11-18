function Presentation(coordinator, modelState){
  var TRANSITION_DURATION = 500;
  var OPACITY = {
      NODE_DEFAULT: 0.25,
      NODE_FADED: 0.0,
      NODE_HIGHLIGHT: 1,
      LINK_DEFAULT: 0.5,
      LINK_FADED: 0.0,
      LINK_HIGHLIGHT: 0.8
  }

  var nodesize=30

  var svg, rootg

  var renderContext;

  var cline = d3.line().curve(d3.curveBundle.beta(0.85)).x(function(d){ return d.x;}).y(function(d){return d.y;})

 var tooltip

 var width,height

 var viewStates =[ 'View Probability', 'View Frequency']
 var viewState = viewStates[0]

 function midX(d){
   return d.source.x + (d.target.x - d.source.x)/2 
 }
 function midY(d){
  return d.source.y + (d.target.y - d.source.y)/2 
 }
 function textX(){
  return nodesize*2/10
 }
 function textY(){
  return nodesize*8/10
 }

function renderConfidence(nodes){
  //nodes.append("text")
  //   .attr("x",(d)=>d.x)
  //   .attr("y",(d)=>d.y)
  //   .text((d) => {
  //     return d.data.name
  //   });
  nodes.append("rect")
    .attr("x", function(d) {return d.x-nodesize })
    .attr("y", function(d) {return d.y })
    .attr("width", nodesize)
    .attr("height", nodesize)
    .on("click", mouseclickS)
    .classed('selected', (d)=>{
      return d.data.content.evidence==='S'
    })
     
  nodes.append("text")
    .attr("x",(d)=>d.x - nodesize + textX())
    .attr("y",(d)=>d.y + textY())
    .text((d) => {
      var c = d.data.content
      if(d.data.type==='modelState'){
        c = c.getProbabilities() 
      }
      if(viewState===viewStates[0]){
        return c.pQ
      }else {
        return c.Q
      }
     })

   nodes.append("rect")
    .attr("x", function(d) {return d.x })
    .attr("y", function(d) {return d.y })
    .attr("width", nodesize)
    .attr("height", nodesize)
    .on("click", mouseclickF)
    .classed('selected', (d)=>{
      return d.data.content.evidence==='F'
    })
  nodes.append("text")
    .attr("x",(d)=>d.x + textX())
    .attr("y",(d)=>d.y + textY())
    .text((d) => {
      var c = d.data.content
      if(d.data.type==='modelState'){
        c = c.getProbabilities()
      }
      if(viewState===viewStates[0]){
        return c.pP
      }else {
        return c.P
      }
     });
}

 function renderRelationship(links){
    links.append("rect")
      .classed('content', true)
      .attr("x", function(d) {return midX(d)-nodesize })
      .attr("y", function(d) {return midY(d)-nodesize })
      .attr("width", nodesize)
      .attr("height", nodesize)
    links.append("text")
      .attr("x",(d)=>midX(d) - nodesize + textX() )
      .attr("y",(d)=>midY(d) - nodesize + textY() )
      .text((d) => {
        if(viewState===viewStates[0]){
          return d.target.data.content.pQS
        }else {
          return d.target.data.content.QS
        }
    })

    links.append("rect")
      .classed('content', true)
      .attr("x", function(d) {return midX(d)-nodesize })
      .attr("y", function(d) {return midY(d) })
      .attr("width", nodesize)
      .attr("height", nodesize)
    links.append("text")
      .attr("x",(d)=>midX(d) - nodesize + textX() )
      .attr("y",(d)=>midY(d) + textY() )
      .text((d) => {
        if(viewState===viewStates[0]){
          return d.target.data.content.pQF
        }else {
          return d.target.data.content.QF
        }
    })
      
    links.append("rect")
      .classed('content', true)
      .attr("x", function(d) {return midX(d) })
      .attr("y", function(d) {return midY(d)-nodesize })
      .attr("width", nodesize)
      .attr("height", nodesize)
    links.append("text")
      .attr("x",(d)=>midX(d)  + textX() )
      .attr("y",(d)=>midY(d) - nodesize + textY() )
      .text((d) => {
        if(viewState===viewStates[0]){
          return d.target.data.content.pPS
        }else {
          return d.target.data.content.PS
        }
    })

    links.append("rect")
      .classed('content', true)
      .attr("x", function(d) {return midX(d) })
      .attr("y", function(d) {return midY(d) })
      .attr("width", nodesize)
      .attr("height", nodesize)
    links.append("text")
      .attr("x",(d)=>midX(d)  + textX() )
      .attr("y",(d)=>midY(d)  + textY() )
      .text((d) => {
        if(viewState===viewStates[0]){
          return d.target.data.content.pPF
        }else {
          return d.target.data.content.PF
        }
    })
  }

  function getHierarchy(modelState){
    var root = {
      id: "model",
      name: "Quality",
      type: "modelState",
      content: modelState
    }
    root.children = modelState.relationships.map(function(r){
        return {
        id: r.id,
        name: r.name,
        type: "relationship",
        content: r
      }
    })
    return d3.hierarchy(root)
  }

  function navigate(node) {
    window.location = "#"+ node.id;
  }

  function fadeView(nodeSelection,linkSelection) {
      //nodeSelection.attr("opacity", OPACITY.NODE_FADED)
      //linkSelection.attr("opacity", OPACITY.LINK_FADED)
  }

  function defaultView(nodeSelection,linkSelection) {
      //nodeSelection.attr("opacity", OPACITY.NODE_DEFAULT)
      //linkSelection.attr("opacity", OPACITY.LINK_DEFAULT)
  }

  function highlightView(nodeSelection,linkSelection,n) {
    //nodeSelection.attr("opacity", OPACITY.NODE_HIGHLIGHT)
    //linkSelection.attr("opacity", OPACITY.LINK_HIGHLIGHT)
  }
  function hideTooltip() {

    tooltip.selectAll("*").remove();
    return tooltip.transition()
      .duration(TRANSITION_DURATION)
      .style("opacity", 0);
  }

  function showTooltip() {
    return tooltip
      .style("left", d3.event.pageX + 20+  "px")
      .style("top", d3.event.pageY - 20 + "px")
      .transition()
      .duration(TRANSITION_DURATION)
      .style("opacity", 1);
    }

    function mouseouted(node) {
        hideTooltip();
    }

    function mouseovered(node) {
      
      tooltip.html(`<p>${node.data.content.description}</p>`);
     
      showTooltip();
    }
    function mouseSelected(node) {
    }
    function mouseDeselected(node) {
    }

  var dragx,dragy
  function startdrag(node,d){
    dragx=node.x
    dragy=node.y
  }
  function enddrag(d){
  }
  function dragged(d){
    var dt = "translate("+ (d3.event.x-dragx)+","+(d3.event.y-dragy)+")"
    d3.select(this).attr("transform",dt);
  }

  function mouseclickS(contextNode){
    var testresult = {
      id: contextNode.data.id,
      S: true
    }
    var workings = modelState.updateGiven(testresult)
    renderContext.renderWorkings(workings)
    renderContext.update();
  }

  function mouseclickF(contextNode){
    var testresult = {
      id: contextNode.data.id,
      F: true
    }
    var workings = modelState.updateGiven(testresult)
    renderContext.renderWorkings(workings)
    renderContext.update();
  }

  renderContext = {

    render: function(dwidth,dheight,divselect){
      width=dwidth
      height=dheight

      var presentation = this

      var chart = d3.select(divselect)
        svg = chart.append("svg")
        .attr("width", width)
        .attr("height", height*0.75)

        tooltip = chart.append("div").attr("id", "tooltip");

        d3.select("#toggle").on("click", (d)=>{
          if(viewState===viewStates[0]){
            viewState = viewStates[1]
          }else {
            viewState = viewStates[0]
          }
          d3.select("#toggle").text(viewState)
          presentation.update();
        })
        d3.select("#reset").on("click", (d)=>{
          modelState.reset()
          presentation.update();
        })

        this.update();

        return renderContext;
    },

    update: async function(){

      svg.selectAll(".hierarchy").remove();
      rootg = svg.append("g").classed('hierarchy',true).attr("transform","translate(0,100)")

      var modelHierarchy = getHierarchy(modelState)

      var rolesTree = d3.cluster().size([width,height*0.40])
      rolesTree(modelHierarchy)
    
      {
        var links = modelHierarchy.links();
        var ds = rootg.selectAll(".link").data(links,(d)=>{
          return d.source.data.id + d.target.data.id
        })
        
        var ln = ds.enter();

        var l = ln.append("g")
        //.on("click", mouseclick)
        .on("mouseover", mouseovered)
        .on("mouseout", mouseouted)
        .classed("link", true)
        .classed('content', true)
        l.append('line')
          .classed('link', true)
          .attr('x1', function(d) {return d.source.x;})
          .attr('y1', function(d) {return d.source.y;})
          .attr('x2', function(d) {return d.target.x;})
          .attr('y2', function(d) {return d.target.y;});

        renderRelationship(l)
      }
      {
        var modelNodes = modelHierarchy.descendants();
        var ds = rootg.selectAll(".node").data(modelNodes,(d)=>{
          return d.data.id;
        });
        
        var rn = ds.enter();

        var d = rn.append("g")
          .attr("id", (d)=>{
            return "N"+d.data.id
          })
          // .on("click", mouseclick)
          .on("mouseover", mouseovered)
          .on("mouseout", mouseouted)
          .classed("node", true)
          .classed('content', true)
          
        // d.call(d3.drag()
        //       .on("start",startdrag)
        //       .on("drag",dragged)
        //       .on("end",enddrag));

        renderConfidence(d)  
      }
    },

    renderWorkings: async function(update) {
      svg.selectAll(".working").remove();
      var working = svg.append("g").classed('working',true).attr("transform","translate(0,50)")      
    
      var scale = d3.scaleLinear().domain([0,1]).range([0, nodesize])
      {
        working.append('rect')
          .classed('content', true)
          .classed('quality', true)
          .attr('x',0)
          .attr('y',0)
          .attr('width', nodesize)
          .attr('height', scale(update.workings.prior.pQ))
        working.append("text")
          .attr("x",0)
          .attr("y", 0)
          .text((d) => {
            return update.workings.prior.pQ
          });
        working.append('rect')
          .classed('content', true)
          .classed('poor', true)
          .attr('x',0)
          .attr('y',nodesize)
          .attr('width', nodesize)
          .attr('height', scale(update.workings.prior.pP))
        working.append("text")
          .attr("x",0)
          .attr("y", nodesize)
          .text((d) => {
            return update.workings.prior.pP
          });
      }
      {
        working.append('rect')
          .classed('content', true)
          .classed('quality', true)
          .attr('x',2*nodesize)
          .attr('y',0)
          .attr('width', nodesize)
          .attr('height', scale(update.workings.likelihood.lQ))
        
          working.append("text")
          .attr("x",2*nodesize)
          .attr("y",0)
          .text((d) => {
            return (update.workings.likelihood.QS ? update.workings.likelihood.QS : update.workings.likelihood.QF) +'/'+update.workings.likelihood.Q
          });
        working.append('rect')
          .classed('content', true)
          .classed('poor', true)
          .attr('x',2*nodesize)
          .attr('y',nodesize)
          .attr('width', nodesize)
          .attr('height', scale(update.workings.likelihood.lP))
        working.append("text")
          .attr("x",2*nodesize)
          .attr("y",nodesize)
          .text((d) => {
            return (update.workings.likelihood.PS ? update.workings.likelihood.PS : update.workings.likelihood.PF) +'/'+update.workings.likelihood.P
          });
      }
      {// posterior
        working.append('rect')
          .classed('content', true)
          .classed('quality', true)
          .attr('x',4*nodesize)
          .attr('y',0)
          .attr('width', nodesize)
          .attr('height', scale(update.workings.posterior.pQ))
        working.append("text")
          .attr("x",4*nodesize)
          .attr("y", 0)
          .text((d) => {
            return update.workings.posterior.pQ
          });

        working.append('rect')
          .classed('content', true)
          .classed('poor', true)
          .attr('x',4*nodesize)
          .attr('y',nodesize)
          .attr('width', nodesize)
          .attr('height', scale(update.workings.posterior.pP))
        working.append("text")
          .attr("x",4*nodesize)
          .attr("y", nodesize)
          .text((d) => {
            return update.workings.posterior.pP
          });
      }
      {
        var h = scale(update.pQ)
        working.append('rect')
          .classed('content', true)
          .classed('quality', true)
          .attr('x',6*nodesize)
          .attr('y',0)
          .attr('width', nodesize)
          .attr('height', h)
          working.append('rect')
          .classed('content', true)
          .classed('poor', true)
          .attr('x',6*nodesize)
          .attr('y',h)
          .attr('width', nodesize)
          .attr('height', scale(update.pP))
      }
    }
  }

  return renderContext;
}

module.exports=Presentation
