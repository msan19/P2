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

function getIfForkliftHasPosition(forklift: JSON): boolean {
    if (typeof (forklift["position"]) === "undefined" || typeof (forklift["position"]["x"]) === "undefined" || typeof (forklift["position"]["y"]) === "undefined")
        return false;
    else
        return true;
}

function addForkliftsToGraph(data: JSON): void {
    for (let forklift in data) {
        if (getIfForkliftHasPosition(data[forklift]))
            addForkliftToGraph(data[forklift]["id"], data[forklift]["state"], data[forklift]["position"]["x"], data[forklift]["position"]["y"]);
    }
    sGraph.refresh();
}

function parseForklifts(data: JSON): void {
    let forklifts: JSON = JSON.parse("{}");
    //let currentGraph: JSON = getSGraphAsGraph();
    for (let key in data) {
        if (typeof (data[key]["id"]) == "undefined")
            continue;
        else if (getIfForkliftHasPosition(data[key])) {
            forklifts[data[key]["id"]] = { id: data[key]["id"], state: data[key]["state"] };
        } else {
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