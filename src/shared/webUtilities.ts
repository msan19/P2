// webUtilities.ts
/**
 * A list of functions used by the handler and other webserver related tasks
 * @packageDocumentation
 * @category Shared
 */

import { IncomingMessage, ServerResponse } from "http";
import * as path from "path";
import * as fs from "fs";
import { stringifyObject } from "./utilities";

/** 
 * Gets data out of a buffer-callback 
 * @param incomingMessage Type http.IncomingMessage
 * @returns Promise with data as a string
 */
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

/** 
 * Json parser inside try-catch block
 * @param str String to be parsed
 * @returns Json object if possible else null
*/
export function JsonTryParse(str: string): object | null {
    let obj;
    try {
        obj = JSON.parse(str);
    } catch {
        return null;
    }
    return obj;
}

/** 
 * Gets data out of buffer-callback and returns as JSON
 * @param type http.IncomingMessage
 * @returns Promise with data object if possible else empty reject
*/
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

/** 
 * Checks if an id is valid
 * @param str The id 
 * @returns The id if valid else null
 */
export function parseId(str: any): string | null {
    if (typeof (str) === "string" && str.length > 0) {
        return str;
    } else {
        return null;
    }
}

/** 
 * Makes a http response
 * @param response Type http.ServerResponse
 * @param status http status-code as number
 * @param message message to be sent
 */
export function returnStatus(response: ServerResponse, status: number, message: string) {
    response.writeHead(status, message);
    response.write(message);
    response.end();
}

/** 
 * Makes http 404 response with url as message
 * @param request Type http.IncomingMessage
 * @param response Type http.ServerResponse
*/
export function returnNotFound(request: IncomingMessage, response: ServerResponse) {
    returnStatus(response, 404, `Url: '${request.url}' not found`);
}

/** 
 * Makes a http 402 response with "Invalid Json" message
 * @param response Type http.ServerResponse
 */
export function returnInvalidJson(response: ServerResponse) {
    returnStatus(response, 402, `Invalid JSON`);
}

/** 
 * Makes a http 200 response with "Success" message
 * @param response Type http.ServerResponse
 */
export function returnSuccess(response: ServerResponse) {
    returnStatus(response, 200, "Success");
}


/** 
 * Makes a http 200 response with a Json as message
 * @param response Type http.ServerResponse
 * @param obj Object to be sent as string
 */
export function returnJson(response: ServerResponse, obj: any) {
    response.writeHead(200);
    response.write(stringifyObject(obj));
    response.end();
}

/** Sanitize a path of illegal characters 
 * @param publicPath String
 * @param requestPath String
 * @returns a sanitized path as a string 
 */
export function sanitizePath(publicPath: string, requestPath: string): string {
    return path.normalize(`${publicPath}/${path.normalize(requestPath)}`);
}

/**
 * Reads a static file from `publicPath/requestPath` as a promise
 * @param publicPath String
 * @param requestPath String
 * @returns Promise with the fileData as a string or empty reject
*/
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

/**
 * Gets the content of a HTML file and replaces the placeholders "<file>'filename'" with the content of 'filename'
 * @param folder The folder in which the file is 
 * @param file The name of the file 
 * @returns The content of the file as a string
 */
export function getContentsHTML(folder: string, file: string) {
    let fileContents = String(fs.readFileSync(sanitizePath(folder, file)));
    let matches = fileContents.match(/@{file:(?<file>[^}]+)}/ig);

    if (matches !== null) {
        for (let match of matches) {
            let contents = getContentsHTML(folder, match.substring(7, match.length - 1));

            fileContents = fileContents.replace(match, contents);
        }
    }

    return fileContents;
}
