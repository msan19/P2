// webUtilities.ts
/**
 * @packageDocumentation
 * @category Shared
 */

import { IncomingMessage, ServerResponse } from "http";
import * as path from "path";
import * as fs from "fs";

export function getEntireString(incomingMessage: IncomingMessage): Promise<string> {
    return new Promise((resolve: (dataString: string) => void, reject: (reason: string) => void) => {
        let body = "";
        incomingMessage.on("data", (data: Buffer) => {
            body += data;
        });
        incomingMessage.on("end", () => {
            resolve(body);
        });
    });
}

export function JsonTryParse(str: string): object | null {
    let obj;
    try {
        obj = JSON.parse(str);
    } catch {
        return null;
    }
    return obj;
}

export function getJson(incomingMessage: IncomingMessage): Promise<object> {
    return this.getEntireString(incomingMessage)
        .then((str: string) => {
            return new Promise((resolve: (value: object) => void, reject: () => void) => {
                let data = JsonTryParse(str);
                if (data !== null) resolve(data);
                else reject();
            });
        });
}

export function passId(str: any): string | null {
    if (typeof (str) === "string" && str.length > 0) {
        return str;
    } else {
        return null;
    }
}

export function returnStatus(response: ServerResponse, status: number, message: string) {
    response.writeHead(status, message);
    response.write(message);
    response.end();
}
export function returnNotFound(request: IncomingMessage, response: ServerResponse) {
    returnStatus(response, 404, `Url: '${request.url}' not found`);
}
export function returnInvalidJson(response: ServerResponse) {
    returnStatus(response, 402, `Invalid JSON`);
}

export function returnSuccess(response: ServerResponse) {
    returnStatus(response, 200, "Success");
}

export function returnJson(response: ServerResponse, obj: any) {
    response.writeHead(200);
    response.write(JSON.stringify(obj));
    response.end();
}

export function sanitizePath(publicPath: string, requestPath: string): string {
    return path.normalize(`${publicPath}/${path.normalize(requestPath)}`);
}

export function getStaticFile(publicPath: string, requestPath: string): Promise<string> {
    let filePath = sanitizePath(publicPath, requestPath);


    return new Promise((resolve: (fileContents: string) => any, reject: () => any) => {
        fs.exists(filePath, (exists: boolean) => {
            if (!exists) {
                // File not found
                reject();
            } else if (!fs.statSync(filePath).isFile()) {
                // Path isn't a file
                reject();
            } else {
                resolve(String(fs.readFileSync(filePath)));
            }
        });
    });
}