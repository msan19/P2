window.nForklifts = new Forklifts(null);
window.mainGraph;

window.frameRate = 60;

var forkliftData = [];
var ForkliftStates;


window.forkliftSpeed;

new UiManager();




// WAREHOUSE
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
    let data = Graph.parseIncomingData(Graph.cloneIncomingData(warehouse)).graph;
    mainGraph = new Graph('sigmaContainer', data, nForklifts);
});
// END --- WAREHOUSE --- END

// FORKLIFT
window.socketManager.on(PackageTypes.forkliftInfos, (forklifts) => {
    for (let key in forklifts) {
        nForklifts.onReceiveForklift(forklifts[key]);
    }
});

window.socketManager.on(PackageTypes.forkliftInfo, (forklift) => {
    nForklifts.onReceiveForklift(forklift);
});
// END --- FORKLIFTS --- END
// ROUTE
window.socketManager.on(PackageTypes.routes, (routes) => {
    for (let key in routes) {
        Route.onReceiveRoute(routes[key]);
    }
});

window.socketManager.on(PackageTypes.route, (route) => {
    Route.onReceiveRoute(route);
});
// END --- ROUTE --- END

// Event loop
window.setInterval(function () {
    if (typeof (mainGraph) != "undefined") {
        nForklifts.handleForkliftMovement();
        mainGraph.updateForkliftsOnGraph();
        UiManager.updateSelectedForkliftInformationOnUI();
        mainGraph.sigmaGraph.refresh();
    }
}, 1000 / frameRate);