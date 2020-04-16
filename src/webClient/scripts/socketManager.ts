// server.ts
/**
 * @packageDocumentation
 * @category WebClient
 */

enum PackageTypes {
    route = "route",
    routes = "routes",
    forkliftInfo = "forkliftInfo",
    forkliftInfos = "forkliftInfos",
    order = "order",
    orders = "orders",
    warehouse = "warehouse",
    json = "json",
    other = "other"
}

function JsonTryParse(str) {
    let obj;
    try {
        obj = JSON.parse(str);
    } catch {
        return null;
    }
    return obj;
}

class SocketManager extends EventTarget {
    static PackageTypes = PackageTypes;
    socket: WebSocket;
    constructor(apiPath: string) {
        super();
        console.log("path: ", apiPath);
        this.socket = new WebSocket(apiPath);
        this.socket.onmessage = (event) => {
            let data = JsonTryParse(event["data"]);
            let eventToDispatch;
            if (data !== null) {
                eventToDispatch = new Event(data.type);
                eventToDispatch["body"] = data.body;

            } else {
                eventToDispatch = new Event(PackageTypes.other);
                eventToDispatch["body"] = event["data"];
            }
            this.dispatchEvent(eventToDispatch);
        };
    }
    on(eventType, func: (obj) => any): void {
        this.addEventListener(eventType, (e) => { func(e["body"]); });
    }
}

window["socketManager"] = window["socketManager"] || new SocketManager("ws://localhost:8080/subscribe");

window["socketManager"].on(SocketManager.PackageTypes.other, (obj) => {
    console.log(obj);
});
