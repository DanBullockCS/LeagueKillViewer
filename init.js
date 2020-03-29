window.onload = () => {
    d3.csv("dataset/kills.csv").then((data) => {
        data = data.slice(0, 1000);
        // Plot dots
        plotPoints(data);
    });

    d3.csv("dataset/gold.csv").then((dataGold) => {
        d3.csv("dataset/matchinfo.csv").then((dataMatch) => {
            dataGold = dataGold.slice(0, 100);
            dataMatch = dataMatch.slice(0, 100);
            plotGold(dataGold, dataMatch);
        });
    });
}