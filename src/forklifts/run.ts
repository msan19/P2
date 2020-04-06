import { Forklift } from "./forklift";

const SERVER_HOSTNAME = '127.0.0.1';
const SERVER_PORT = 3000;

var forklifts = [];
setTimeout(function () {


    for (let i = 0; i < 100; i++) {
        forklifts.push(new Forklift("F" + i, SERVER_HOSTNAME, SERVER_PORT));
    }
}, 3000);