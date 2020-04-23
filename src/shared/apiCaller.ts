// apiCaller.ts
/**
 * @packageDocumentation
 * @category Shared
 */

import { Warehouse } from "./warehouse";
import { default as fetch, Response } from "node-fetch";
import { Route } from "./route";
import { Order } from "./order";
import { ForkliftInfo } from "./forkliftInfo";

export class ApiCaller {
    basePath: string;
    constructor(basePath: string) {
        // Strip a following slash
        if (basePath[basePath.length - 1] === "/") basePath = basePath.substring(0, basePath.length - 1);

        this.basePath = basePath;
    }

    private async baseGetJson(path): Promise<any> {
        let response = await fetch(this.basePath + path);
        let obj = await response.json();

        return new Promise((resolve: (obj: any) => any) => {
            resolve(obj);
        });
    }

    async getWarehouse(): Promise<Warehouse> {
        let obj = await this.baseGetJson("/warehouse");
        return new Promise((resolve: (warehouse: Warehouse) => any, reject: () => any) => {
            let warehouse = Warehouse.parse(obj);
            if (warehouse !== null) resolve(warehouse);
            else reject();
        });
    }

    async sendWarehouse(warehouse: Warehouse): Promise<Response> {
        return fetch(`${this.basePath}/warehouse`, {
            method: "post",
            body: JSON.stringify(warehouse)
        });
    }

    async getRoutes(): Promise<Route[]> {
        let obj = await this.baseGetJson("/routes");
        return new Promise((resolve: (routes: Route[]) => any, reject: () => any) => {
            if (obj !== null) resolve(<Route[]>obj);
            else reject();
        });
    }

    async getOrders(): Promise<Order[]> {
        let obj = await this.baseGetJson("/orders");
        return new Promise((resolve: (orders: Order[]) => any, reject: () => any) => {
            if (obj !== null) resolve(<Order[]>obj);
            else reject();
        });
    }

    async getOrder(id: string): Promise<Order> {
        let obj = await this.baseGetJson("/orders/" + encodeURIComponent(id));
        return new Promise((resolve: (order: Order) => any, reject: () => any) => {
            if (obj !== null) resolve(<Order>obj);
            else reject();
        });
    }

    async sendOrder(order: Order): Promise<Response> {
        return fetch(`${this.basePath}/orders/${encodeURIComponent(order.id)}`, {
            method: "post",
            body: JSON.stringify(order)
        });
    }

    async getForklifts(): Promise<ForkliftInfo[]> {
        let obj = await this.baseGetJson("/forklifts");
        return new Promise((resolve: (forkliftInfos: ForkliftInfo[]) => any, reject: () => any) => {
            if (obj !== null) resolve(<ForkliftInfo[]>obj);
            else reject();
        });
    }

    async getForklift(id: string): Promise<ForkliftInfo> {
        let obj = await this.baseGetJson("/forklifts/" + encodeURIComponent(id));
        return new Promise((resolve: (forkliftInfo: ForkliftInfo) => any, reject: () => any) => {
            if (obj !== null) resolve(<ForkliftInfo>obj);
            else reject();
        });
    }
}