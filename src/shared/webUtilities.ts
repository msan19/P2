import { IncomingMessage } from "http";

export function getEntireString(request: IncomingMessage): Promise<string> {
    return new Promise((resolve: (dataString: string) => void, reject: (reason: string) => void) => {
        let body = "";
        request.on("data", (data: Buffer) => {
            body += data;
        });
        request.on("end", () => {
            resolve(body);
        });
    });
}

export function getJson(request: IncomingMessage): Promise<object> {
    return this.getEntireString(request)
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
