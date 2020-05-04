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
    createElementForInstrutionList(nodeId) {
        let newElement = document.createElement("button");
        newElement.classList.add("list-group-item");
        newElement.classList.add("list-group-item-action");
        newElement.innerHTML = nodeId;
        newElement.onclick = UiManager.selectInstruction;
        return newElement;
    }

    listInstructionsOnUi() {
        document.querySelectorAll(".selectedRouteInstructionList").forEach((e) => {
            for (let key in this.instructions)
                e.appendChild(this.createElementForInstrutionList(this.instructions[key].nodeId));
        })
    }

    selectRoute() {
        if (typeof (this.forkliftId) != "undefined") {
            // Move this to seperate function in forklifts
            //updateForkliftFocus(this.forkliftId);
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