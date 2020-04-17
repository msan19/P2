const container = 'sigmaContainer';
const defaultNodeColorValue = '#5c3935';
const defaultEdgeColorValue = '#5c3935';
const defaultHighlightColorValue = "#F7362D";
const defaultLowDarkColorValue = "#e5e5e5";
const defaultNodeSizeValue = 8;
const defaultEdgeSizeValue = 4;
// contains nodes and the index of their id
window.graphInformation;
window.sGraph;
window.selectedForklift = "";
var moveSpeed;
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
    ],
    "edges": [
        "N0-0,N0-1",
        "N0-1,N0-2",
        "N0-2,N0-3",
        "N0-3,N0-4",
        "N0-4,N0-5",
        "N0-5,N0-6",
        "N0-6,N0-7",
        "N0-7,N0-8",
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
    // get forklift speed
    moveSpeed = data["forkliftSpeed"];
    // parse physical warehouse
    let iData = data.graph;
    iData = initializeEdges(iData);
    iData = initializeNodes(iData);
    initializeGraph(iData);
    console.log(iData);
}

function initializeGraph(graphO) {
    // Clear graph
    sGraph = null;
    document.getElementById(container).innerHTML = "";
    // create sigma graph
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

    sGraph.bind('clickNode', function (e) {
        let graph = {
            nodes: sGraph.graph.nodes(),
            edges: sGraph.graph.edges()
        }
        if (e.data.node.id[0] == "F") {
            selectedForklift = e.data.node.id;
            if (typeof (forkliftData[selectedForklift]["route"]) != "undefined" && typeof (forkliftData[selectedForklift]["route"]["instructions"]) != "undefined") {
                let path = intepretInstructions(forkliftData[selectedForklift]["route"]["instructions"]);
                hightlightPath(graph, path, null);
                lowdark(graph, path, null);
                sGraph.graph = graph;
            }

        } else {
            setGraphColorToDefault(graph);
            selectedForklift = "";
        }
        console.log(selectedForklift);
    })
    graphInformation = graphO;
    // apply sigma graph
    sGraph.refresh();
}

function initializeEdges(graph) {
    let output = [];
    for (let key in graph["vertices"]) {
        for (let key2 in graph["vertices"][key]["adjacentVertexIds"]) {

            let vertexId_1 = graph["vertices"][key]["id"];
            let vertexId_2 = graph["vertices"][key]["adjacentVertexIds"][key2];
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

function initializeNodes(graph) {
    let output = [];
    let outputIndex = {};
    for (let vertexId in graph["vertices"]) {
        output.push({
            id: graph["vertices"][vertexId]["id"],
            label: graph["vertices"][vertexId]["id"],
            x: graph["vertices"][vertexId]["position"]["x"],
            y: graph["vertices"][vertexId]["position"]["y"],
            color: defaultNodeColorValue,
            size: defaultNodeSizeValue
        });
        outputIndex[(graph["vertices"][vertexId]["id"])] = vertexId;
    }
    delete graph["vertices"];
    graph["nodes"] = output;
    graph["nodeIndexes"] = outputIndex;
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
        if (graph["nodes"][nodeToBeChecked]["id"][0] == "F")
            continue;
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

function setGraphColorToDefault(graph) {
    for (let node in graph["nodes"]) {
        if (graph["nodes"][node]["id"][0] != "F")
            graph["nodes"][node]["color"] = defaultNodeColorValue;
    }
    for (let edge in graph["edges"])
        graph["edges"][edge]["color"] = defaultEdgeColorValue;
    return graph;
}

// add error handling
// NOTE: changes vertices from object to array
function cloneIncomingData(data) {
    let forkliftSpeed = data.forkliftSpeed;
    let vertices = [];
    for (let verticeKey in data["graph"]["vertices"]) {
        let adjacentVertexIds = [];
        for (let adjacentVertexKey in data["graph"]["vertices"][verticeKey]["adjacentVertexIds"]) {
            adjacentVertexIds.push(data["graph"]["vertices"][verticeKey]["adjacentVertexIds"][adjacentVertexKey]);
        }
        let scheduleItems = [];
        for (let scheduleItemsKey in data["graph"]["vertices"][verticeKey]["scheduleItems"])
            position.push(data["graph"]["vertices"][verticeKey]["scheduleItems"][scheduleItemsKey]);
        vertices.push({
            adjacentVertexIds: adjacentVertexIds,
            id: data["graph"]["vertices"][verticeKey]["id"],
            isVisited: data["graph"]["vertices"][verticeKey]["isVisited"],
            label: data["graph"]["vertices"][verticeKey]["label"],
            position: {
                x: data["graph"]["vertices"][verticeKey]["position"]["x"],
                y: data["graph"]["vertices"][verticeKey]["position"]["y"]

            },
            previousVertex: data["graph"]["vertices"][verticeKey]["previousVertex"],
            scheduleItems: scheduleItems
        })
    }
    let newData = {

        graph: {
            vertices: vertices
        },
        forkliftSpeed: forkliftSpeed
    };
    return newData;
}

window["socketManager"].on(SocketManager.PackageTypes.warehouse, (warehouse) => {
    parseWarehouse(cloneIncomingData(warehouse));
});

window.socketManager.on(PackageTypes.warehouse, (warehouse) => {
    document.querySelectorAll('.select-vertex').forEach((item) => {
        item.innerHTML = "";
    });
    for (let key in warehouse.graph.vertices) {
        let vertexId = warehouse.graph.vertices[key].id;
        document.querySelectorAll('.select-vertex').forEach((item) => {
            item.innerHTML += `<option value="${vertexId}">${vertexId}</option>`;
        });
    }
});