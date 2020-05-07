class UiManager {
    constructor() {
        // Set dateInput to correct format
        $('#sendOrderDateTimePicker').datetimepicker({
            format: 'LLL'
        });
        // add blank forklift to select forklfit
        let routeList = document.querySelector("#route-list");
        routeList.innerHTML = `<option value=${""}>${""}</option>`;
        routeList.onclick = (e) => UiManager.chooseRoute(e.target.innerHTML);
        let forkliftList = document.querySelector("#forklift-list");
        forkliftList.innerHTML = `<option value=${""}>${""}</option>`;
        forkliftList.onclick = (e) => UiManager.chooseForklift(e.target.innerHTML);
        let orderList = document.querySelector("#order-list");
        orderList.innerHTML = `<option value=${""}>${""}</option>`;
        orderList.onclick = (e) => UiManager.chooseOrder(e.target.innerHTML);
    }

    // ROUTE
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
                occurance = UiManager.getOccuranceOfElementInInstructionList(
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
        UiManager.updateSelectedInstructionInformationOnUi(instructionNodeId, occurance);
    }
    static resetRouteInformationOnUi() {
        document.querySelector("#route-list").value = "";
        document.querySelectorAll(".forkliftId").forEach((e) => {
            e.innerHTML = "...";
        })
        document.querySelectorAll(".orderId").forEach((e) => {
            e.innerHTML = "...";
        })
        document.querySelectorAll(".routeId").forEach((e) => {
            e.innerHTML = "...";
        })
        UiManager.clearInstrutionsOnUi();
        new Route().selectRoute();
    }
    static chooseRoute(routeId) {
        if (routeId == "") {
            this.selectForklift("");
            new Route().selectRoute();
        } else {
            for (let key in forkliftData) {
                if (typeof (forkliftData[key].route) != "undefined")
                    if (forkliftData[key].route.routeId == routeId) {
                        this.selectForklift(forkliftData[key].id);
                        forkliftData[key].route.selectRoute();
                        break;
                    }
            }
        }
    }
    // END --- ROUTE --- END

    // FORKLIFT
    static updateSelectedForkliftInformationOnUI() {
        if (nForklifts.checkIfThereIsASelectedForklift()) {
            let forklift = forkliftData[nForklifts.selectedForklift];
            document.querySelector("#forklift-list").value = forklift.id;
            if (typeof (forklift.position) != "undefined" &&
                typeof (forklift.position.x) != "undefined" &&
                typeof (forklift.position.y) != "undefined") {
                document.querySelector("#selectedForkliftXPosition").innerHTML = (forklift.position.x).toFixed(2);
                document.querySelector("#selectedForkliftYPosition").innerHTML = (forklift.position.y).toFixed(2);
            }
            if (typeof (forkliftData[nForklifts.selectedForklift].state) != "undefined")
                document.querySelector("#selectedForkliftState").innerHTML = forklift.state;
        } else {
            document.querySelector("#forklift-list").value = "";
            let xPos = document.querySelector("#selectedForkliftXPosition");
            let yPos = document.querySelector("#selectedForkliftYPosition");
            xPos.innerHTML = "...";
            yPos.innerHTML = "...";
            let state = document.querySelector("#selectedForkliftState");
            state.innerHTML = "...";
        }

    }

    static selectForklift(forkliftId) {
        nForklifts.selectForklift(forkliftId);
        UiManager.updateSelectedForkliftInformationOnUI();
    }

    static chooseForklift(forkliftId) {
        if (forkliftId == "") {
            UiManager.selectForklift(forkliftId);
            UiManager.resetRouteInformationOnUi();
        } else if (forkliftId[0] == "F") {
            UiManager.selectForklift(forkliftId);
            if (typeof (forkliftData[nForklifts.selectedForklift].route) != "undefined")
                forkliftData[nForklifts.selectedForklift].route.selectRoute();
        }
    }
    // END --- FORKLIFT --- END
    // ORDER
    static resetOrderInformationOnUi() {
        document.querySelector("#selectedOrderForkliftId").innerHTML = "...";
        document.querySelector("#selectedOrderOrderId").innerHTML = "...";
        document.querySelector("#selectedOrderType").innerHTML = "...";
        document.querySelector("#selectedOrderPalletId").innerHTML = "...";
        document.querySelector("#selectedOrderStartNodeId").innerHTML = "...";
        document.querySelector("#selectedOrderEndNodeId").innerHTML = "...";
        document.querySelector("#selectedOrderStartTime").innerHTML = "...";
    }

    static chooseOrder(orderId) {
        if (orderId == "") {
            document.querySelectorAll(".select-order").forEach((e) => {
                this.resetOrderInformationOnUi();
            });
        } else if (orderId[0] != "<") {
            orders[orderId].selectOrder();
        }
    }
    // END --- ORDER --- END
}