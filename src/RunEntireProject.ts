import { PlanningScheduler } from "./planningScheduler/planningScheduler";
import { WebServerClient } from "./webClient/server";

setImmediate(() => {
    console.log(new PlanningScheduler(3000, "localhost"));
});



setImmediate(() => {
    console.log(new WebServerClient("localhost", 8080));
});