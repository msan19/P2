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
                maxNodeSize: 0
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
        this.sigmaGraph.bind('clickStage', function (element) {
            mainGraph.onStageClick();
        });
        this.sigmaGraph.bind('clickNode', function (element) {
            mainGraph.onNodeClick(element);
        });
    }

    onStageClick() {
        selectedForklift = "";
        this.revertColorsToOriginal();
        this.sigmaGraph.refresh();
    }

    onNodeClick(element) {
        if (element.data.node.id[0] == "F") {
            selectedForklift = element.data.node.id;
            if (typeof (forkliftData[selectedForklift]["route"]) != "undefined" && typeof (forkliftData[selectedForklift]["route"]["instructions"]) != "undefined") {
                let path = intepretInstructions(forkliftData[selectedForklift]["route"]["instructions"]);
                this.displayPath(path);
            }
        }
    }

    // END -- EVENT SECTION -- END

    // FORKLIFT
    addForkliftToGraph(forklift) {
        if (getIfForkliftHasPosition(forklift)) {
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
            console.log(key)
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
        this.displayPath(intepretInstructions(forkliftData[selectedForklift].route.instructions));
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