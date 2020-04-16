var forkliftData;
var ForkliftStates;
(function (ForkliftStates) {
    ForkliftStates[ForkliftStates["idle"] = 1] = "idle";
    ForkliftStates[ForkliftStates["hasOrder"] = 2] = "hasOrder";
    ForkliftStates[ForkliftStates["charging"] = 3] = "charging";
    ForkliftStates[ForkliftStates["initiating"] = 4] = "initiating";
})(ForkliftStates || (ForkliftStates = {}));
function updateForkliftOnGraph(forkliftKey, nodeKey) {
}
function updateForkliftsOnGraph() {
    // Go through each forklift in the forklift data
    // Which will update the forklift on the graph
    for (let key in forkliftData) {
        // Go through each node on the graph to find the forklift
        // Or initiate it if it doesn't exist.
        let found = false;
        for (let nodeKey in sGraph["nodes"]) {
            // Found forklift
            if (forkliftData[key] == sGraph["nodes"][nodeKey]) {
                updateForkliftOnGraph(key, nodeKey);
                break;
            }
        }
    }
    addForkliftsToGraph(forkliftData);
    sGraph.refresh();
}
function getForkliftColor(state) {
    console.log(state);
    switch (state) {
        case ForkliftStates.idle:
            return "#f9f57b";
        case ForkliftStates.charging:
            return "#ff0000";
        case ForkliftStates.hasOrder:
            return "#00ff00";
        case ForkliftStates.initiating:
            return "#f9f57b";
    }
}
function addForkliftToGraph(forkliftId, state, xPos, yPos) {
    sGraph.graph.addNode({ "id": forkliftId, x: xPos, y: yPos, color: getForkliftColor(state), size: 8 });
}
function getIfForkliftHasPosition(forklift) {
    if (typeof (forklift["position"]) === "undefined" || typeof (forklift["position"]["x"]) === "undefined" || typeof (forklift["position"]["y"]) === "undefined")
        return false;
    else
        return true;
}
function addForkliftsToGraph(data) {
    for (let forklift in data) {
        if (getIfForkliftHasPosition(data[forklift]))
            addForkliftToGraph(data[forklift]["id"], data[forklift]["state"], data[forklift]["position"]["x"], data[forklift]["position"]["y"]);
    }
}
function parseForklifts(data) {
    let forklifts = JSON.parse("{}");
    //let currentGraph: JSON = getSGraphAsGraph();
    for (let key in data) {
        if (typeof (data[key]["id"]) == "undefined")
            continue;
        else if (getIfForkliftHasPosition(data[key])) {
            forklifts[data[key]["id"]] = { id: data[key]["id"], state: data[key]["state"] };
        }
        else {
            forklifts[data[key]["id"]] = { id: data[key]["id"], position: { x: data[key]["x"], y: data[key]["y"] }, state: data[key]["state"] };
        }
    }
    forkliftData = forklifts;
    if (sGraph !== null)
        addForkliftsToGraph(forkliftData);
}
function addForkliftToUi(forkliftInfo) {
    document.querySelector("#forklift-list").innerHTML += `<li>${forkliftInfo.id}</li>`;
}
window.setInterval(function () {
    updateForkliftsOnGraph();
}, 500);
window["socketManager"].on(PackageTypes.forkliftInfos, (forklifts) => {
    document.querySelector("#forklift-list").innerHTML = "";
    for (let key in forklifts) {
        addForkliftToUi(forklifts[key]);
    }
    parseForklifts(forklifts);
});
window["socketManager"].on(PackageTypes.forkliftInfo, (forklift) => {
    addForkliftToUi(forklift);
});
