class Forklifts {
    selectedForklift = "";

    onReceiveForklift(forklift) {
        if (typeof (forklift.id) != "undefined") {
            if (typeof (forkliftData[forklift.id]) == "undefined")
                this.addForklift(forklift);
            else
                this.updateForklift(forklift);
        }
    }

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

    static addForkliftToUi(id) {
        document.querySelectorAll(".select-forklift").forEach((e) => {
            let element = document.createElement("option");
            element.value = id;
            element.innerHTML = id;
            e.appendChild(element);
        });
    }

    addForkliftToUi(forkliftInfo) {
        Forklifts.addForkliftToUi(forkliftInfo.id);
    }

    parseForklift(data) {
        let forklift;
        if (!Forklifts.getIfForkliftHasPosition(data)) {
            forklift = {
                id: data.id,
                state: data.state
            };
        } else {
            forklift = {
                id: data.id,
                position: {
                    x: data.position.x,
                    y: data.position.y
                },
                state: data.state
            };
        }
        return forklift;
    }

    selectForklift(forkliftId) {
        this.selectedForklift = forkliftId;
        if (forkliftId != "")
            mainGraph.displaySelectedForkliftPath();
    }

    checkIfThereIsASelectedForklift() {
        if (typeof (nForklifts.selectedForklift) == "string" && nForklifts.selectedForklift.length > 0)
            return true;
        else
            return false;
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
            if (typeof (forkliftData[key].route) != "undefined" && typeof (forkliftData[key].route.instructions) != "undefined" &&
                typeof (forkliftData[key].route.instructions[0]) != "undefined") {
                // set position to beginning of route if it doesn't have one
                // REMOVE WHEN NOT NEEDED FOR TESTING
                if (typeof (forkliftData[key].currentNode) == "undefined")
                    forkliftData[key].currentNode = forkliftData[key].route.instructions[0];
                this.calculateForkliftPositionUsingTime(forkliftData[key]);
            }
        }
    }

    checkIfReachedNode(calculatedForkliftPosition, directionVector, instructions) {
        // check y direction
        if (directionVector.y > 0) {
            if (calculatedForkliftPosition.y > mainGraph.sigmaGraph.graph.nodes(instructions[0].nodeId).y) {
                return true;
            }
        } else if (directionVector.y < 0) {
            if (calculatedForkliftPosition.y < mainGraph.sigmaGraph.graph.nodes(instructions[0].nodeId).y) {
                return true;
            }
        }
        if (directionVector.x > 0) {
            if (calculatedForkliftPosition.x > mainGraph.sigmaGraph.graph.nodes(instructions[0].nodeId).x) {
                return true;
            }
        } else if (directionVector.x < 0) {
            if (calculatedForkliftPosition.x < mainGraph.sigmaGraph.graph.nodes(instructions[0].nodeId).x) {
                return true;
            }
        }
        if (directionVector.x == 0 && directionVector.y == 0) {
            return true;
        }

    }

    calculateForkliftPositionUsingTime(forklift) {
        let targetNode = mainGraph.sigmaGraph.graph.nodes(forklift.route.instructions[0].nodeId);
        let currentNode = mainGraph.sigmaGraph.graph.nodes(forklift.currentNode.nodeId);

        let remainingTime = forklift.route.instructions[0].startTime - new Date().getTime();

        if (remainingTime <= 0) {
            let instructions = forklift.route.instructions;
            forklift.currentNode = instructions[0];
            forklift.route.onInstructionDone();
            // update displayed path if the it is the current forklift
            if (this.selectedForklift == forklift.id) {
                mainGraph.displaySelectedForkliftPath();
            }
            // if forklift has reached last node, set position to last node
            // this just makes it easier to calculate, can be made better i suspect
            forklift.position = {
                x: targetNode.x,
                y: targetNode.y
            };
            if (instructions.length == 0 || typeof (instructions[0]) == "undefined") {
                forklift.route.onFinishRoute();
            } else {
                this.calculateForkliftPositionUsingTime(forklift);
            }
        } else if (currentNode != targetNode) {
            let distance = this.getDistanceBetweenPoints(
                targetNode.x,
                targetNode.y,
                currentNode.x,
                currentNode.y
            );
            let totalTime = forklift.route.instructions[0].startTime - forklift.currentNode.startTime;
            let percentGoneBy = remainingTime / totalTime;
            let distanceTravelled = distance * percentGoneBy;
            let directionVector = this.getDirectionVector(
                distance,
                targetNode.x,
                targetNode.y,
                currentNode.x,
                currentNode.y
            );
            forklift.position = {
                x: targetNode.x + distanceTravelled * directionVector.x,
                y: targetNode.y + distanceTravelled * directionVector.y
            };
        } else {
            forklift.position = {
                x: currentNode.x,
                y: currentNode.y
            };
        }
    }

    getForkliftColor(forklift) {
        if ((typeof (nForklifts.selectedForklift) == "undefined" || nForklifts.selectedForklift == "") || nForklifts.selectedForklift == forklift.id) {
            if (typeof (forklift.route) == "undefined")
                return mainGraph.inactiveColor;
            else if (forklift.currentNode.nodeId == forklift.route.instructions[0].nodeId)
                return mainGraph.waitingColor;
            else
                return mainGraph.movingColor;
        } else
            return mainGraph.unFocusColor;
    }
}