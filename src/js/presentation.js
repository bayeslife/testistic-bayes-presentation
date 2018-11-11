var Bayes  = require('testistic-bayes')

var relationships = [{
  id: 1,
  QS: 18,
  QF: 2,
  PS: 22,
  PF: 58
}, {
  id: 2,
  QS: 16,
  QF: 4,
  PS: 14,
  PF: 66
}]

var solutionModel = Bayes.TestModelState.create(relationships)

var roles = solutionModel.relationships;
// var branchesModel = factory.model.branchesModel
// var branches = branchesModel.getBranches();
// var taskProducer = factory.model.taskProducer;

function getRolesHierarchy(roles){
  var root = {
    id: "Roles",
    name: "Roles",
    children: []
  }
  root.children = roles.map(function(r){
      return {
      id: r.name,
      name: r.name,
      type:"Role",
      children: []
    }
  })
  return d3.hierarchy(root)
}


function Presentation(coordinator){
  var TRANSITION_DURATION = 500;
  var OPACITY = {
      NODE_DEFAULT: 0.7,
      NODE_FADED: 0.0,
      NODE_HIGHLIGHT: 1,
      LINK_DEFAULT: 0.5,
      LINK_FADED: 0.0,
      LINK_HIGHLIGHT: 0.8
    }

  var svg
  var scaleX,scaleY;

  var renderContext;

  var cline = d3.line().curve(d3.curveBundle.beta(0.85)).x(function(d){
    return d.x;}).y(function(d){return d.y;})

 var tooltip

 var width,height

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
      if(node.data.type=="Role" && node.data.name=='SolutionOwner')
        tooltip.html("<p>Double click to add new feature</p>");
      else if(node.data.type=="Role" && node.data.name=='SolutionArchitect')
        tooltip.html("<p>Drag to feature branch to define and add development tasks</p>");
      else if(node.data.type=="Role" && node.data.name=='QA')
          tooltip.html("<p>Drag to QA branch to indicate the QA branch has passed regression</p>");
      else if(node.data.type=="Role" && node.data.name=='Developer')
          tooltip.html("<p>Drag over a development task to complete development task</p>");
      else if(node.data.type=="Task")
          tooltip.html("<p>"+node.data.name+"</p>");
      else if(node.data.type=="Task")
          tooltip.html("<p>"+node.data.name+"</p>");
      else if(node.data.type=="Branch" && node.data.name=='QA')
          tooltip.html("<p>Features:"+node.data.features+"</p><p>Regression Tested:"+node.data.verified+"</p>");

      else if(node.data.type=="Branch")
          tooltip.html("<p>Features:"+node.data.features+"</p><p>Tasks:"+Object.keys(node.data.tasks).length+"</p>");

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
    //var nd = d3.select(this)
    if(d.data.name=='Customer'){
      identifyBranch(d3.event,function(branch,tasks){
        branch.completeFeature();
      })
    }
    else if(d.data.name=='SolutionArchitect'){
      identifyBranch(d3.event,function(branch,tasks){
        branch.addTasks(tasks);
      })
    }
    else if(d.data.name=='QA'){
      identifyBranch(d3.event,function(branch,tasks){
        if(branch.name=='QA')
          branch.verify();
      })
    }
    else if(d.data.name=='DevOps'){
      identifyBranch(d3.event,function(branch,tasks){
        if(branch.name=='QA')
          branchesModel.release();
      })
    }
    else if(d.data.name=='Developer'){
      var cx1 = d3.event.x;
      var cy1 = d3.event.y;

      var taskSelection = d3.selectAll(".task");
      var circleSelection = taskSelection.select("circle");
      circleSelection.each(function(cir){
          var cx2 = cir.x;
          var cy2 = cir.y;
          if(collide([cx1,cy1],10,[cx2,cy2],10)){
            var taskName = cir.data.name
            var branch = branchesModel.findTaskBranch(taskName)
            var task = branch.findTask(taskName)
            branch.completeTask(task)
            renderContext.update();
          }
      });
    }
    d3.select(this).attr("transform",null)
  }
  function dragged(d){
    var dt = "translate("+ (d3.event.x-dragx)+","+(d3.event.y-dragy)+")"
    d3.select(this).attr("transform",dt);
  }

  function identifyBranch(event,action){
    var cx1 = d3.event.x;
    var cy1 = d3.event.y;
    var branchSelection = d3.selectAll(".branch");
    var circleSelection = branchSelection.select("circle");
    circleSelection.each(function(cir){
        var cx2 = cir.x;
        var cy2 = cir.y
        ;
        if(collide([cx1,cy1],10,[cx2,cy2],10)){
          var branchName = cir.data.name
          var tasks = taskProducer.createTasks(2);
          var branch = branchesModel.getBranch(branchName)
          action(branch,tasks)
          //branch.addTasks(tasks);
          renderContext.update();
        }
    });
  }

  function collide(p1,r1,p2,r2){
    var colliding=false;

    var ax1=p1[0]-r1
    var ax2=p1[0]+r1
    var ay1=p1[1]-r1
    var ay2=p1[1]+r1

    var bx1=p2[0]-r2
    var bx2=p2[0]+r2
    var by1=p2[1]-r2
    var by2=p2[1]+r2

    if(!(ax1 > bx2 || ax2 < bx1 || ay1 > by2 || ay2 < by1))
      colliding=true;

    return colliding;
}

  renderContext = {

    render: function(dwidth,dheight,divselect){
      width=dwidth
      height=dheight

        var chart = d3.select(divselect)
        svg = chart.append("svg")
        .attr("width", width)
        .attr("height", height*0.75)

        tooltip = chart.append("div").attr("id", "tooltip");

        scaleX = d3.scaleLinear().domain([0,1]).range([0, width])
        scaleY = d3.scaleLinear().domain([0,1]).range([0,height])

        this.update();

        return renderContext;
    },

    update: async function(){

      svg.selectAll("g").remove();

      var g = svg.append("g").attr("transform","translate(0,0)")

      var rolesHierarchy = getRolesHierarchy(roles)

    
      var rolesTree = d3.cluster().size([width,height*0.10])
      rolesTree(rolesHierarchy)
      var roleLeaves = rolesHierarchy.leaves();

      var rn = g.selectAll(".role").data(roleLeaves,(d)=>{
        return d.data.id;
      }).enter();

      var d = rn.append("g")
        .attr("class", (d)=>"role")

      d.call(d3.drag()
            .on("start",startdrag)
            .on("drag",dragged)
            .on("end",enddrag));

      d.append("circle")
          .attr("r",20)
          .attr("cx",(d)=>d.x)
          .attr("cy",(d)=>d.y)
          .attr("class", (d)=>"role-circle")
          .on("click", mouseclick)
          .on("mouseover", mouseovered)
          .on("mouseout", mouseouted)

      d.append("text")
          .attr("x",(d)=>d.x)
          .attr("y",(d)=>d.y)
          .text((d) => {
            return d.data.name
          });

   },

  function mouseclick(contextNode){
    if(contextNode.data.name=='SolutionOwner'){
      solutionModel.makeFeature()
    }
    renderContext.update();
  }

  return renderContext;
}

module.exports=Presentation
