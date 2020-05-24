import { ForkliftInfo } from "../shared/forkliftInfo";
import { Warehouse } from "../shared/warehouse";
import { Route } from "../shared/route";
import { Order } from "../shared/order";
import { WebSocket } from "../shared/webSocket";

export class DataContainer {
    warehouse: Warehouse;
    orders: { [key: string]: Order; } = {};
    routes: { [key: string]: Route; } = {};
    forklifts: { [key: string]: ForkliftInfo; } = {};

    unfinishedOrders: { [key: string]: Order; } = {};
    lockedRoutes: { [key: string]: Route; } = {};

    socket: WebSocket;

    constructor(webSocket: WebSocket) {
        this.socket = webSocket;
        this.initiateSocketListeners(this.socket);
    }

    private initiateSocketListeners(socket: WebSocket) {
        // Warehouse
        socket.on(WebSocket.packageTypes.warehouse, (warehouse: Warehouse) => {
            this.onRecievedWarehouse(warehouse);
        });
        // Orders
        socket.on(WebSocket.packageTypes.order, (order: Order) => {
            this.onRecievedOrder(order);
        });
        socket.on(WebSocket.packageTypes.orders, (orders: Order[]) => {
            for (let orderId in orders) this.onRecievedOrder(orders[orderId]);
        });
        // Failed Orders
        socket.on(WebSocket.packageTypes.orderFailed, (orderId: string) => {
            this.onRecievedOrderFailed(orderId);
        });
        socket.on(WebSocket.packageTypes.ordersFailed, (orderIds: string[]) => {
            for (let i in orderIds) this.onRecievedOrderFailed(orderIds[i]);
        });
        // Routes
        socket.on(WebSocket.packageTypes.route, (route: Route) => {
            this.onRecievedRoute(route);
        });
        socket.on(WebSocket.packageTypes.routes, (routes: Route[]) => {
            for (let routeId in routes) this.onRecievedRoute(routes[routeId]);
        });
        // Forklifts
        socket.on(WebSocket.packageTypes.forkliftInfo, (forklift: ForkliftInfo) => {
            this.onRecievedForkliftInfo(forklift);
        });
        socket.on(WebSocket.packageTypes.forkliftInfos, (forklifts: ForkliftInfo[]) => {
            for (let key in forklifts) this.onRecievedForkliftInfo(forklifts[key]);
        });
    }
    private onRecievedWarehouse(warehouse: Warehouse) {
        this.warehouse = Warehouse.parse(warehouse);
    }
    private onRecievedOrder(order: Order): void {
        this.orders[order.id] = order;
    }
    private onRecievedOrderFailed(orderId: string) {
        delete this.orders[orderId];
    }
    private onRecievedRoute(route: Route) {
        this.routes[route.routeId] = route;

        if (this.unfinishedOrders[route.orderId]) {
            delete this.unfinishedOrders[route.orderId];
            this.unfinishedOrders[route.orderId] = undefined;
            delete this.unfinishedOrders[route.orderId];
        }
        this.lockedRoutes[route.orderId] = route;
    }
    private onRecievedForkliftInfo(forkliftInfo: ForkliftInfo) {
        this.forklifts[forkliftInfo.id] = forkliftInfo;
    }
}