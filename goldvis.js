// Eventually I will do these things
function plotGold(dataGold, dataMatch) {
    var svg = d3.select("#goldChart");
    
    // Prune uneeded data
    dataMatch = pruneData(dataMatch, ["Address", "gamelength", "bResult", "rResult", "blueTeamTag", "redTeamTag"]);

    console.log(dataGold);
    console.log(dataMatch);
}
