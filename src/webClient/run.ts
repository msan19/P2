// server.ts
/**
 * @packageDocumentation
 * @category WebClient
 */

import { WebServerClient } from "./server";

const THIS_HOSTNAME = process.argv[2];
const THIS_PORT = Number(process.argv[3]);
const API_HOSTNAME = process.argv[4];
const API_PORT = Number(process.argv[5]);

setTimeout(() => {
    let server = new WebServerClient(THIS_HOSTNAME, THIS_PORT, API_HOSTNAME, API_PORT, 50);
    console.log(server);
}, 2000);