// Initialize sigma:
var s = new sigma(
{
    renderer: {
        container: document.getElementById('sigma-container'),
        type: 'canvas'
    },
    settings: {
        // This sets the thickness/size of edges and nodes
        minEdgeSize: 0.1,
        maxEdgeSize: 2,
        minNodeSize: 1,
        maxNodeSize: 8,
    }
    }
);

// Create a graph object
var graph = {
nodes: [
{ id: "n0", label: "A node", x: 0, y: 0, size: 3, color: '#008cc2' },
{ id: "n1", label: "Another node", x: 3, y: 1, size: 2, color: '#008cc2' },
{ id: "n2", label: "And a last one", x: 1, y: 3, size: 1, color: '#E57821' },
{ id: "n4", label: "n4: And another one", x: 0, y: 2, size: 1, color: '#008cc2' },
{ id: "n5", label: "n5: And another one", x: 0.5, y: 2.3, size: 1, color: '#008cc2' },
{ id: "n6", label: "n6: And another one", x: 0, y: 2.6, size: 1, color: '#008cc2' },

{ id: "n7", label: "n7: And another one", x: 4, y: 2.3, size: 1, color: '#008cc2' },
{ id: "n8", label: "n8: And another one", x: 5, y: 2, size: 1, color: '#008cc2' },
{ id: "n9", label: "n9: And another one", x: 5, y: 2.6, size: 1, color: '#008cc2' }

],
edges: [
{ id: "e0", source: "n0", target: "n1", color: '#282c34', type:'line', size:0.8 },
{ id: "e1", source: "n1", target: "n2", color: '#282c34', type:'curve', size:1},
{ id: "e2", source: "n2", target: "n0", color: '#FF0000', type:'line', size:2},

//Edge between n5 and n7
{ id: "e3", source: "n5", target: "n7", color: '#FF0000', type:'line', size:1},

//Edges between n7, n8, n9
{ id: "e4", source: "n7", target: "n8", color: '#282c34', type:'curve', size:1},
{ id: "e5", source: "n8", target: "n9", color: '#FF0000', type:'line', size:2},

]
}

// Load the graph in sigma
s.graph.read(graph);
// Ask sigma to draw it
s.refresh();