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

function plotPoints(data, svg, dim) {
    var svg = d3.select("#chart");
    var controls = d3.select("#controls");
    var width = d3.select("#vis").node().getBoundingClientRect().width /= 1.425;
    var height = d3.select("#map").node().getBoundingClientRect().height /= 1.275;

    // Fixed to make the chart align with the map
    svg.style("width", width);
    svg.style("height", height);

    // Prune uneeded data
    data = pruneData(data, ["x_pos", "y_pos", "Time"]);
    // Create scales for x, y, color, and brush
    let xScale = d3.scaleLinear().domain(
        d3.extent(data, d => d["x_pos"])
    ).range([width, 0]);

    let yScale = d3.scaleLinear().domain(
        d3.extent(data, d => d["y_pos"])
    ).range([0, height]);

    let colorScale = d3.scaleSequential(d3.interpolateOrRd).domain(d3.extent(data, d => d["Time"]));
    let brushDim = [20,
        d3.select("#vis").node().getBoundingClientRect().width - 20]; // The max that the brush can go to
    let brushScale = d3.scaleLinear().domain([brushDim[0], brushDim[1]]).range(d3.extent(data, d => d["Time"]));

    // On brush move update the chart
    function brushed() {
        let pos = d3.event.selection;
        svg.selectAll("circle").data(data.filter((d) => {
            return (d["Time"] >= brushScale(pos[0]) && d["Time"] <= brushScale(pos[1]))
        })).join(
            enter => enter.append("circle")
                .attr("cx", d => xScale(d["x_pos"]))
                .attr("cy", d => yScale(d["y_pos"]))
                .attr("r", 4)
                .style("fill", d => colorScale(d["Time"])),
            update => update//.transition()
                .attr("cx", d => xScale(d["x_pos"]))
                .attr("cy", d => yScale(d["y_pos"]))
                .style("fill", d => colorScale(d["Time"])),
            exit => exit.remove()
        );
    }

    // Create the brush 
    let brush = d3.brushX()
        .extent([[brushDim[0], 0], [brushDim[1], 25]])
        .on("brush", brushed)
    // .on("end", brushended);
    controls.append("g")
        .call(brush)
        .call(brush.move, [brushDim[0], 140]);

    // Create the axis for the brush
    controls.append("g")
        .call(d3.axisBottom(
            d3.scaleLinear()
                .domain(d3.extent(data, d => d["Time"]))
                .range([brushDim[0], brushDim[1]])));
}

function showAnnotations() {
    let isChecked = document.getElementById("mapLabelChkBox").checked;
    if (!isChecked) {
        document.getElementById("mapAnnotations").style.display = "none";
    } else {
        document.getElementById("mapAnnotations").style.display = "block";
    }
}
