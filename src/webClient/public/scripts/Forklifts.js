class Forklifts {
    selectedForklift = "F0";
    constructor(document, forklifts) {

        this.forklifts = forklifts;
    }




    addForkliftToUi(forkliftInfo) {
        //document.querySelector("#forklift-list").innerHTML += `<a class="dropdown-item" value="${forkliftInfo.id}">${forkliftInfo.id}</a>`;

        document.querySelectorAll('.select-forklift').forEach((item) => {
            item.innerHTML += `<option value=${forkliftInfo.id}>${forkliftInfo.id}</option>`;
        });
    }

    selectForklift(event) {
        if (event.toElement.value != "")
            this.selectedForklift = event.toElement.value;
        else {
            this.selectedForklift = "";
            mainGraph.revertColorsToOriginal();
        }

        updateForkliftFocus(this.selectedForklift);
    }

    parseForklifts(data) {
        let forklifts = [];
        for (let key in data) {
            if (typeof (data[key]["id"]) == "undefined")
                continue;
            else if (this.getIfForkliftHasPosition(data[key])) {
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
        return forklifts;
    }

    getIfForkliftHasPosition(forklift) {
        if (typeof (forklift["position"]) === "undefined" || typeof (forklift["position"]["x"]) === "undefined" || typeof (forklift["position"]["y"]) === "undefined")
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

}