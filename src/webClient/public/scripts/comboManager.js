window.nForklifts = new Forklifts(null);
window.mainGraph;

window.frameRate = 60;

var forkliftData;
var ForkliftStates;


window.forkliftSpeed;

function updateSelectedForkliftInformationOnUI() {
    if (typeof (nForklifts.selectedForklift) == "string" && nForklifts.selectedForklift.length > 0) {
        let xPos = document.querySelector("#selectedForkliftXPosition");
        let yPos = document.querySelector("#selectedForkliftYPosition");
        xPos.innerHTML = (forkliftData[nForklifts.selectedForklift].position.x).toFixed(2);
        yPos.innerHTML = (forkliftData[nForklifts.selectedForklift].position.y).toFixed(2);

        let state = document.querySelector("#selectedForkliftState");
        state.innerHTML = forkliftData[nForklifts.selectedForklift].state;
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
    selectedForklift = forklift;
    document.querySelector("#currentForklift").innerHTML = `<h3>${forklift}</h3>`;
    document.querySelector("#forklift-list").value = forklift;
}

// Graph events
window.socketManager.on(PackageTypes.warehouse, (warehouse) => {
    let data = Graph.parseIncomingData(Graph.cloneIncomingData(warehouse)).graph;
    mainGraph = new Graph('sigmaContainer', data, nForklifts);
    console.log("qwe");
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