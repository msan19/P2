var forkliftData;
var ForkliftStates;
window.selectedForklift = "";
(function (ForkliftStates) {
    ForkliftStates[ForkliftStates["idle"] = 1] = "idle";
    ForkliftStates[ForkliftStates["hasOrder"] = 2] = "hasOrder";
    ForkliftStates[ForkliftStates["charging"] = 3] = "charging";
    ForkliftStates[ForkliftStates["initiating"] = 4] = "initiating";
})(ForkliftStates || (ForkliftStates = {}));

function addForkliftClickDetectionAndHandling() {
    sGraph.bind('clickNode', function (e) {
        let graph = {
            nodes: sGraph.graph.nodes(),
            edges: sGraph.graph.edges()
        }
        if (e.data.node.id[0] == "F") {
            selectedForklift = e.data.node.id;
            if (typeof (forkliftData[selectedForklift]["route"]) != "undefined" && typeof (forkliftData[selectedForklift]["route"]["instructions"]) != "undefined") {
                let path = intepretInstructions(forkliftData[selectedForklift]["route"]["instructions"]);
                displayPath(graph, path, null, null);
            }

        } else {
            setGraphColorToDefault(graph);
            selectedForklift = "";
        }
    })
}

function updateForkliftOnGraph(forkliftId) {
    let nodes = sGraph.graph.nodes();
    nodes[graphInformation["nodeIndexes"][forkliftId]]["x"] = forkliftData[forkliftId]["position"]["x"];
    graphInformation["nodes"][graphInformation["nodeIndexes"][forkliftId]]["x"] = forkliftData[forkliftId]["position"]["x"];
    nodes[graphInformation["nodeIndexes"][forkliftId]]["y"] = forkliftData[forkliftId]["position"]["y"];
    graphInformation["nodes"][graphInformation["nodeIndexes"][forkliftId]]["y"] = forkliftData[forkliftId]["position"]["y"];
}

function updateForkliftsOnGraph() {
    if (sGraph === null)
        return;
    //Go through each forklift in the forklift data
    //Which will update the forklift on the graph
    for (let key in forkliftData) {
        if (typeof (graphInformation["nodeIndexes"][forkliftData[key]["id"]]) != "undefined") {
            updateForkliftOnGraph(forkliftData[key]["id"]);
        } else {
            // if the forklift isn't on the graph already it adds it
            if (getIfForkliftHasPosition(forkliftData[key])) {
                graphInformation["nodeIndexes"][forkliftData[key]["id"]] = JSON.stringify(graphInformation["nodes"].length);
                graphInformation["nodes"][graphInformation["nodeIndexes"][forkliftData[key]["id"]]] = {
                    id: forkliftData[key]["id"],
                    // See https://github.com/jacomyal/sigma.js/blob/master/examples/plugin-customShapes.html
                    type: ShapeLibrary.enumerate().map(function (s) {
                        return s.name;
                    })[0],
                    x: forkliftData[key]["position"]["x"],
                    y: forkliftData[key]["position"]["y"],
                    color: getForkliftColor(forkliftData[key]["state"]),
                    size: 14
                }
                sGraph.graph.addNode(graphInformation["nodes"][graphInformation["nodeIndexes"][forkliftData[key]["id"]]]);
            }
        }
    }
    sGraph.refresh();
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

function getIfForkliftHasPosition(forklift) {
    if (typeof (forklift["position"]) === "undefined" || typeof (forklift["position"]["x"]) === "undefined" || typeof (forklift["position"]["y"]) === "undefined")
        return false;
    else
        return true;
}

function parseForklifts(data) {
    let forklifts = [];
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

function intepretInstructions(instructions) {
    let nodesIds = [];
    let edgeIds = [];

    for (let key in instructions) {
        if (!nodesIds.includes(instructions[key]["nodeId"]))
            nodesIds.push(instructions[key]["nodeId"]);
    }
    for (let key in nodesIds) {
        edgeIds.push(nodesIds[key]);
        if (key != 0)
            edgeIds[key - 1] += "," + nodesIds[key];
    }
    let correctedEdgeIds = [];
    for (let key in edgeIds) {
        if (!correctedEdgeIds.includes(edgeIds[key]))
            correctedEdgeIds.push(edgeIds[key]);
    }
    return {
        nodes: nodesIds,
        edges: correctedEdgeIds
    }
}

function calculateAndUpdateForkliftPositionData() {
    for (let key in forkliftData) {
        // find forklifts with active route
        if (typeof (forkliftData[key]["route"]) != "undefined") {
            // set position to beginning of route if it doesn't have one
            // REMOVE WHEN NOT NEEDED FOR TESTING
            if (typeof (forkliftData[key]["position"]) != "undefined" ||
                typeof (forkliftData[key]["position"]["x"]) != "undefined" ||
                typeof (forkliftData[key]["position"]["y"]) != "undefined") {
                let node = graphInformation["nodes"][
                    graphInformation["nodeIndexes"][forkliftData[key]["route"]["instructions"][0]["nodeId"]]
                ]
                forkliftData[key]["position"] = {
                    x: node["x"],
                    y: node["y"]
                }
            }
        }
    }
}

window.setInterval(function () {
    updateForkliftsOnGraph();
    calculateAndUpdateForkliftPositionData();
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
    addTestDataToForklifts();
});

window.socketManager.on(PackageTypes.forkliftInfo, (forklift) => {
    addForkliftToUi(forklift);
});