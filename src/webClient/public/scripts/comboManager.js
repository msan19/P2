window.nForklifts = new Forklifts(null);
window.mainGraph;

window.frameRate = 1;

var forkliftData = [];
var ForkliftStates;


window.forkliftSpeed;

// ROUTE IN SELECTED FORKLIFT ON UI
function onSelectElementInRouteInSelectedForklift(nodeId, occurance) {
    let counter = 0;
    for (let key in forkliftData[nForklifts.selectedForklift].route.instructions) {
        let instruciton = forkliftData[nForklifts.selectedForklift].route.instructions[key];
        if (instruciton.nodeId == nodeId) {
            if (counter == occurance) {
                if (typeof (instruciton.startTime) != "undefined") {
                    let selectedNodeStartTime = document.querySelector("#selectedNodeStartTime");
                    selectedNodeStartTime.innerHTML = moment(instruciton.startTime).format('MMM Do HH:mm:ss');
                } else if (typeof (instruciton.endTime) != "undefined") {
                    let selectedNodeEndTime = document.querySelector("#selectedNodeEndTime");
                    selectedNodeEndTime.innerHTML = new Date(instruciton.startTime).toLocaleTimeString("da-dk")
                }
                break;
            } else
                counter++;
        }
    }
}

function onDeselectElementInRouteInSelectedForklift() {
    let selectedNodeStartTime = document.querySelector("#selectedNodeStartTime");
    selectedNodeStartTime.innerHTML = "...";
    let selectedNodeEndTime = document.querySelector("#selectedNodeEndTime");
    selectedNodeEndTime.innerHTML = "...";
}

function getOccuranceForClickedElement(target, routeElements) {
    let counter = 0;
    for (let key in routeElements) {
        if (routeElements[key].innerHTML == target.innerHTML) {
            if (routeElements[key] == target)
                return counter;
            else
                counter++;
        }
    }
}

function updateSelectedForkliftSelectedElementInRoute(e) {
    let routeList = document.querySelector("#selectedForkliftRoute");
    let routeElements = routeList.children;
    for (let i = 0; i < routeElements.length; i++) {
        if (routeElements[i].classList.contains("active")) {
            routeElements[i].classList.remove("active");
        }
    }
    e.target.classList.toggle("active")
    onSelectElementInRouteInSelectedForklift(e.target.innerHTML, getOccuranceForClickedElement(e.target, routeElements));
}

function addElementToSelectedForkliftRoute(nodeId) {
    let routeList = document.querySelector("#selectedForkliftRoute");
    let newElement = document.createElement("button");
    newElement.classList.add("list-group-item");
    newElement.classList.add("list-group-item-action");
    newElement.innerHTML = nodeId;
    newElement.onclick = updateSelectedForkliftSelectedElementInRoute;
    routeList.appendChild(newElement);
}

function initiateSelectedForkliftRouteOnUI(forklift) {
    let routeList = document.querySelector("#selectedForkliftRoute");
    routeList.innerHTML = "";
    if (typeof (forklift.route) != "undefined") {
        for (let key in forklift.route.instructions) {
            addElementToSelectedForkliftRoute(forklift.route.instructions[key].nodeId);
        }
    }
}

function removeElementFromSelectedForkliftRoute(nodeId) {
    let routeList = document.querySelector("#selectedForkliftRoute");
    let routeElements = routeList.children;
    for (let i = 0; i < routeElements.length; i++) {
        if (routeElements[i].innerHTML == nodeId) {
            if (routeElements[i].classList.contains("active"))
                onDeselectElementInRouteInSelectedForklift();
            routeList.removeChild(routeElements[i]);
            break;
        }
    }
}

function removeSelectedForkliftRouteOnUI() {
    let routeList = document.querySelector("#selectedForkliftRoute");
    routeList.innerHTML = "";
}
// END ---  ROUTE IN SELECTED FORKLIFT ON UI --- END

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
        removeSelectedForkliftRouteOnUI();
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
function parseRoute(route) {
    let newRoute = {};
    newRoute.id = route.id;
    let instructions = [];
    for (let key in route.instructions) {
        instructions.push({
            nodeId: route.instructions[key].vertexId,
            startTime: route.instructions[key].startTime
        })
    }
    newRoute.instructions = instructions;
    return newRoute;
}

function onReceiveRoute(route) {
    let parsedRoute = parseRoute(route);
    forkliftData[parsedRoute.id].route = parsedRoute;
}

window.socketManager.on(PackageTypes.routes, (routes) => {
    for (let key in routes) {
        onReceiveRoute(routes[key]);
    }
})

window.socketManager.on(PackageTypes.route, (route) => {
    onReceiveRoute(route);
})
// END --- ROUTE --- END

// Event loop
window.setInterval(function () {
    if (typeof (mainGraph) != "undefined") {
        nForklifts.addTestDataToForklifts();
        nForklifts.handleForkliftMovement();
        updateSelectedForkliftInformationOnUI();
        mainGraph.updateForkliftsOnGraph();
        mainGraph.sigmaGraph.refresh();
    }
}, 1000 / frameRate);