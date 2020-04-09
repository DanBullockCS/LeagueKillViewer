window.onload = () => {
    changeView('#mapVis');
}

function pruneData(data, valuesToKeep) {
    let newData = []
    for (row of data) {
        let tmp = {};
        for (value of valuesToKeep) {
            if (!isNaN(row[value])) {
                tmp[value] = parseInt(row[value]);
            } else {
                tmp[value] = row[value];
            }
        }
        newData.push(tmp);
    }
    return newData;
}

function startMapVis() {
    d3.csv("dataset/kills.csv").then((data) => {
        data = data.slice(0, 1000);
        // Plot dots
        plotPoints(data);
    });
}

function startGoldVis() {
    var select = document.getElementById("goldGames");
    d3.csv("dataset/gold.csv").then((dataGold) => {
        d3.csv("dataset/matchinfo.csv").then((dataMatch) => {
            dataGold = dataGold.slice(0, 100);
            dataMatch = dataMatch.slice(0, 100);
            plotGold(dataGold, dataMatch, 0); // preload game 0

            for (let i = 0; i < dataMatch.length; i++) {
                select.add(new Option(dataMatch[i]["blueTeamTag"] + " vs " + dataMatch[i]["redTeamTag"]));
            }

            // Switching games
            d3.select('#goldGames')
                .on('change', function () {
                    plotGold(dataGold, dataMatch, select.selectedIndex);
                });
        });
    });
}

function changeView(view) {
    d3.selectAll(".tabLink").classed("tab-btn-active", false);
    d3.selectAll(".tab").classed("tab-active", false);
    d3.select(view).classed("tab-active", true);
    d3.select(view+"-btn").classed("tab-btn-active", true);
    switch(view) {
        case "#mapVis": 
            startMapVis();
            break;
        case "#goldVis": 
            startGoldVis();
            break;   
    }
}