const container: string = 'sigma-container';

const data = {
    "graph": {
        "vertices": [
            {
                "id": "{bfa72706-befb-41d7-9ffb-2ede77607eea}",
                "label": "Delivery",
                "position": {
                    "x": 0,
                    "y": 0
                }
            },
            {
                "id": "{0a54192e-9117-40cc-8f97-0265fd590131}",
                "label": "CheeseCake",
                "position": {
                    "x": -10,
                    "y": 14.5
                }
            }
        ],
        "edges": [
            {
                "vertexId_1": "{bfa72706-befb-41d7-9ffb-2ede77607eea}",
                "vertexId_2": "{0a54192e-9117-40cc-8f97-0265fd590131}",
                "label": "Optional Label"
            }
        ]
    }
};



class tempGraph {
    graph = {
        vertices: [],
        edges: []
    };
}

parseJSON(JSON.stringify(data));

function parseJSON(data: any): any {
    let iData: tempGraph = JSON.parse(data);

    for (let i in iData.graph.edges) {
        iData.graph.edges[i]["id"] = Math.random().toString();
        iData.graph.edges[i]["source"] = iData.graph.edges[i]["vertexId_1"];
        iData.graph.edges[i]["target"] = iData.graph.edges[i]["vertexId_2"];
        delete (iData.graph.edges[i]["vertexId_1"]);
        delete (iData.graph.edges[i]["vertexId_2"]);
    }

    for (let i in iData.graph.vertices) {
        iData.graph.vertices[i]["size"] = Math.random();
        iData.graph.vertices[i]["color"] = "#666";
        iData.graph.vertices[i]["x"] = iData.graph.vertices[i]["position"]["x"];
        iData.graph.vertices[i]["y"] = iData.graph.vertices[i]["position"]["y"];
        delete (iData.graph.vertices[i]["position"]["x"]);
        delete (iData.graph.vertices[i]["position"]["y"]);

    }

    iData.graph["nodes"] = iData.graph["vertices"];
    delete (iData.graph["vertices"]);


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