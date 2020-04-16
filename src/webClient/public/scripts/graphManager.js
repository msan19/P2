const container = 'sigmaContainer';
const defaultNodeColorValue = '#5c3935';
const defaultEdgeColorValue = '#5c3935';
const defaultHighlightColorValue = "#F7362D";
const defaultLowDarkColorValue = "#e5e5e5";
const defaultNodeSizeValue = 8;
const defaultEdgeSizeValue = 4;
var sGraph;
var tempPath = JSON.parse(JSON.stringify({
    "nodes": [
        "N0-0",
        "N0-1",
        "N0-2",
        "N0-3",
        "N0-4",
        "N0-5",
        "N0-6",
        "N0-7",
        "N0-8",
        "N1-0",
        "N2-0"
    ],
    "edges": [
        "N0-0,N0-1",
        "N0-0,N1-0",
        "N0-1,N0-2",
        "N0-2,N0-3",
        "N0-3,N0-4",
        "N0-4,N0-5",
        "N0-5,N0-6",
        "N0-6,N0-7",
        "N0-7,N0-8",
        "N1-0,N2-0"
    ]
}));
// https://github.com/jacomyal/sigma.js/tree/master/plugins/sigma.exporters.svg
function exportGraph() {
    let output = sGraph.toSVG({
        download: true,
        filename: 'warehouseGraph.svg',
        size: 1000
    });
};

function parseWarehouse(data) {
    let iData = data;
    iData.graph = addEdges(iData.graph);
    iData.graph = changeNodes(iData.graph);
    initializeGraph(iData.graph);
}

function initializeGraph(graphO) {
    initializeGraphRelatedUiElements();
    // @ts-ignore
    sGraph = new sigma({
        graph: graphO,
        renderer: {
            container: document.getElementById(container),
            type: 'canvas'
        },
        settings: {
            minEdgeSize: 0,
            maxEdgeSize: 0,
            minNodeSize: 0,
            maxNodeSize: 0,
        }
    });
    sGraph.refresh();
    //hightlightPath(graphO, tempPath, null);
    // @ts-ignore
    //document.getElementById("export").disabled = false;
    // @ts-ignore
    //document.getElementById("reset").disabled = false;
}

function addEdges(graph) {
    let output = [];
    for (let vertexId_1 in graph["vertices"]) {
        for (let key in graph["vertices"][vertexId_1]["adjacentVertexIds"]) {
            let vertexId_2 = graph["vertices"][vertexId_1]["adjacentVertexIds"][key];
            if (vertexId_1 < vertexId_2) {
                output.push({
                    id: vertexId_1 + "," + vertexId_2,
                    source: vertexId_1,
                    target: vertexId_2,
                    color: defaultEdgeColorValue,
                    type: 'line',
                    size: defaultEdgeSizeValue
                });
            }
        }
    }
    graph["edges"] = output;
    return graph;
}

function changeNodes(graph) {
    let output = [];
    for (let vertexId in graph["vertices"]) {
        graph["vertices"][vertexId]["size"] = defaultNodeSizeValue;
        graph["vertices"][vertexId]["x"] = graph["vertices"][vertexId]["position"]["x"];
        graph["vertices"][vertexId]["y"] = graph["vertices"][vertexId]["position"]["y"];
        graph["vertices"][vertexId]["color"] = defaultNodeColorValue;
        graph["vertices"][vertexId]["label"] = graph["vertices"][vertexId]["id"];
        delete(graph["vertices"][vertexId]["position"]);
        delete(graph["vertices"][vertexId]["adjacentVertexIds"]);
        output.push({
            id: graph["vertices"][vertexId]["id"],
            label: graph["vertices"][vertexId]["id"],
            x: graph["vertices"][vertexId]["x"],
            y: graph["vertices"][vertexId]["y"],
            color: defaultNodeColorValue,
            size: defaultNodeSizeValue
        });
    }
    delete graph["vertices"];
    graph["nodes"] = output;
    return graph;
}

function hightlightPath(graph, path, color) {
    for (let nodeToFind in path["nodes"]) {
        let found = false;
        for (let nodeToCheck in graph["nodes"]) {
            if (path["nodes"][nodeToFind] == graph["nodes"][nodeToCheck]["id"]) {
                graph["nodes"][nodeToCheck]["color"] = (typeof (color) == "string") ? color : defaultHighlightColorValue;
                found = true;
                break;
            }
        }
    }
    for (let edgeToFind in path["edges"]) {
        let found = false;
        for (let edgeToCheck in graph["edges"]) {
            if (path["edges"][edgeToFind] == graph["edges"][edgeToCheck]["id"]) {
                graph["edges"][edgeToCheck]["color"] = color;
                found = true;
                break;
            }
        }
    }
    return graph;
}

function lowdark(graph, path, color) {
    for (let nodeToBeChecked in graph["nodes"]) {
        let found = false;
        for (let nodeToBeCheckedAgainst in path["nodes"]) {
            if (graph["nodes"][nodeToBeChecked]["id"] == path["nodes"][nodeToBeCheckedAgainst]) {
                found = true;
                break;
            }
        }
        if (found == false)
            graph["nodes"][nodeToBeChecked]["color"] = (typeof (color) == "string") ? color : defaultLowDarkColorValue;
    }
    for (let edgeToBeChecked in graph["edges"]) {
        let found = false;
        for (let edgeToBeCheckedAgainst in path["edges"]) {
            if (graph["edges"][edgeToBeChecked]["id"] == path["edges"][edgeToBeCheckedAgainst]) {
                found = true;
                break;
            }
        }
        if (found == false)
            graph["edges"][edgeToBeChecked]["color"] = (typeof (color) == "string") ? color : defaultLowDarkColorValue;
    }
    return graph;
}

function resetGraph() {
    tempPath = JSON.parse("{}");
    let graph = getSGraphAsGraph();
    setGraphColorToDefault(graph);
    sGraph.graph = graph;
    sGraph.refresh();
}

function initializeGraphRelatedUiElements() {
    sGraph = null;
    document.getElementById(container).innerHTML = "";
    // @ts-ignore
    //document.getElementById("export").disabled = "disabled";
    // @ts-ignore
    //document.getElementById("reset").disabled = "disabled";
    //@ts-ignore
    //document.getElementById("settings").style.visibility = "hidden";
    //@ts-ignore
    //document.getElementById("hightlightColorPicker").value = defaultHighlightColorValue;
    //@ts-ignore
    //document.getElementById("lowDarkColorPicker").value = defaultLowDarkColorValue;
    //@ts-ignore
    //document.getElementById("nodeSizeInput").value = defaultNodeSizeValue;
    //@ts-ignore
    //document.getElementById("edgeSizeInput").value = defaultEdgeSizeValue;
}

function onSettingsButtonClick() {
    let settingsMenu = document.querySelector("#settings");
    if (settingsMenu.style.visibility === "hidden") {
        settingsMenu.style.visibility = "visible";
    } else if (settingsMenu.style.visibility == "visible") {
        settingsMenu.style.visibility = "hidden";
    }
    //sGraph.graph.addNode({ "id": "qwe", x: 7.25, y: 0, size: 8 });
    sGraph.refresh();
}

function setGraphColorToDefault(graph) {
    for (let node in graph["nodes"])
        graph["nodes"][node]["color"] = defaultNodeColorValue;
    for (let edge in graph["edges"])
        graph["edges"][edge]["color"] = defaultEdgeColorValue;
    return graph;
}

function getSGraphAsGraph() {
    let graph = JSON.parse("{}");
    graph["edges"] = sGraph.graph.edges();
    graph["nodes"] = sGraph.graph.nodes();
    return graph;
}

function updateNodeSizes(graph, size) {
    for (let nodeIndex in graph["nodes"]) {
        graph["nodes"][nodeIndex]["size"] = size;
    }
    return graph;
}

function updateEdgeSizes(graph, size) {
    for (let edgeIndex in graph["edges"]) {
        graph["edges"][edgeIndex]["size"] = size;
    }
    return graph;
}

function updateHighlightColor() {
    let hightlightColorPicker = document.querySelector("#hightlightColorPicker");
    sGraph.graph = hightlightPath(getSGraphAsGraph(), tempPath, hightlightColorPicker.value);
    sGraph.refresh();
}

function updateLowDarkColor() {
    let lowDarkColorPicker = document.querySelector("#lowDarkColorPicker");
    sGraph.graph = lowdark(getSGraphAsGraph(), tempPath, lowDarkColorPicker.value);
    sGraph.refresh();
}

function onUpdateNodeSizeChange() {
    let nodeSizeInput = document.querySelector("#nodeSizeInput");
    sGraph.graph = updateNodeSizes(getSGraphAsGraph(), +nodeSizeInput.value);
    sGraph.refresh();
}

function onUpdateEdgeSizeChange() {
    let edgeSizeInput = document.querySelector("#edgeSizeInput");
    sGraph.graph = updateEdgeSizes(getSGraphAsGraph(), +edgeSizeInput.value);
    sGraph.refresh();
}
window["socketManager"].on(SocketManager.PackageTypes.warehouse, (warehouse) => {
    parseWarehouse(warehouse);
    updateForkliftsOnGraph();
});