var webSocket = new WebSocket("ws://localhost:8080/subscribe");
webSocket.onmessage = function (event) {
    console.debug("WebSocket message received:", event);
};