// server.ts
/**
 * @packageDocumentation
 * @category WebClient
 */

import { WebServerClient } from "./server";

const THIS_HOSTNAME = "localhost";
const THIS_PORT = 8080;
const API_HOSTNAME = "localhost";
const API_PORT = 3000;

setTimeout(() => {
    let server = new WebServerClient(THIS_HOSTNAME, THIS_PORT, API_HOSTNAME, API_PORT, 50);
    console.log(server);
}, 2000);