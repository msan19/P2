import { createGraph } from "./warehouse";
import * as fs from "fs";

let g = createGraph();
console.log(g);
let prettyG = JSON.stringify(g, null, 4);
console.log(prettyG);
fs.writeFileSync("./src/blackBox/graph.json", prettyG);