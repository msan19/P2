import { callApi } from "./apiTest";
import { Order, OrderTypes } from "../../src/planningScheduler/classes/order";
import { stringify } from "querystring";

const API_HOSTNAME = "localhost";
const API_PORT = 3000;


//callApi(API_HOSTNAME, API_PORT, "/warehouse", "GET", "");

sendOrder();

callApi(API_HOSTNAME, API_PORT, "/orders", "GET", "");
//callApi(API_HOSTNAME, API_PORT, "/orders/4124-1324-1243-1110", "GET", "");

// callApi(API_HOSTNAME, API_PORT, "/forklifts", "GET", "");
// callApi(API_HOSTNAME, API_PORT, "/forklifts/C12A7328-F81F-11D2-BA4B-00A0C93EC93B", "GET", "");

//callApi(API_HOSTNAME, API_PORT, "/routes", "GET", "");

function sendOrder() {
    let order = new Order(OrderTypes.movePallet, "F0", "P0", "n0-0", "n4-7");
    console.log(order);
    callApi(API_HOSTNAME, API_PORT, "/orders", "POST", JSON.stringify(order, null, 4));
}

