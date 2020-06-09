window.nForklifts = new Forklifts(null);
window.mainGraph;
window.orders = {};

window.frameRate = 60;
window.running = true;

var forkliftData = [];
var ForkliftStates;


window.forkliftSpeed;

new UiManager();

// Start stop program
function run() {
    running = true;
}

function start() {
    run();
}

function stop() {
    running = false;
}

function pause() {
    stop();
}



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
// ORDER
window.socketManager.on(PackageTypes.orders, (orders) => {
    for (let key in orders) {
        Order.onReceiveOrder(orders[key]);
    }
})

window.socketManager.on(PackageTypes.order, (order) => {
    Order.onReceiveOrder(order);
});


// END --- ORDER --- END

// Event loop
window.setInterval(function () {
    if (typeof (mainGraph) != "undefined") {
        if (running)
            nForklifts.handleForkliftMovement();
        mainGraph.updateForkliftsOnGraph();
        UiManager.updateSelectedForkliftInformationOnUI();
        mainGraph.sigmaGraph.refresh();
    }
}, 1000 / frameRate);