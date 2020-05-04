class Route {
    routeId;
    forkliftId;
    orderId;
    instructions;
    constructor(route, routeId, forkliftId, orderId, instructions) {
        if (typeof (route) != "undefined" && route != null) {
            this.routeId = route.routeId;
            this.forkliftId = route.forkliftId;
            this.orderId = route.orderId;
            this.instructions = route.instructions;
        } else {
            this.routeId = routeId;
            this.forkliftId = forkliftId;
            this.orderId = orderId;
            this.instructions = instructions;
        }
    }

    static checkIfValidRoute(route) {
        if (typeof (route.forkliftId) == "undefined" ||
            typeof (forkliftData[route.forkliftId]) == "undefined")
            return false;
        if (typeof (route.routeId) == "undefined")
            return false;
        if (typeof (route.orderId) == "undefined")
            return false;
        if (typeof (route.instructions) == "undefined" ||
            route.instructions.length == 0)
            return false;
        return true;
    }

    static parseIncomingData(data) {
        let newRoute = {};
        newRoute.forkliftId = data.forkliftId;
        newRoute.routeId = data.routeId;
        newRoute.orderId = data.orderId;
        let instructions = [];
        for (let key in data.instructions) {
            instructions.push({
                nodeId: data.instructions[key].vertexId,
                startTime: data.instructions[key].startTime
            });
        }
        newRoute.instructions = instructions;
        return newRoute;
    }

    static onReceiveRoute(route) {
        let parsedRoute = Route.parseIncomingData(route);
        if (!this.checkIfValidRoute(parsedRoute))
            return;
        let newRoute = new Route(parsedRoute);
        newRoute.addRouteToUi();
        if (typeof (forkliftData[newRoute.forkliftId].route) == "undefined")
            forkliftData[newRoute.forkliftId].route = newRoute;
        else {
            forkliftData[newRoute.forkliftId].route.onChangeRoute();
            forkliftData[newRoute.forkliftId].route = newRoute;
        }
    }

    onChangeRoute() {
        this.removeRouteFromUi();
    }

    onFinishRoute() {
        this.removeRouteFromUi();
    }

    // UI

    static updateSelectedInstructionInformationOnUi(nodeId, occurance) {
        let counter = 0;
        let forkliftId = document.querySelector(".forkliftId").innerHTML;
        for (let key in forkliftData[forkliftId].route.instructions) {
            let instruction = forkliftData[forkliftId].route.instructions[key];
            if (instruction.nodeId == nodeId) {
                if (counter == occurance) {
                    if (typeof (instruction.startTime) != "undefined") {
                        document.querySelectorAll(".selectedRouteInstructionStartTime").forEach((e) => {
                            e.innerHTML = moment(instruction.startTime).format('LLL');
                        })
                    } else if (typeof (instruction.endTime) != "undefined") {
                        document.querySelectorAll(".selectedRouteInstructionEndTime").forEach((e) => {
                            e.innerHTML = moment(instruction.startTime).format('LLL');
                        })
                    }
                    break;
                } else
                    counter++;
            }
        }
    }

    // In case of the same node being on the list more than once
    // This gets which of the times it is
    static getOccuranceOfElementInInstructionList(target, instructions) {
        let counter = 0;
        for (let key in instructions) {
            if (instructions[key].innerHTML == target.innerHTML) {
                if (instructions[key] == target)
                    return counter;
                else
                    counter++;
            }
        }
    }

    static selectInstruction(targetedNode) {
        let instructionNodeId = targetedNode.target.innerHTML;
        let occurance;
        document.querySelectorAll(".selectedRouteInstructionList").forEach((e) => {
            if (targetedNode.target.parentNode == e)
                occurance = Route.getOccuranceOfElementInInstructionList(
                    targetedNode.target,
                    e.children

                );

        })

        document.querySelectorAll(".selectedRouteInstructionList").forEach((e) => {
            let instructions = e.children;
            let counter = 0;
            for (let i = 0; i < instructions.length; i++) {
                if (instructions[i].innerHTML == targetedNode.target.innerHTML) {
                    if (counter == occurance) {
                        instructions[i].classList.add("active");
                    } else {
                        if (instructions[i].classList.contains("active"))
                            instructions[i].classList.remove("active");
                        counter++;
                    }
                } else if (instructions[i].classList.contains("active")) {
                    instructions[i].classList.remove("active");
                }
            }
        });
        Route.updateSelectedInstructionInformationOnUi(instructionNodeId, occurance);
    }

    createElementForInstrutionList(nodeId) {
        let newElement = document.createElement("button");
        newElement.classList.add("list-group-item");
        newElement.classList.add("list-group-item-action");
        newElement.innerHTML = nodeId;
        newElement.onclick = Route.selectInstruction;
        return newElement;
    }

    listInstructionsOnUi() {
        document.querySelectorAll(".selectedRouteInstructionList").forEach((e) => {
            for (let key in this.instructions)
                e.appendChild(this.createElementForInstrutionList(this.instructions[key].nodeId));
        })
    }

    static clearInstrutionsOnUi() {
        document.querySelectorAll(".selectedRouteInstructionList").forEach((e) => {
            e.innerHTML = "";
        })
        document.querySelectorAll(".selectedRouteInstructionStartTime").forEach((e) => {
            e.innerHTML = "";
        })
        document.querySelectorAll(".selectedRouteInstructionEndTime").forEach((e) => {
            e.innerHTML = "";
        })

    }

    selectRoute() {
        if (typeof (this.forkliftId) != "undefined") {
            // Move this to seperate function in forklifts
            updateForkliftFocus(this.forkliftId);
            document.querySelectorAll(".forkliftId").forEach((e) => {
                e.innerHTML = this.forkliftId;
            });
        } else
            document.querySelectorAll(".forkliftId").forEach((e) => {
                e.innerHTML = "...";
            });
        if (typeof (this.orderId) != "undefined")
            document.querySelectorAll(".orderId").forEach((e) => {
                e.innerHTML = this.orderId;
            });
        else
            document.querySelectorAll(".orderId").forEach((e) => {
                e.innerHTML = "...";
            });
        if (typeof (this.routeId) != "undefined") {
            document.querySelector("#route-list").value = this.routeId;
            document.querySelectorAll(".routeId").forEach((e) => {
                e.innerHTML = this.routeId;
            });
        } else
            document.querySelectorAll(".forkliftId").forEach((e) => {
                e.innerHTML = "...";
            });
        if (typeof (this.instructions) != "undefined")
            this.listInstructionsOnUi();
        else
            Route.clearInstrutionsOnUi();
    }

    static resetRouteInformationOnUi() {
        document.querySelector("#selectedRouteForkliftId").innerHTML = "...";
        document.querySelector("#selectedRouteOrderId").innerHTML = "...";
        document.querySelector("#selectedRouteRouteId").innerHTML = "...";
        Route.clearInstrutionsOnUi();
    }

    static chooseRoute(routeId) {
        if (routeId == "")
            Route.resetRouteInformationOnUi();
        else {
            for (let key in forkliftData) {
                if (typeof (forkliftData[key].route) != "undefined")
                    if (forkliftData[key].route.routeId == routeId) {
                        forkliftData[key].route.selectRoute();
                        break;
                    }
            }
        }
    }

    addRouteToUi() {
        document.querySelector('.select-route').innerHTML += `<option value=${this.routeId}>${this.routeId}</option>`;
    }

    removeRouteFromUi() {
        let activeRoutesOnList = document.querySelector('.select-route').children;
        for (let key in activeRoutesOnList) {
            if (typeof (activeRoutesOnList[key]) != "undefined") {
                if (activeRoutesOnList[key].innerHTML == this.routeId) {
                    document.querySelector('.select-route').removeChild(activeRoutesOnList[key])
                }
            }
        }
    }



    // END -- UI -- END

}