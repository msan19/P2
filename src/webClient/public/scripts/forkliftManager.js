var forkliftData;
var ForkliftStates;
(function (ForkliftStates) {
    ForkliftStates[ForkliftStates["idle"] = 1] = "idle";
    ForkliftStates[ForkliftStates["hasOrder"] = 2] = "hasOrder";
    ForkliftStates[ForkliftStates["charging"] = 3] = "charging";
    ForkliftStates[ForkliftStates["initiating"] = 4] = "initiating";
})(ForkliftStates || (ForkliftStates = {}));

function updateForkliftOnGraph(graph, forkliftKey, nodeKey) {
    graph["nodes"][nodeKey]["x"] = forkliftData[forkliftKey]["position"]["x"];
    graph["nodes"][nodeKey]["y"] = forkliftData[forkliftKey]["position"]["y"];
    graph["nodes"][nodeKey]["state"] = forkliftData[forkliftKey]["state"];
    return graph;
}

function updateForkliftsOnGraph() {
    // if (sGraph === null)
    //     return;
    // let graph = getSGraphAsGraph();
    // // Go through each forklift in the forklift data
    // // Which will update the forklift on the graph
    // for (let key in forkliftData) {
    //     let found = false;
    //     for (let nodeKey in graph["nodes"]) {
    //         if (forkliftData[key]["id"] == graph["nodes"][nodeKey]["id"]) {
    //             graph = updateForkliftOnGraph(graph, key, nodeKey);
    //             found = true;
    //         }

    //     }

    //     if (!found) {
    //         if (getIfForkliftHasPosition(forkliftData[key])) {
    //             addForkliftToGraph(forkliftData[key]["id"], forkliftData[key]["state"], forkliftData[key]["position"]["x"], forkliftData[key]["position"]["y"]);
    //         }
    //     }


    // }
    // sGraph.graph = graph;
    // sGraph.refresh();
}

function getForkliftColor(state) {
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
    //console.log(forkliftId);
    sGraph.graph.addNode({
        "id": forkliftId,
        x: xPos,
        y: yPos,
        color: getForkliftColor(state),
        size: 8
    });
}

function getIfForkliftHasPosition(forklift) {
    if (typeof (forklift["position"]) === "undefined" || typeof (forklift["position"]["x"]) === "undefined" || typeof (forklift["position"]["y"]) === "undefined")
        return false;
    else
        return true;
}

function parseForklifts(data) {
    let forklifts = JSON.parse("{}");
    //let currentGraph: JSON = getSGraphAsGraph();
    for (let key in data) {
        if (typeof (data[key]["id"]) == "undefined")
            continue;
        else if (getIfForkliftHasPosition(data[key])) {
            forklifts[data[key]["id"]] = {
                id: data[key]["id"],
                state: data[key]["state"]
            };
        } else {
            forklifts[data[key]["id"]] = {
                id: data[key]["id"],
                position: {
                    x: data[key]["x"],
                    y: data[key]["y"]
                },
                state: data[key]["state"]
            };
        }
    }
    forkliftData = forklifts;
    // if (sGraph !== null)
    //     addForkliftsToGraph(forkliftData);
}

function addForkliftToUi(forkliftInfo) {
    document.querySelector("#forklift-list").innerHTML += `<li>${forkliftInfo.id}</li>`;
    document.querySelectorAll('.select-forklift').forEach((item) => {
        item.innerHTML += `<option value=${forkliftInfo.id}>${forkliftInfo.id}</option>`;
    });
}

function addTestDataToForklifts() {
    let date = new Date();
    for (let key in forkliftData) {
        if (typeof (forkliftData[key]["route"] == undefined)) {
            if (forkliftData[key]["id"] == "F0") {
                forkliftData[key]["route"] = {
                    instructions: {
                        0: {
                            nodeId: "N0-0",
                            startTime: date.getTime()
                        },
                        1: {
                            nodeId: "N0-1",
                            startTime: date.getTime()
                        },
                        2: {
                            nodeId: "N0-2",
                            startTime: date.getTime()
                        },
                        3: {
                            nodeId: "N0-3",
                            startTime: date.getTime()
                        },
                        4: {
                            nodeId: "N0-4",
                            startTime: date.getTime()
                        },
                    }
                };
            }
        }

    }
}

function calculateAndUpdateForkliftPositionData() {
    for (let key in forkliftData) {

    }
}

window.setInterval(function () {
    updateForkliftsOnGraph();
    addTestDataToForklifts();
}, 500);

window.socketManager.on(PackageTypes.forkliftInfos, (forklifts) => {
    document.querySelectorAll('.select-forklift').forEach((item) => {
        item.innerHTML = "";
    });
    document.querySelector("#forklift-list").innerHTML = "";
    for (let key in forklifts) {
        addForkliftToUi(forklifts[key]);
    }
    parseForklifts(forklifts);
});

window.socketManager.on(PackageTypes.forkliftInfo, (forklift) => {
    addForkliftToUi(forklift);
});