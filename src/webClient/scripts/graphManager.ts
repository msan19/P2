const container: string = 'sigmaContainer';

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





class tempGraph {
    graph = {
        vertices: {}
    };
}
function parseJSON(data: any): any {
    let iData: tempGraph = data;

    console.log(iData.graph);

    addEdges(iData);
    changeNodes(iData);


    updateGraph(iData.graph);

}

function updateGraph(graphO: any): void {
    console.log(graphO);
    // @ts-ignore
    let s = new sigma({
        graph: graphO,
        container: container
    });
}

function addEdges(graph: any): JSON {
    let output = [];
    for (let vertexId_1 in graph["graph"]["vertices"]) {
        for (let key in graph["graph"]["vertices"][vertexId_1]["adjacentVertexIds"]) {
            let vertexId_2 = graph["graph"]["vertices"][vertexId_1]["adjacentVertexIds"][key];
            if (vertexId_1 < vertexId_2) {
                output.push({ "source": vertexId_1, "target": vertexId_2, "id": Math.random().toString() });
            }
        }
    }
    graph["graph"]["edges"] = output;
    return graph;
}

function changeNodes(graph: any): void {
    let output = [];
    for (let vertexId in graph["graph"]["vertices"]) {
        graph["graph"]["vertices"][vertexId]["size"] = 2;
        graph["graph"]["vertices"][vertexId]["color"] = "#666";
        graph["graph"]["vertices"][vertexId]["x"] = graph["graph"]["vertices"][vertexId]["position"]["x"];
        graph["graph"]["vertices"][vertexId]["y"] = graph["graph"]["vertices"][vertexId]["position"]["y"];
        delete (graph["graph"]["vertices"][vertexId]["position"]);
        delete (graph["graph"]["vertices"][vertexId]["adjacentVertexIds"]);

        output.push(
            graph["graph"]["vertices"][vertexId]
        );
    }
    delete graph["graph"]["vertices"];


    graph["graph"]["nodes"] = output;
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