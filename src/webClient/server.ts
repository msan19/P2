// TO DO 

import { WebServerClient } from "../shared/webServer";
import { WebClientHandler } from "./webClientHandler";

let host = "127.0.0.1";
let port = 8080;

let server = new WebServerClient(WebClientHandler, port, host);
console.log(server);