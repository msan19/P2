window.frameRate = 60;
window.mainGraph;
// DATA HANDLING

function initializeNodes(graph) {
    let output = [];
    for (let vertexId in graph["vertices"]) {
        output.push({
            id: graph["vertices"][vertexId]["id"],
            label: graph["vertices"][vertexId]["id"],
            x: graph["vertices"][vertexId]["position"]["x"],
            y: graph["vertices"][vertexId]["position"]["y"],
            color: "#000000",
            size: 8
        });
    }
    delete graph["vertices"];
    graph["nodes"] = output;
    return graph;
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
                    color: "#000000",
                    size: 4
                });
            }
        }
    }
    graph["edges"] = output;
    return graph;
}

function parseIncomingData(data) {
    forkliftSpeed = data.forkliftSpeed;
    initializeEdges(data.graph);
    initializeNodes(data.graph);
    return data;
}

// END --- DATA HANDLING --- END

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

window.socketManager.on(PackageTypes.warehouse, (warehouse) => {
    mainGraph = new Graph('sigmaContainer', parseIncomingData(cloneIncomingData(warehouse)).graph);
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