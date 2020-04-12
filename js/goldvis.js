var dataGold = [], dataMatch = [];
const numGames = 100;
var globMaxDiff = 0, globMinDiff = 0; // Used for the scales of plotting all the games at once

function initGoldVis() {
    var select = document.getElementById("goldGames");

    if (dataGold.length == 0 && dataMatch.length == 0) {
        d3.csv("dataset/gold.csv").then((dataGold) => {
            d3.csv("dataset/matchinfo.csv").then((dataMatch) => {
                dataGold = dataGold.slice(0, numGames);
                dataMatch = dataMatch.slice(0, numGames);

                // Prune uneeded data
                dataMatch = pruneData(dataMatch, ["gamelength", "bResult", "rResult", "blueTeamTag", "redTeamTag"]);

                plotGold(dataGold, dataMatch, 0); // preload game 0
                mapVis(mapData, blue_team = dataMatch[0].blueTeamTag, red_team = dataMatch[0].redTeamTag);

                // Match Title
                for (let i = 0; i < dataMatch.length; i++) {
                    select.add(new Option(dataMatch[i]["blueTeamTag"] + " vs " + dataMatch[i]["redTeamTag"]));
                }

                // Switching games
                d3.select('#goldGames')
                    .on('change', function () {
                        mapVis(mapData, blue_team = dataMatch[select.selectedIndex].blueTeamTag, red_team = dataMatch[select.selectedIndex].redTeamTag);
                        plotGold(dataGold, dataMatch, select.selectedIndex);
                    });
            });
        });

    }
}

// Main function to plot the line chart
function plotGold(dataGold, dataMatch, gameIndex) {
    var svg = d3.select("#goldChart").html("");
    let offset = 75;

    console.log("Showing Game", gameIndex);

    // Take data of only that game
    dataGold = dataGold[gameIndex];
    dataMatch = dataMatch[gameIndex];

    // Show Which game selected:
    d3.select('.blueTeamTXT').html(`${dataMatch["blueTeamTag"]}<span class="vsTXT"> vs </span><span class="redTeamTXT">${dataMatch["redTeamTag"]}</span>`)
        .style("color", "#2d68c4");

    // Do not need address and type of datagold
    delete dataGold["Address"];
    delete dataGold["Type"];

    // Get rid of the empty minutes in the data where the game wasn't being played
    Object.keys(dataGold).forEach((key) => (dataGold[key] == "") && delete dataGold[key]);
    Object.keys(dataGold).forEach(function (key) {
        if (!isNaN(dataGold[key])) {
            dataGold[key] = parseInt(dataGold[key]);
        }
    });

    // Find the max and min gold differences
    let maxDiffKey = Object.keys(dataGold).reduce((a, b) => dataGold[a] > dataGold[b] ? a : b);
    let minDiffKey = Object.keys(dataGold).reduce((a, b) => dataGold[a] < dataGold[b] ? a : b);
    let maxDiff = dataGold[maxDiffKey];
    let minDiff = dataGold[minDiffKey];

    // Turn object into list
    dataGold = Object.values(dataGold);

    console.log(dataGold);
    console.log(dataMatch);

    var margin = { top: 20, right: 50, bottom: 50, left: 40 },
        width = d3.select("#gold-vis-container").node().getBoundingClientRect().width - margin.left - margin.right,
        height = d3.select("#gold-vis-container").node().getBoundingClientRect().height / 2 - margin.top - margin.bottom;

    var xScale = d3.scaleLinear()
        .domain([0, dataMatch["gamelength"] - 1])
        .range([margin.left, width]);

    var yScale = d3.scaleLinear()
        .domain([minDiff, maxDiff])
        .range([height, 50]);

    // Define the line
    var valueline = d3.line()
        .x(function (d, i) { return xScale(i); })
        .y(function (d) { return yScale(d); })
        .curve(d3.curveMonotoneX);

    // Add the valueline path.
    svg.append("path")
        .data([dataGold])
        .attr("class", "line")
        .attr("d", valueline)
        .attr("transform", `translate(${margin.left}, 0)`);

    // Axes
    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${height})`)
        .call(d3.axisBottom(xScale))

    svg.append("g")
        .attr("transform", `translate(${margin.left * 2}, 0)`)
        .call(d3.axisLeft(yScale));

    // Title
    d3.select("#goldTitle").html("").append("text")
        .attr("x", (width / 2) + offset)
        .attr("y", (offset / 3) - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Gold Difference of each Team per Selected Game");
    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width + offset - margin.left)
        .attr("y", height + margin.top + 20)
        .text("Time");
    // Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + offset)
        .attr("x", -margin.top - offset)
        .text("Gold Difference")

    // Change line colour based on winning team
    if (dataMatch["bResult"] > dataMatch["rResult"]) {
        d3.select(".line").style("stroke", "#2d68c4"); // Blue Line
    } else {
        d3.select(".line").style("stroke", "#DC143C"); // Red Line
    }
}

// Functions to show all the games on the chart
function showAllGames() {
    mapVis(mapData);
    d3.csv("dataset/gold.csv").then((dataGold) => {
        d3.csv("dataset/matchinfo.csv").then((dataMatch) => {
            dataGold = dataGold.slice(0, numGames);
            dataMatch = dataMatch.slice(0, numGames);
            getMaxAndMin(dataGold);
            plotAllGoldGames(dataGold, dataMatch);
        });
    });

}

// Find the max and min gold differences w.r.t all the games
function getMaxAndMin(dataGold) {
    let tempGoldData, maxDiffList = [], minDiffList = [];
    for (let i = 0; i < numGames; i++) {
        tempGoldData = dataGold[i];

        Object.keys(tempGoldData).forEach((key) => (tempGoldData[key] == "") && delete tempGoldData[key]);
        Object.keys(tempGoldData).forEach(function (key) {
            if (!isNaN(tempGoldData[key])) {
                tempGoldData[key] = parseInt(tempGoldData[key]);
            }
        });
        let maxDiffKey = Object.keys(tempGoldData).reduce((a, b) => tempGoldData[a] > tempGoldData[b] ? a : b);
        let minDiffKey = Object.keys(tempGoldData).reduce((a, b) => tempGoldData[a] < tempGoldData[b] ? a : b);
        maxDiffList.push(tempGoldData[maxDiffKey]);
        minDiffList.push(tempGoldData[minDiffKey]);
    }

    maxDiffList.sort((a, b) => b - a);
    minDiffList.sort((a, b) => a - b);

    globMaxDiff = maxDiffList[0];
    globMinDiff = minDiffList[0];
}

function plotAllGoldGames(dataGold, dataMatch) {
    var svg = d3.select("#goldChart").html("");
    let offset = 75;

    // Change dashboard title
    d3.select('.blueTeamTXT').html("Showing All Games in Data")
        .style("color", "black");

    var margin = { top: 20, right: 50, bottom: 50, left: 40 },
        width = d3.select("#gold-vis-container").node().getBoundingClientRect().width - margin.left - margin.right,
        height = d3.select("#gold-vis-container").node().getBoundingClientRect().height / 2 - margin.top - margin.bottom;

    var xScale = d3.scaleLinear()
        .domain([0, 65])
        .range([margin.left, width]);

    var yScale = d3.scaleLinear()
        .domain([globMinDiff, globMaxDiff])
        .range([height, 50]);

    let tempGoldData = dataGold;
    let tempMatchData = dataMatch;

    // Draw all the lines
    for (let i = 0; i < numGames; i++) {
        // Take data of only that game
        dataGold = tempGoldData[i];
        dataMatch = tempMatchData[i];

        // Do not need address and type of datagold
        delete dataGold["Address"];
        delete dataGold["Type"];

        // Get rid of the empty minutes in the data where the game wasn't being played
        Object.keys(dataGold).forEach((key) => (dataGold[key] == "") && delete dataGold[key]);
        Object.keys(dataGold).forEach(function (key) {
            if (!isNaN(dataGold[key])) {
                dataGold[key] = parseInt(dataGold[key]);
            }
        });

        // Turn object into list
        dataGold = Object.values(dataGold);

        // Define the line
        var valueline = d3.line()
            .x(function (d, i) { return xScale(i); })
            .y(function (d) { return yScale(d); })
            .curve(d3.curveMonotoneX);

        // Add the valueline path.
        svg.append("path")
            .data([dataGold])
            .attr("class", "line")
            .attr("id", `line${i}`)
            .attr("d", valueline)
            .attr("transform", `translate(${margin.left}, 0)`);

        // Change line colour based on winning team
        if (dataMatch["bResult"] > dataMatch["rResult"]) {
            d3.select(`#line${i}`).style("stroke", "#2d68c4"); // Blue Line
        } else {
            d3.select(`#line${i}`).style("stroke", "#DC143C"); // Red Line
        }
    }

    // Axes
    svg.attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("transform", `translate(${margin.left}, ${height})`)
        .call(d3.axisBottom(xScale))

    svg.append("g")
        .attr("transform", `translate(${margin.left * 2}, 0)`)
        .call(d3.axisLeft(yScale));

    // Title
    d3.select("#goldTitle").html("").append("text")
        .attr("x", (width / 2) + offset)
        .attr("y", (offset / 3) - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Gold Difference of each Team per Selected Game");
    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width + offset - margin.left)
        .attr("y", height + margin.top + 20)
        .text("Time");
    // Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + offset)
        .attr("x", -margin.top - offset)
        .text("Gold Difference")
}