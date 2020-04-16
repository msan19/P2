declare var sGraph;
var forkliftData: JSON;
enum ForkliftStates {
    idle = 1,
    hasOrder,
    charging,
    initiating
}

function updateForkliftsOnGraph() {
    addForkliftsToGraph(forkliftData);
}

function getForkliftColor(state: ForkliftStates): string {
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
function addForkliftToGraph(forkliftId: string, state: ForkliftStates, xPos: number, yPos: number): void {
    sGraph.graph.addNode({ "id": forkliftId, x: xPos, y: yPos, color: getForkliftColor(state), size: 8 });
}

function addForkliftsToGraph(data: JSON): void {
    for (let forklift in data) {
        addForkliftToGraph(data[forklift]["id"], data[forklift]["state"], data[forklift]["position"]["x"], data[forklift]["position"]["y"]);
    }
    sGraph.refresh();
}

function parseForklifts(data: JSON): void {
    let forklifts: JSON = JSON.parse("{}");
    //let currentGraph: JSON = getSGraphAsGraph();
    for (let forklift in data) {
        if (typeof (data[forklift]["id"]) == "undefined")
            continue;
        else if (typeof (data[forklift]["position"]) === "undefined" || typeof (data[forklift]["position"]["x"]) === "undefined" || typeof (data[forklift]["position"]["y"]) === "undefined") {
            forklifts[data[forklift]["id"]] = { id: data[forklift]["id"], position: { x: Math.random(), y: Math.random() }, state: data[forklift]["state"] };
        } else {
            forklifts[data[forklift]["id"]] = { id: data[forklift]["id"], position: { x: data[forklift]["x"], y: data[forklift]["y"] }, state: data[forklift]["state"] };
        }
    }
    forkliftData = forklifts;
    if (sGraph !== null)
        addForkliftsToGraph(forkliftData);
}

function addForklift(forkliftInfo) {
    document.querySelector("#forklift-list").innerHTML += `<li>${forkliftInfo.id}</li>`;
}
window["socketManager"].on(PackageTypes.forkliftInfos, (forklifts) => {
    document.querySelector("#forklift-list").innerHTML = "";
    for (let key in forklifts) {
        addForklift(forklifts[key]);
    }
    parseForklifts(forklifts);
});

window["socketManager"].on(PackageTypes.forkliftInfo, (forklift) => {
    addForklift(forklift);

});