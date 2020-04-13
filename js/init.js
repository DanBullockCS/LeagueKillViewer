window.onload = init;
window.onresize = init;

function init() {
    initMapVis();
    initGoldVis();
    initPieVis();
}

function pruneData(data, values_to_keep) {
    let new_data = [];
    for (row of data) {
        let tmp = Object.assign({}, row);
        Object.keys(tmp).forEach((key) => values_to_keep.includes(key) || delete tmp[key]);
        new_data.push(tmp);
    }
    return new_data;
}