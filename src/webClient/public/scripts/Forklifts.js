class Forklifts {
    selectedForklift = "";





    addForklift(forklift) {
        this.addForkliftToUi(forklift);
        forkliftData[forklift.id] = this.parseForklift(forklift);
    }

    updateForklift(forklift) {
        let parsedForklift = this.parseForklift(forklift);
        if (typeof (parsedForklift.state) != "undefined")
            forkliftData[forklift.id].state = parsedForklift.state;
        if (typeof (parsedForklift.position) != "undefined") {
            if (typeof (parsedForklift.position.x) != "undefined")
                forkliftData[forklift.id].position.x = parsedForklift.position.x;
            if (typeof (parsedForklift.position.y) != "undefined")
                forkliftData[forklift.id].position.y = parsedForklift.position.y;
        }
    }

    addForkliftToUi(forkliftInfo) {
        //document.querySelector("#forklift-list").innerHTML += `<a class="dropdown-item" value="${forkliftInfo.id}">${forkliftInfo.id}</a>`;

        document.querySelectorAll('.select-forklift').forEach((item) => {
            item.innerHTML += `<option value=${forkliftInfo.id}>${forkliftInfo.id}</option>`;
            item.onclick = (e) => {
                mainGraph.selectForklift(e.toElement.value);
            }
        });
    }

    parseForklift(data) {
        let forklift;
        if (Forklifts.getIfForkliftHasPosition(data)) {
            forklift = {
                id: data["id"],
                state: data["state"]
            };
        } else {
            forklift = {
                id: data["id"],
                position: {
                    x: data["x"],
                    y: data["y"]
                },
                state: data["state"]
            };
        }
        return forklift;
    }

    static getIfForkliftHasPosition(forklift) {
        if (typeof (forklift["position"]) === "undefined" || typeof (forklift["position"]["x"]) === "undefined" ||
            typeof (forklift["position"]["y"]) === "undefined")
            return false;
        else
            return true;
    }

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

    getDirectionVector(distance, x, y, targetX, targetY) {
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

    getDistanceBetweenPoints(x, y, targetX, targetY) {
        let xDiff = targetX - x;
        let yDiff = targetY - y;
        return Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
    }

    handleForkliftMovement() {
        for (let key in forkliftData) {
            // find forklifts with active route
            if (typeof (forkliftData[key]["route"]) != "undefined" && typeof (forkliftData[key]["route"].instructions) != "undefined" &&
                typeof (forkliftData[key]["route"].instructions[0]) != "undefined") {
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
                    this.calculateForkliftPosition(forkliftData[key], forkliftSpeed / frameRate);
                }

            }
        }
    }

    checkIfReachedNode(calculatedForkliftPosition, directionVector, instructions) {
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

    calculateForkliftPosition(forklift, movementLength) {
        // gets direction between forklift at the second point in instructions
        let targetNode = mainGraph.sigmaGraph.graph.nodes(forklift.route.instructions[0].nodeId);
        let distance = this.getDistanceBetweenPoints(
            forklift["position"]["x"],
            forklift["position"]["y"],
            targetNode["x"],
            targetNode["y"]
        );
        let directionVector = this.getDirectionVector(
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
        if (this.checkIfReachedNode(newPosition, directionVector, forklift.route.instructions)) {
            let instructions = forklift.route.instructions;
            forklift.currentNode = instructions[0].nodeId;
            instructions.splice(0, 1);
            // update displayed path if the it is the current forklift
            if (this.selectedForklift == forklift["id"]) {
                mainGraph.displaySelectedForkliftPath();
                removeElementFromSelectedForkliftRoute(forklift.currentNode);
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
                    this.calculateForkliftPosition(forklift, movementLength - Math.abs(distance));
            }


        } else {
            forklift["position"] = newPosition;
        }
    }

    generateRoute(route, node, length) {
        let date = new Date();
        Forklifts.generateRouteAux(route, node, length, date);
    }

    static generateRouteAux(route, node, length, date) {
        if (length == 0)
            return;
        let nodes = mainGraph.sigmaGraph.graph.neighbors(node);
        let num = Math.floor(Math.random() * Object.keys(nodes).length);

        let attempts = 0;
        // Remove if forklifts from neighbors
        if (route.instructions.length > 1) {
            while (Object.keys(nodes).splice(num, 1)[0] == route.instructions[route.instructions.length - 2].nodeId ||
                Object.keys(nodes).splice(num, 1)[0][0] == "F") {
                num = Math.floor(Math.random() * Object.keys(nodes).length);
                delete Object.keys(nodes).splice(num, 1)[0];
                attempts++;
                if (attempts > 20)
                    break;
            }
        }

        node = Object.keys(nodes).splice(num, 1)[0];

        route.instructions.push({
            nodeId: node,
            startTime: date.getTime(),
            num: num
        });
        Forklifts.generateRouteAux(route, node, length - 1, date);

    }

    addTestDataToForklifts() {
        for (let key in forkliftData) {
            if (typeof (forkliftData[key].route) == "undefined") {
                let route = {
                    instructions: []
                };
                let nodes = mainGraph.sigmaGraph.graph.nodes();
                let currentNode = forkliftData[key].currentNode;
                this.generateRoute(route, (typeof (currentNode) == "undefined") ? nodes[Math.floor(Math.random() * nodes.length)].id : currentNode, Math.round(Math.random() * 20));
                if (route.instructions.length != 0) {
                    forkliftData[key].route = route;
                    if (key == this.selectedForklift) {
                        mainGraph.displaySelectedForkliftPath();
                        initiateSelectedForkliftRouteOnUI(forkliftData[nForklifts.selectedForklift]);
                    }
                }


            }

        }
    }

}