import { IncomingMessage, ServerResponse, Server } from "http";


function getEntireString(request: IncomingMessage): Promise<string> {
    let socket = request.connection;

    return new Promise((resolve: (dataString: string) => void, reject: (reason: string) => void) => {
        let body = "";
        socket.on("close", () => {
            reject("Connection Closed");
        });
        socket.on("data", (data: Buffer) => {
            body += data;
        });
        socket.on("end", () => {
            resolve(body);
        });
    });
}

function getJson(request: IncomingMessage): Promise<object> {
    return getEntireString(request)
        .then((str: string) => {
            return new Promise((resolve: (value: object) => void) => {
                resolve(JSON.parse(str));
            });
        });
}

function hasId(element): boolean {
    return typeof (element) === "string" && element.length > 0;
}

function returnStatus(response: ServerResponse, status: number, message: string) {
    response.writeHead(status, message);
    response.write(message);
    response.end();
}
function returnNotFound(request: IncomingMessage, response: ServerResponse) {
    returnStatus(response, 404, `Url: '${request.url}' not found`);
}
function returnNotImplemented(request: IncomingMessage, response: ServerResponse) {
    returnStatus(response, 500, `Url: '${request.url}' not implemented`);
}
function returnJson(response: ServerResponse, obj: any) {
    response.writeHead(200);
    response.write(JSON.stringify(obj));
    response.end();
}


interface IController { [key: string]: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]) => void; };


export class WebClientHandler {

    controllers: { [key: string]: IController; } = {

    };
};

