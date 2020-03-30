const http = require("http");
function newGuid() {return ""};

let i = 0;

//import Forklift = require("./classes/Forklift.ts");
import {Forklift} from "./classes/forklift"
import {DataContainer} from "./classes/dataContainer"
import {WebServer} from "./classes/webServer"

 

let data = new DataContainer();

const handler = require("./handler")(data);
const fs = require("fs");

const hostname = '127.0.0.1';
const port = 3000;


class Main {
    server
    constructor(data, port, hostname) {
        this.server = new WebServer(data, port, hostname);
        this.server.run();
        this.update();
    }
    

    update() {
        console.log(`i: ${i++}`);
        // Actual code

        let self = this;
        setImmediate(function() {
            self.update();
        });
    }
}






let main = new Main(data, port, hostname);