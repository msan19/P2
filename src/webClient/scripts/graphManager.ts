const container: string = 'sigmaContainer';
const defaultNodeColor = '#5c3935';
const defaultEdgeColor = '#5c3935';
var sGraph;
var tempPath: JSON = JSON.parse(JSON.stringify({
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
        "N0-9",
        "N1-9",
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
        "N0-8,N0-9"
    ]
}));

enum PackageTypes {
    route = "route",
    routes = "routes",
    forkliftInfo = "forkliftInfo",
    forkliftInfos = "forkliftInfos",
    order = "order",
    orders = "orders",
    warehouse = "warehouse",
    json = "json",
    other = "other"
}



// https://github.com/jacomyal/sigma.js/tree/master/plugins/sigma.exporters.svg
function exportGraph(): void {
    console.log('exporting...');
    let output = sGraph.toSVG({ download: true, filename: 'warehouseGraph.svg', size: 1000 });
};


function parseJSON(data: JSON): any {
    let iData: any = data;


    iData.graph = addEdges(iData.graph);
    iData.graph = changeNodes(iData.graph);


    updateGraph(iData.graph);
}

function updateGraph(graphO: JSON): void {
    let newGraph: JSON = hightlightPath(graphO, tempPath);
    //newGraph = lowdark(graphO, tempPath);
    console.log(newGraph);
    // @ts-ignore
    sGraph = new sigma({
        graph: newGraph,
        container: container,
        settings: {
            // This sets the thickness/size of edges and nodes
            minEdgeSize: 1,
            maxEdgeSize: 8,
            minNodeSize: 1,
            maxNodeSize: 8
        }
    });



}

function addEdges(graph: JSON): JSON {
    let output = [];
    for (let vertexId_1 in graph["vertices"]) {
        for (let key in graph["vertices"][vertexId_1]["adjacentVertexIds"]) {
            let vertexId_2 = graph["vertices"][vertexId_1]["adjacentVertexIds"][key];
            if (vertexId_1 < vertexId_2) {
                output.push({ "source": vertexId_1, "target": vertexId_2, "id": vertexId_1 + "," + vertexId_2, "color": defaultEdgeColor, "size": 2 });
            }
        }
    }
    graph["edges"] = output;
    return graph;
}

function changeNodes(graph: JSON): JSON {
    let output = [];
    for (let vertexId in graph["vertices"]) {
        graph["vertices"][vertexId]["size"] = 4;
        graph["vertices"][vertexId]["x"] = graph["vertices"][vertexId]["position"]["x"];
        graph["vertices"][vertexId]["y"] = graph["vertices"][vertexId]["position"]["y"];
        graph["vertices"][vertexId]["color"] = defaultNodeColor;
        delete (graph["vertices"][vertexId]["position"]);
        delete (graph["vertices"][vertexId]["adjacentVertexIds"]);

        output.push(
            graph["vertices"][vertexId]
        );
    }
    delete graph["vertices"];


    graph["nodes"] = output;
    return graph;
}

function hightlightPath(graph: JSON, path: JSON): JSON {
    for (let node in path["nodes"])
        graph["nodes"][node]["color"] = "#F7362D";
    for (let edge in path["edges"]) {
        graph["edges"][edge]["color"] = "#F7362D";
        graph["edges"][edge]["size"] = 4;
    }

    return graph;
}

function lowdark(graph: JSON, path: JSON): JSON | null {
    console.log(path);
    for (let nodeToBeChecked in graph["nodes"]) {
        let found: boolean = false;
        for (let nodeToBeCheckedAgainst in path["nodes"]) {
            if (graph["nodes"][nodeToBeChecked]["id"] == path["nodes"][nodeToBeCheckedAgainst]) {
                found = true;
                break;
            }
        }

        if (!found)
            console.log(graph["nodes"][nodeToBeChecked]["id"]);
        //graph["nodes"][nodeToBeChecked]["color"] = "#e5e5e5";

    }
    return graph;
}

var webSocket = new WebSocket("ws://localhost:8080/subscribe");
webSocket.onmessage = function (event) {
    let data = JSON.parse(event["data"]);
    switch (data.type) {
        case PackageTypes.warehouse:
            console.log(data.body);
            parseJSON(data.body);
            break;
        default:
            console.log("Unhandled type: " + data.type);
            break;
    }

};



