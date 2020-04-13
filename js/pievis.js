//Arrays for data
var matchinfo = [];
var killsinfo = [];
//margin and dimensions for blue and red circles
var margin = {top: 20, right: 20, bottom: 20, left: 20};
var bluewidth = 275 - margin.right - margin.left;
var blueheight = 275 - margin.top - margin.bottom;
var blueradius = bluewidth / 2;

var redwidth = 275 - margin.right - margin.left;
var redheight = 275 - margin.top - margin.bottom;
var redradius = redwidth/2;

//arc generator + pie generator

var bluearc;

var redarc;

var bluelabelArc;

var redlabelArc;

var pie;

function initPieVis(){
  bluearc = d3.arc()
              .outerRadius(blueradius - 10)
              .innerRadius(0);

  redarc = d3.arc()
              .outerRadius(redradius - 10)
              .innerRadius(0);

  bluelabelArc = d3.arc()
              .outerRadius(blueradius - 50)
              .innerRadius(blueradius - 50);

  redlabelArc = d3.arc()
              .outerRadius(redradius - 50)
              .innerRadius(redradius - 50);

  pie = d3.pie()
            .sort(null)
            .value(function(d) {return d.score;});

  //import data
  d3.select("#pie-vis-container").selectAll("svg").remove();
  var select = document.getElementById("goldGames");
  d3.csv("dataset/matchinfo.csv").then((matchinfo) => {
    d3.csv("dataset/kills.csv").then((killsinfo) => {
      //parse match and kills data
      matchinfo = pruneData(matchinfo, ["blueTeamTag", "redTeamTag",
                                        "blueTop", "blueJungle", "blueMiddle", "blueADC", "blueSupport",  //blue team
                                        "redTop", "redJungle", "redMiddle", "redADC", "redSupport",       //red team
                                        "Address"]);

      killsinfo = pruneData(killsinfo, ["Address","Team","Victim","Killer","Assist_1", "Assist_2", "Assist_3", "Assist_4"]);
      var gameindex;
      if(select.selectedIndex == -1) {
        gameindex = 0;
      } else {
        gameindex = select.selectedIndex;
      }
      var blue_score = 0;
      var red_score = 0;
      //blue team names and setting total kills/assists to 0
      var blueTeam = [{name: matchinfo[gameindex].blueTeamTag + " " + matchinfo[gameindex].blueTop, score: 0},
                  {name: matchinfo[gameindex].blueTeamTag + " " + matchinfo[gameindex].blueJungle, score: 0},
                  {name: matchinfo[gameindex].blueTeamTag + " " + matchinfo[gameindex].blueMiddle, score: 0},
                  {name: matchinfo[gameindex].blueTeamTag + " " + matchinfo[gameindex].blueADC, score: 0},
                  {name: matchinfo[gameindex].blueTeamTag + " " + matchinfo[gameindex].blueSupport, score: 0}];
      //red team names and setting total kills/assists to 0
      var redTeam = [{name: matchinfo[gameindex].redTeamTag + " " + matchinfo[gameindex].redTop, score: 0},
                  {name: matchinfo[gameindex].redTeamTag + " " + matchinfo[gameindex].redJungle, score: 0},
                  {name: matchinfo[gameindex].redTeamTag + " " + matchinfo[gameindex].redMiddle, score: 0},
                  {name: matchinfo[gameindex].redTeamTag + " " + matchinfo[gameindex].redADC, score: 0},
                  {name: matchinfo[gameindex].redTeamTag + " " + matchinfo[gameindex].redSupport, score: 0}];

      killsinfo.forEach(function(d){
        if(d.Address == matchinfo[gameindex].Address){
          if(d.Team == "bKills"){
            for(var i = 0; i < blueTeam.length; i++){
              if(blueTeam[i].name == d.Killer){ //initial kill
                blueTeam[i].score += 1;
                blue_score += 1;
              }
              if(blueTeam[i].name == d.Assist_1){ //Assist 1
                blueTeam[i].score += 1;
                blue_score += 1;
              }
              if(blueTeam[i].name == d.Assist_2){ //Assist 2
                blueTeam[i].score += 1;
                blue_score += 1;
              }
              if(blueTeam[i].name == d.Assist_3){ //Assist 3
                blueTeam[i].score += 1;
                blue_score += 1;
              }
              if(blueTeam[i].name == d.Assist_4){ //Assist 4
                blueTeam[i].score += 1;
                blue_score += 1;
              }
            }
          } else if (d.Team == "rKills"){
            for(var i = 0; i < redTeam.length; i++){
              if(redTeam[i].name == d.Killer){ //initial kill
                redTeam[i].score += 1;
                red_score +=1;
              }
              if(redTeam[i].name == d.Assist_1){ //Assist 1
                redTeam[i].score += 1;
                red_score += 1;
              }
              if(redTeam[i].name == d.Assist_2){ //Assist 2
                redTeam[i].score += 1;
                red_score += 1;
              }
              if(redTeam[i].name == d.Assist_3){ //Assist 3
                redTeam[i].score += 1;
                red_score += 1;
              }
              if(redTeam[i].name == d.Assist_4){ //Assist 4
                redTeam[i].score += 1;
                red_score += 1;
              }
            }
          }
        }
      });

      var pie_blue_Color = d3.scaleOrdinal()
                        .range(["#CCCCFF", "#9999FF", "#6666FF", "#3333FF", "#0000FF"])
                        .domain([d3.min(blueTeam, d => d.score), d3.max(blueTeam, d => d.score)]);

      var pie_red_Color = d3.scaleOrdinal()
                        .range(["#FFA07A", "#Ff6347", "#FF0000", "#8B0000", "#800000"])
                        .domain([d3.min(redTeam, d => d.score), d3.max(redTeam, d => d.score)]);

      //define blue svg
      var bluesvg = d3.select("#pie-vis-container").append("svg")
                  .attr("width", bluewidth)
                  .attr("height", blueheight)
                  .append("g")
                  .attr("transform", "translate(" + bluewidth/2 + "," + blueheight/2 + ")");

      //g elements
      var g = bluesvg.selectAll(".arc")
                  .data(pie(blueTeam))
                  .enter().append("g")
                  .attr("class", "arc");

      // append the path of the arc
      g.append("path")
        .attr("d", bluearc)
        .style("fill", function(d) { return pie_blue_Color(d.data.score); })
        .transition()
        .ease(d3.easeLinear)
        .duration(500)
        .attrTween("d", pie_animation_blue);

      g.append("text")
        .transition()
        .ease(d3.easeLinear)
        .duration(2000)
        .attr("transform", function(d) { return "translate(" + bluelabelArc.centroid(d) + ")";})
        .attr("dy", ".35em")
        .text(function(d) {return d.data.name;}
      );

      //define red svg
      var redsvg = d3.select("#pie-vis-container").append("svg")
                  .attr("width", redwidth)
                  .attr("height", redheight)
                  .append("g")
                  .attr("transform", "translate(" + redwidth/2 + "," + redheight/2 + ")");

      //g elements
      var g = redsvg.selectAll(".arc")
                  .data(pie(redTeam))
                  .enter().append("g")
                  .attr("class", "arc");

      // append the path of the arc
      g.append("path")
        .attr("d", redarc)
        .style("fill", function(d) { return pie_red_Color(d.data.score); })
        .transition()
        .ease(d3.easeLinear)
        .duration(500)
        .attrTween("d", pie_animation_red);

      g.append("text")
        .transition()
        .ease(d3.easeLinear)
        .duration(2000)
        .attr("transform", function(d) { return "translate(" + redlabelArc.centroid(d) + ")";})
        .attr("dy", ".35em")
        .text(function(d) {return d.data.name;}
      );

    });
  });
}

function pie_animation_blue(pie){
  pie.innerRadius = 0;
  var i = d3.interpolate({startAngle: 0, endAngle: 0}, pie);
  return function(t) {return bluearc(i(t));};
}

function pie_animation_red(pie){
  pie.innerRadius = 0;
  var i = d3.interpolate({startAngle: 0, endAngle: 0}, pie);
  return function(t) {return redarc(i(t));};
}

/*function pruneData(data, values_to_keep) {
    let new_data = [];
    for (row of data) {
        let tmp = Object.assign({}, row);
        Object.keys(tmp).forEach((key) => values_to_keep.includes(key) || delete tmp[key]);
        new_data.push(tmp);
    }
    return new_data;
}*/
