window.nForklifts = new Forklifts(null);
window.mainGraph;

window.frameRate = 60;

var forkliftData;
var ForkliftStates;


window.forkliftSpeed;

// ROUTE IN SELECTED FORKLIFT ON UI
function onSelectElementInRouteInSelectedForklift(nodeId) {
    for (let key in forkliftData[nForklifts.selectedForklift].route.instructions) {
        let instruciton = forkliftData[nForklifts.selectedForklift].route.instructions[key];
        if (instruciton.nodeId == nodeId) {
            if (typeof (instruciton.startTime) != "undefined") {
                let selectedNodeStartTime = document.querySelector("#selectedNodeStartTime");
                selectedNodeStartTime.innerHTML = new Date(instruciton.startTime).toLocaleString();
            } else if (typeof (instruciton.endTime) != "undefined") {
                let selectedNodeEndTime = document.querySelector("#selectedNodeEndTime");
                selectedNodeEndTime.innerHTML = new Date(instruciton.endTime).toLocaleString();
            }
            break;
        }
    }
}

function onDeselectElementInRouteInSelectedForklift() {
    let selectedNodeStartTime = document.querySelector("#selectedNodeStartTime");
    selectedNodeStartTime.innerHTML = "...";
    let selectedNodeEndTime = document.querySelector("#selectedNodeEndTime");
    selectedNodeEndTime.innerHTML = "...";
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
    onSelectElementInRouteInSelectedForklift(e.target.innerHTML);
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
    for (let key in forklift.route.instructions) {
        addElementToSelectedForkliftRoute(forklift.route.instructions[key].nodeId);
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

// Set dateInput to correct format
$(function () {
    $('#sendOrderDateTimePicker').datetimepicker({
        locale: 'da'
    });
});



// Graph events
window.socketManager.on(PackageTypes.warehouse, (warehouse) => {
    let data = Graph.parseIncomingData(Graph.cloneIncomingData(warehouse)).graph;
    mainGraph = new Graph('sigmaContainer', data, nForklifts);
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

// Forklift events
window.socketManager.on(PackageTypes.forkliftInfos, (forklifts) => {
    nForklifts.forklifts = forklifts;
    document.querySelectorAll('.select-forklift').forEach((item) => {
        item.innerHTML = "";
    });

    document.querySelector("#forklift-list").innerHTML = `<option value=${""}>${""}</option>`;
    for (let key in forklifts) {
        nForklifts.addForkliftToUi(forklifts[key]);
    }

    document.querySelector("form .form-group#forklift-form").onclick = (e) => {
        mainGraph.selectForklift(e.toElement.value);
    };

    forkliftData = nForklifts.parseForklifts(forklifts);
});

window.socketManager.on(PackageTypes.forkliftInfo, (forklift) => {
    nForklifts.addForkliftToUi(forklift);
});

window.setInterval(function () {
    if (typeof (mainGraph) != "undefined") {
        nForklifts.addTestDataToForklifts();
        nForklifts.handleForkliftMovement();
        updateForkliftFocus(nForklifts.selectedForklift);
        updateSelectedForkliftInformationOnUI();
        mainGraph.updateForkliftsOnGraph();
    }
}, 1000 / frameRate);