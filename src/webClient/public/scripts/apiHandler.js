async function baseGetJson(path) {
    let response = await fetch(this.basePath + path);
    let obj = await response.json();
    return new Promise((resolve) => {
        resolve(obj);
    });
}
class ApiCaller {
    constructor(hostname, port) {
        this.hostname = hostname;
        this.port = port;
    }
    get basePath() {
        return `http://${this.hostname}:${this.port}`;
    }
    async getWarehouse() {
        let obj = await baseGetJson("/warehouse");
        return new Promise((resolve, reject) => {
            let warehouse = warehouse_1.Warehouse.parse(obj);
            if (warehouse !== null)
                resolve(warehouse);
            else
                reject();
        });
    }
    async sendWarehouse(warehouse) {
        return fetch(`${this.basePath}/warehouse`, {
            method: "post",
            body: JSON.stringify(warehouse)
        });
    }
    async getRoutes() {
        let obj = await baseGetJson("/routes");
        return new Promise((resolve, reject) => {
            if (obj !== null)
                resolve(obj);
            else
                reject();
        });
    }
    async getOrders() {
        let obj = await baseGetJson("/orders");
        return new Promise((resolve, reject) => {
            if (obj !== null)
                resolve(obj);
            else
                reject();
        });
    }
    async getOrder(id) {
        let obj = await baseGetJson("/orders/" + encodeURIComponent(id));
        return new Promise((resolve, reject) => {
            if (obj !== null)
                resolve(obj);
            else
                reject();
        });
    }
    async sendOrder(order) {
        return fetch(`${this.basePath}/orders/${encodeURIComponent(order.id)}`, {
            method: "post",
            body: JSON.stringify(order)
        });
    }
    async getForklifts() {
        let obj = await baseGetJson("/forklifts");
        return new Promise((resolve, reject) => {
            if (obj !== null)
                resolve(obj);
            else
                reject();
        });
    }
    async getForklift(id) {
        let obj = await baseGetJson("/forklifts/" + encodeURIComponent(id));
        return new Promise((resolve, reject) => {
            if (obj !== null)
                resolve(obj);
            else
                reject();
        });
    }
}
window.apiCaller = new ApiCaller("localhost", 3000);


var addOrderForm = document.querySelector("form#addOrder");
addOrderForm.onsubmit = function () {
    let data = {};
    for (let input of addOrderForm.querySelectorAll("input, select")) {
        if (input.name) {
            if (input.name == "time") {
                let date = moment(input.value, "LLL");
                if (date.isValid())
                    data[input.name] = date.unix()
            } else
                data[input.name] = input.value;
        }
    }
    apiCaller.sendOrder(data);
    return false;
};