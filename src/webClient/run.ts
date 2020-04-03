import { WebServerClient } from "./server";

let server = new WebServerClient("localhost", 8080);
console.log(server);
server.run();