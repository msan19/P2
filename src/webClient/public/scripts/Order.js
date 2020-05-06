class Order {
    orderId;
    forkliftId;
    type;
    palletId;
    startNodeId;
    endNodeId;
    startTime;

    static parseOrder(order) {
        let newOrder = new Order();
        if (typeof (order.id) != "undefined")
            newOrder.orderId = order.id;
        else
            return false;
        if (typeof (order.type) != "undefined")
            newOrder.type = order.type;
        else
            return false;
        if (typeof (order.forkliftId) != "undefined")
            newOrder.forkliftId = order.forkliftId;
        else
            return false;
        if (typeof (order.palletId) != "undefined")
            newOrder.palletId = order.palletId;
        if (typeof (order.startVertexId) != "undefined")
            newOrder.startNodeId = order.startVertexId;
        else
            return false;
        if (typeof (order.endVertexId) != "undefined")
            newOrder.endNodeId = order.endVertexId;
        else
            return false;
        if (typeof (order.time) != "undefined")
            newOrder.startTime = order.time;

        return newOrder;
    }

    static onReceiveOrder(order) {
        let parsedOrder = this.parseOrder(order);
        if (parsedOrder == false)
            return;
        parsedOrder.addOrderToMainOrderDictionary();

        parsedOrder.addOrderToUi();
    }

    addOrderToMainOrderDictionary() {
        orders[this.orderId] = this;
    }

    removeOrderFromMainOrderDictionary() {
        delete orders[this.orderId];
    }

    addOrderToUi() {
        document.querySelectorAll(".select-order").forEach((e) => {
            e.innerHTML += `<option value=${this.orderId}>${this.orderId}</option>`;
        });
    }

    removeOrderFromUi() {
        document.querySelectorAll(".select-order").forEach((e) => {
            for (let key in e.childNodes) {
                if (e.childNodes[key].innerHTML == this.orderId) {
                    e.removeChild(e.childNodes[key]);
                    break;
                }
            }
        });
    }

    selectOrder() {
        document.querySelector("#selectedOrderForkliftId").innerHTML = this.forkliftId;
        document.querySelector("#selectedOrderOrderId").innerHTML = this.orderId;
        if (typeof (this.type) != "undefined")
            document.querySelector("#selectedOrderType").innerHTML = this.orderId;
        if (typeof (this.palletId) != "undefined")
            document.querySelector("#selectedOrderPalletId").innerHTML = this.orderId;
        if (typeof (this.startNodeId) != "undefined")
            document.querySelector("#selectedOrderStartNodeId").innerHTML = this.startNodeId;
        if (typeof (this.endNodeId) != "undefined")
            document.querySelector("#selectedOrderEndNodeId").innerHTML = this.endNodeId;
        if (typeof (this.startTime) != "undefined")
            document.querySelector("#selectedOrderStartTime").innerHTML = moment(this.startTime).format("LLL");
    }

    onFinishRoute() {
        this.removeOrderFromMainOrderDictionary();
        this.removeOrderFromUi();
    }
}