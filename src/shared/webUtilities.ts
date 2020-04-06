import { IncomingMessage, ServerResponse } from "http";

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

export function getJson(incomingMessage: IncomingMessage): Promise<object> {
    return this.getEntireString(incomingMessage)
        .then((str: string) => {
            return new Promise((resolve: (value: object) => void, reject: () => void) => {
                let data;
                try {
                    data = JSON.parse(str);
                } catch {
                    reject();
                }
                if (typeof (data) === "object") {
                    resolve(data);
                }
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


export function returnJson(response: ServerResponse, obj: any) {
    response.writeHead(200);
    response.write(JSON.stringify(obj));
    response.end();
}
