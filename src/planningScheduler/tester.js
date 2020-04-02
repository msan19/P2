

function sendPostForklift(id) {
    fetch(`/forklifts/${id}/initiate`, { method: "POST", data: "hello" })
        .then((response) => {
            console.log("ok");
        });
}

function sendPutForklift(id) {
    fetch(`/forklifts/${id}`, { method: "PUT", data: "hello" })
        .then((response) => {
            console.log("ok");
        });
}

sendPostForklift("yugawfshgfaw");
sendPutForklift("yugawfshgfaw");