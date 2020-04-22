var forkliftData;
var ForkliftStates;
window.selectedForklift = "";
window.forkliftSpeed;
(function (ForkliftStates) {
    ForkliftStates[ForkliftStates["idle"] = 1] = "idle";
    ForkliftStates[ForkliftStates["hasOrder"] = 2] = "hasOrder";
    ForkliftStates[ForkliftStates["charging"] = 3] = "charging";
    ForkliftStates[ForkliftStates["initiating"] = 4] = "initiating";
})(ForkliftStates || (ForkliftStates = {}));



// ETC
function getDistanceBetweenPoints(x, y, targetX, targetY) {
    let xDiff = targetX - x;
    let yDiff = targetY - y;
    return Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
}
// returns unit vector with direction towards target
function getDirectionVector(distance, x, y, targetX, targetY) {
    // distance
    let xDiff = targetX - x;
    let yDiff = targetY - y;

    if (distance == 0)
        return {
            x: 0,
            y: 0
        };
    return {
        x: xDiff / distance,
        y: yDiff / distance
    };
}

function checkIfReachedNode(calculatedForkliftPosition, directionVector, instructions) {
    // check y direction
    if (directionVector["y"] > 0) {
        if (calculatedForkliftPosition["y"] > mainGraph.sigmaGraph.graph.nodes(instructions[0].nodeId).y) {
            return true;
        }
    } else if (directionVector["y" < 0]) {
        if (calculatedForkliftPosition["y"] < mainGraph.sigmaGraph.graph.nodes(instructions[0].nodeId).y) {
            return true;
        }
    }
    if (directionVector["x"] > 0) {
        if (calculatedForkliftPosition["x"] > mainGraph.sigmaGraph.graph.nodes(instructions[0].nodeId).x) {
            return true;
        }
    } else if (directionVector["x"] < 0) {
        if (calculatedForkliftPosition["x"] < mainGraph.sigmaGraph.graph.nodes(instructions[0].nodeId).x) {
            return true;
        }
    }
    if (directionVector["y"] == 0 && directionVector["x"] == 0) {
        return true;
    }

}
let date = new Date();

function generateRoute(route, node, length) {
    if (length == 0)
        return;
    let nodes = mainGraph.sigmaGraph.graph.neighbors(node);
    //console.log(route)
    let num = Math.floor(Math.random() * Object.keys(nodes).length);

    let attempts = 0;
    // Remove if forklifts from neighbors
    if (route.instructions.length > 1) {
        while (Object.keys(nodes).splice(num, 1)[0] == route.instructions[route.instructions.length - 2].nodeId || Object.keys(nodes).splice(num, 1)[0][0] == "F") {
            num = Math.floor(Math.random() * Object.keys(nodes).length);
            delete Object.keys(nodes).splice(num, 1)[0];
            attempts++;
            if (attempts > 20)
                break;
        }
    }

    node = Object.keys(nodes).splice(num, 1)[0];

    //console.log(node + "," + Object.keys(nodes)[num])
    route.instructions.push({
        nodeId: node,
        startTime: date.getTime(),
        num: num
    });
    generateRoute(route, node, length - 1);

}

// REMOVE LATER maybe?
function addTestDataToForklifts() {
    for (let key in forkliftData) {
        if (typeof (forkliftData[key].route) == "undefined") {
            let route = {
                instructions: []
            };
            let nodes = mainGraph.sigmaGraph.graph.nodes();
            let currentNode = forkliftData[key].currentNode;
            generateRoute(route, (typeof (currentNode) == "undefined") ? nodes[Math.floor(Math.random() * nodes.length)].id : currentNode, Math.round(Math.random() * 20));
            if (route.instructions.length != 0)
                forkliftData[key].route = route;
            if (key == selectedForklift)
                mainGraph.displaySelectedForkliftPath();
        }

    }
}
// END --- ETC --- END


// FORKLIFT MOVEMENT
// NOTE: this fuction is recursive: good luck
function calculateForkliftPosition(forklift, movementLength) {
    // gets direction between forklift at the second point in instructions
    let targetNode = mainGraph.sigmaGraph.graph.nodes(forklift.route.instructions[0].nodeId);
    let distance = getDistanceBetweenPoints(
        forklift["position"]["x"],
        forklift["position"]["y"],
        targetNode["x"],
        targetNode["y"]
    );
    let directionVector = getDirectionVector(
        distance,
        forklift["position"]["x"],
        forklift["position"]["y"],
        targetNode["x"],
        targetNode["y"]
    );
    // gets new position based on the direction vector over the framerate
    let newPosition = {
        x: forklift["position"]["x"] + movementLength * directionVector["x"],
        y: forklift["position"]["y"] + movementLength * directionVector["y"]
    };
    // if the forklift reaches the next point in the graph; handle it
    if (checkIfReachedNode(newPosition, directionVector, forklift.route.instructions)) {
        let instructions = forklift.route.instructions;
        forklift.currentNode = instructions[0].nodeId;
        instructions.splice(0, 1);
        // update displayed path if the it is the current forklift
        if (selectedForklift == forklift["id"]) {
            mainGraph.displaySelectedForkliftPath();
        }
        // if forklift has reached last node, set position to last node
        // this just makes it easier to calculate, can be made better i suspect
        forklift["position"] = {
            x: targetNode["x"],
            y: targetNode["y"]
        };
        if (instructions.length == 0 || typeof (instructions[0]) == "undefined") {
            delete forklift.route.instructions;
            delete forklift.route;
        } else {
            // if through this movement it goes further than the distance to the node
            // it will run it again with start position of the node
            // i think.
            // this should be tested more
            if (movementLength > Math.abs(distance))
                calculateForkliftPosition(forklift, movementLength - Math.abs(distance));
        }


    } else {
        forklift["position"] = newPosition;
    }
}

function handleForkliftMovement() {
    for (let key in forkliftData) {
        // find forklifts with active route
        if (typeof (forkliftData[key]["route"]) != "undefined" && typeof (forkliftData[key]["route"].instructions) != "undefined" && typeof (forkliftData[key]["route"].instructions[0]) != "undefined") {
            // set position to beginning of route if it doesn't have one
            // REMOVE WHEN NOT NEEDED FOR TESTING
            if (typeof (forkliftData[key]["position"]) == "undefined" ||
                typeof (forkliftData[key]["position"]["x"]) == "undefined" ||
                typeof (forkliftData[key]["position"]["y"]) == "undefined") {
                if (typeof (forkliftData[key].route.instructions[0].nodeId) != "undefined") {
                    let node = mainGraph.sigmaGraph.graph.nodes(forkliftData[key].route.instructions[0].nodeId);
                    forkliftData[key]["position"] = {
                        x: node["x"],
                        y: node["y"]
                    };
                }

            } else {
                calculateForkliftPosition(forkliftData[key], forkliftSpeed / frameRate);
            }

        }
    }
}
// END --- FORKLIFT MOVEMENT --- END

// DATA HANDLING
function intepretInstructions(instructions) {
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

function getIfForkliftHasPosition(forklift) {
    if (typeof (forklift["position"]) === "undefined" || typeof (forklift["position"]["x"]) === "undefined" || typeof (forklift["position"]["y"]) === "undefined")
        return false;
    else
        return true;
}

function parseForklifts(data) {
    let forklifts = [];
    for (let key in data) {
        if (typeof (data[key]["id"]) == "undefined")
            continue;
        else if (getIfForkliftHasPosition(data[key])) {
            forklifts[data[key]["id"]] = {
                id: data[key]["id"],
                state: data[key]["state"]
            };
        } else {
            forklifts[data[key]["id"]] = {
                id: data[key]["id"],
                position: {
                    x: data[key]["x"],
                    y: data[key]["y"]
                },
                state: data[key]["state"]
            };
        }
    }
    forkliftData = forklifts;
}
// END --- DATA HANDLING

/*function selectForklift(event) {
    selectedForklift = event.toElement.value;
    updateForkliftFocus(selectedForklift);
}*/

function updateForkliftFocus(forklift) {
    selectedForklift = forklift;
    document.querySelector("#currentForklift").innerHTML = `<h3>${forklift}</h3>`;
    document.querySelector("#forklift-list").value = forklift;
}


function updateSelectedForkliftInformationOnUI() {
    if (typeof (selectedForklift) == "string" && selectedForklift.length > 0) {
        let xPos = document.querySelector("#selectedForkliftXPosition");
        let yPos = document.querySelector("#selectedForkliftYPosition");
        xPos.innerHTML = (forkliftData[selectedForklift].position.x).toFixed(2);
        yPos.innerHTML = (forkliftData[selectedForklift].position.y).toFixed(2);

        let state = document.querySelector("#selectedForkliftState");
        state.innerHTML = forkliftData[selectedForklift].state;
    }

}

window.setInterval(function () {
    if (typeof (mainGraph) != "undefined") {
        addTestDataToForklifts();
        handleForkliftMovement();
        //updateForkliftFocus(selectedForklift);

        mainGraph.updateForkliftsOnGraph();
        updateSelectedForkliftInformationOnUI();
    }
}, 1000 / frameRate);

window.socketManager.on(PackageTypes.forkliftInfos, (forklifts) => {
    let nForklifts = new Forklifts(document, forklifts);
    document.querySelectorAll('.select-forklift').forEach((item) => {
        item.innerHTML = "";
    });

    document.querySelector("#forklift-list").innerHTML = `<option value=${""}>${""}</option>`;
    for (let key in forklifts) {
        nForklifts.addForkliftToUi(forklifts[key]);
    }
    //document.querySelector('.select-forklift#forklift-list').innerHTML += `<option value=${"none"}>${"none"}</option>`;

    document.querySelector("form .form-group#forklift-form").onclick = (e) => {
        nForklifts.selectForklift(e);
    };

    // This code doesn't seem to do anything? The function forkliftSelection doesn't exist, right?
    /*
    for (let i = 0; i < forklifts.length; i++) {
        let element = document.querySelector("#forklift-list").children[i];
        element.addEventListener("click", forkliftSelection);
    }
*/
    parseForklifts(forklifts);
    console.log(forkliftData)
});

window.socketManager.on(PackageTypes.forkliftInfo, (forklift) => {
    nForklifts.addForkliftToUi(forklift);
});

window.setInterval(function () {
    if (typeof (mainGraph) != "undefined") {
        addTestDataToForklifts();
        handleForkliftMovement();
        updateForkliftFocus(selectedForklift);

        mainGraph.updateForkliftsOnGraph();
    }
}, 1000 / frameRate);