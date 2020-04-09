import { ApiCaller } from "../../../shared/apiCaller";
let apiCaller = new ApiCaller("localhost", 3000);
updateGraph();
getGraph();

function updateGraph(): void {
    //@ts-ignore
    sigma.parsers.json('tempData.JSON', {
        container: 'sigma-container',
        settings: {
            defaultNodeColor: '#ec5148'
        }
    });
}

function getGraph(): void {
    apiCaller.getWarehouse().then((warehouse) => {
        console.log("Good!");
    });
}