var hightlightcolor = "#ff0000";
var unFocusColor = "#e5e5e5";
// The id of the edge piece going from the selected forklift to it's next immidiete node
var forkliftHighlightEdgePathPiece = "highlightedEdgePiece";

class Graph {
    // 
    constructor(container, graph) {
        // See http://sigmajs.org/
        // returns neighbouring nodes i.e. nodes with a connecting edge
        sigma.classes.graph.addMethod('neighbors', function (nodeId) {
            var k,
                neighbors = {},
                index = this.allNeighborsIndex[nodeId] || {};

            for (k in index)
                neighbors[k] = this.nodesIndex[k];

            return neighbors;
        });

        this.sigmaGraph = new sigma({
            renderer: {
                container: container,
                type: 'canvas'
            },
            settings: {
                minEdgeSize: 0,
                maxEdgeSize: 0,
                minNodeSize: 0,
                maxNodeSize: 0,
                hideEdgesOnMove: true,
                labelThreshold: 16,
                // how much to zoom on double click
                doubleClickZoomingRatio: 1
            }
        });
        if (graph != null)
            this.sigmaGraph.graph.read(graph);
        this.addOriginalColorToElements();
        this.bindEvents();
        this.sigmaGraph.refresh();
    }

    // EVENT SECTION
    bindEvents() {
        this.sigmaGraph.bind('doubleClickStage', function (element) {
            mainGraph.onStageClick();
        });
        this.sigmaGraph.bind('clickNode', function (element) {
            mainGraph.onNodeClick(element);
        });
    }

    onStageClick() {
        window.selectedForklift = "";
        this.revertColorsToOriginal();
        this.sigmaGraph.refresh();
    }

    onNodeClick(element) {
        if (element.data.node.id[0] == "F") {
            selectedForklift = element.data.node.id;
            nForklifts.selectedForklift = element.data.node.id;
            if (typeof (forkliftData[selectedForklift]["route"]) != "undefined"
                && typeof (forkliftData[selectedForklift]["route"]["instructions"]) != "undefined") {
                let path = this.intepretInstructions(forkliftData[selectedForklift]["route"]["instructions"]);
                this.displayPath(path);
            }
        }
    }

    // END -- EVENT SECTION -- END

    intepretInstructions(instructions) {
        let nodesIds = [];
        let edgeIds = [];
        // add nodes
        for (let key in instructions) {
            nodesIds.push(instructions[key]["nodeId"]);
        }
        for (let key in nodesIds) {
            if (key > 0) {
                if (nodesIds[key] < nodesIds[key - 1])
                    edgeIds.push(nodesIds[key] + "," + nodesIds[key - 1]);
                else
                    edgeIds.push(nodesIds[key - 1] + "," + nodesIds[key]);
            }
        }
        return {
            nodes: nodesIds,
            edges: edgeIds
        };
    }

    static initializeNodes(graph) {
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

    static initializeEdges(graph) {
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

    static parseIncomingData(data) {
        window.forkliftSpeed = data.forkliftSpeed;
        Graph.initializeEdges(data.graph);
        Graph.initializeNodes(data.graph);
        return data;
    }

    static cloneIncomingData(data) {
        let forkliftSpeed = data.maxForkliftSpeed;
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
            });
        }
        let newData = {

            graph: {
                vertices: vertices
            },
            forkliftSpeed: forkliftSpeed
        };
        return newData;
    }

    // FORKLIFT
    addForkliftToGraph(forklift) {
        if (Forklifts.getIfForkliftHasPosition(forklift)) {
            this.sigmaGraph.graph.addNode({
                id: forklift.id,
                // See https://github.com/jacomyal/sigma.js/blob/master/examples/plugin-customShapes.html
                type: ShapeLibrary.enumerate().map(function (s) {
                    return s.name;
                })[0],
                x: forklift.position.x,
                y: forklift.position.y,
                color: "#ffff00",
                originalColor: "#ffff00",
                size: 14
            });

        }
    }

    updateForkliftOnGraph(forklift) {
        if (typeof (this.sigmaGraph.graph.nodes(forklift.id)) == "undefined")
            this.addForkliftToGraph(forklift);
        else {
            this.sigmaGraph.graph.nodes(forklift.id).x = forklift.position.x;
            this.sigmaGraph.graph.nodes(forklift.id).y = forklift.position.y;
        }
    }

    updateForkliftsOnGraph() {

        if (this.sigmaGraph === null || typeof (this.sigmaGraph) === "undefined")
            return;

        for (let key in forkliftData) {
            this.updateForkliftOnGraph(forkliftData[key]);
        }
        this.sigmaGraph.refresh();
    }
    // END --- FORKLIFT --- END

    // HIGHLIGHT COLOR SECTION
    addOriginalColorToElements() {
        this.sigmaGraph.graph.nodes().forEach(function (node) {
            node.originalColor = node.color;
        });
        this.sigmaGraph.graph.edges().forEach(function (edge) {
            edge.originalColor = edge.color;
        });
    }

    addForkliftHighlightToNextNode() {
        if (typeof (selectedForklift) == "string" && selectedForklift.length > 0 &&
            typeof (this.sigmaGraph.graph.nodes(selectedForklift)) != "undefined" && typeof (forkliftData[selectedForklift].route.instructions[0]) != "undefined" &&
            typeof (forkliftData[selectedForklift].route.instructions[0].nodeId) != "undefined") {
            this.sigmaGraph.graph.addEdge({
                id: forkliftHighlightEdgePathPiece,
                source: selectedForklift,
                target: forkliftData[selectedForklift].route.instructions[0].nodeId,
                size: 4,
                color: hightlightcolor
            });
        }
    }

    removeForkliftHighlightToNextNode() {
        if (typeof (this.sigmaGraph.graph.edges(forkliftHighlightEdgePathPiece)) != "undefined")
            this.sigmaGraph.graph.dropEdge(forkliftHighlightEdgePathPiece);
    }

    displaySelectedForkliftPath() {
        this.displayPath(this.intepretInstructions(forkliftData[selectedForklift].route.instructions));
    }

    displayPath(path) {
        this.hightlightPath(path);
        this.removeForkliftHighlightToNextNode();
        this.addForkliftHighlightToNextNode();
        this.sigmaGraph.refresh();
    }

    hightlightPath(path) {
        this.sigmaGraph.graph.nodes().forEach((element) => {
            if (element.id != selectedForklift)
                element.color = unFocusColor;
            else
                element.color = element.originalColor;
        });
        this.sigmaGraph.graph.edges().forEach((element) => {
            if (element.id != forkliftHighlightEdgePathPiece)
                element.color = unFocusColor;
        });

        for (let node in path.nodes)
            this.sigmaGraph.graph.nodes(path.nodes[node]).color = hightlightcolor;

        for (let edge in path.edges) {
            this.sigmaGraph.graph.edges(path.edges[edge]).color = hightlightcolor;
        }

    }

    revertColorsToOriginal() {
        this.removeForkliftHighlightToNextNode();
        this.sigmaGraph.graph.nodes().forEach((element) => {
            element.color = element.originalColor;
        });
        this.sigmaGraph.graph.edges().forEach((element) => {
            element.color = element.originalColor;
        });
    }
    // END -- HIGHLIGHT COLOR SECTION -- END
}