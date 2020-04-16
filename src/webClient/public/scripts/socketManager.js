var PackageTypes;
(function (PackageTypes) {
    PackageTypes["route"] = "route";
    PackageTypes["routes"] = "routes";
    PackageTypes["forkliftInfo"] = "forkliftInfo";
    PackageTypes["forkliftInfos"] = "forkliftInfos";
    PackageTypes["order"] = "order";
    PackageTypes["orders"] = "orders";
    PackageTypes["warehouse"] = "warehouse";
    PackageTypes["json"] = "json";
    PackageTypes["other"] = "other";
})(PackageTypes || (PackageTypes = {}));
function JsonTryParse(str) {
    let obj;
    try {
        obj = JSON.parse(str);
    }
    catch (_a) {
        return null;
    }
    return obj;
}
class SocketManager extends EventTarget {
    constructor(apiPath) {
        super();
        console.log("path: ", apiPath);
        this.socket = new WebSocket(apiPath);
        this.socket.onmessage = (event) => {
            let data = JsonTryParse(event["data"]);
            let eventToDispatch;
            if (data !== null) {
                eventToDispatch = new Event(data.type);
                eventToDispatch["body"] = data.body;
            }
            else {
                eventToDispatch = new Event(PackageTypes.other);
                eventToDispatch["body"] = event["data"];
            }
            this.dispatchEvent(eventToDispatch);
        };
    }
    on(eventType, func) {
        this.addEventListener(eventType, (e) => { func(e["body"]); });
    }
}
SocketManager.PackageTypes = PackageTypes;
window["socketManager"] = window["socketManager"] || new SocketManager("ws://localhost:8080/subscribe");
window["socketManager"].on(SocketManager.PackageTypes.other, (obj) => {
    console.log(obj);
});
