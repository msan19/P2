import { IncomingMessage, ServerResponse, Server } from "http";

import { getJson, returnJson, returnNotFound, returnStatus, passId, returnInvalidJson } from "../shared/webUtilities";



interface IController { [key: string]: (request: IncomingMessage, response: ServerResponse, parsedUrl: string[]) => void; };


export class WebClientHandler {

    controllers: { [key: string]: IController; } = {

    };
};

