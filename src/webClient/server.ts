// TO DO 

import { WebServer } from "../shared/webServer";
import { WebClientHandler } from "./webClientHandler";
import * as http from "http";

export class WebServerClient extends WebServer { // RENAME!!! 
    handler: WebClientHandler;

    constructor(hostname: string, port: number) {
        super(hostname, port);
        this.handler = new WebClientHandler();

        this.createServer({}, {});
    }


}
