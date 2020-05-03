window.nForklifts = new Forklifts(null);
window.mainGraph;

window.frameRate = 60;

var forkliftData = [];
var ForkliftStates;


window.forkliftSpeed;

function updateSelectedForkliftInformationOnUI() {
    if (typeof (nForklifts.selectedForklift) == "string" && nForklifts.selectedForklift.length > 0) {
        let forklift = forkliftData[nForklifts.selectedForklift];
        if (typeof (forklift.position) != "undefined" &&
            typeof (forklift.position.x) != "undefined" &&
            typeof (forklift.position.y) != "undefined") {
            let xPos = document.querySelector("#selectedForkliftXPosition");
            let yPos = document.querySelector("#selectedForkliftYPosition");
            xPos.innerHTML = (forklift.position.x).toFixed(2);
            yPos.innerHTML = (forklift.position.y).toFixed(2);
        }
        if (typeof (forkliftData[nForklifts.selectedForklift].state) != "undefined") {
            let state = document.querySelector("#selectedForkliftState");
            state.innerHTML = forklift.state;
        }
    } else {
        let xPos = document.querySelector("#selectedForkliftXPosition");
        let yPos = document.querySelector("#selectedForkliftYPosition");
        xPos.innerHTML = "...";
        yPos.innerHTML = "...";
        let state = document.querySelector("#selectedForkliftState");
        state.innerHTML = "...";
    }

}

function updateForkliftFocus(forklift) {
    nForklifts.selectedForklift = forklift;
    document.querySelector("#currentForklift").innerHTML = `<h3>${forklift}</h3>`;
    document.querySelector("#forklift-list").value = forklift;
}


initializeUI();
//Initialize UI
function initializeUI() {
    // Set dateInput to correct format
    $('#sendOrderDateTimePicker').datetimepicker({
        format: 'LLL'
    });
    // add blank forklift to select forklfit
    let routeList = document.querySelector("#route-list");
    routeList.innerHTML = `<option value=${""}>${""}</option>`;
    routeList.onclick = (e) => Route.chooseRoute(e.target.innerHTML);
    document.querySelector("#forklift-list").innerHTML = `<option value=${""}>${""}</option>`;
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
function onReceiveForklift(forklift) {
    if (typeof (forklift.id) != "undefined") {
        if (typeof (forkliftData[forklift.id]) == "undefined")
            nForklifts.addForklift(forklift);
        else
            nForklifts.updateForklift(forklift);
    }
}

window.socketManager.on(PackageTypes.forkliftInfos, (forklifts) => {
    for (let key in forklifts) {
        onReceiveForklift(forklifts[key]);
    }
});

window.socketManager.on(PackageTypes.forkliftInfo, (forklift) => {
    onReceiveForklift(forklift);
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
        //nForklifts.addTestDataToForklifts();
        //nForklifts.handleForkliftMovement();
        updateSelectedForkliftInformationOnUI();
        mainGraph.updateForkliftsOnGraph();
        mainGraph.sigmaGraph.refresh();
    }
}, 1000 / frameRate);