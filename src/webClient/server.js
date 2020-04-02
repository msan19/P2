// TO DO 

let http = require('http');
let fs = require('fs');

let port = 8080;

let server = http.createServer((request, response) => {
    console.log("GOT: " + request.method + " " + request.url);


    if (request.method === "GET") {
        switch (request.url) {
            case '/':
                response.writeHead(200, { 'Content-Type': 'text/html' });
                writeFileToServer('index.html', response);
                break;
            case '/build/sigma.min.js':
                response.writeHead(200, { 'Content-Type': 'text/javascript' });
                writeFileToServer('build/sigma.min.js', response);
                break;

            case '/scripts/example.js':
                response.writeHead(200, { 'Content-type': 'text/javascript' });
                writeFileToServer('scripts/example.js', response);
                break;

            case '/build/plugins/sigma.parsers.json.min.js':
                response.writeHead(200, { 'Content-Type': 'text/javascript' });
                writeFileToServer('build/plugins/sigma.parsers.json.min.js', response);
                break;

        }
    }

});

function writeFileToServer(fname, response) {
    fs.readFile(`${fname}`, 'utf8', (error, file) => {
        if (error === 1) {
            response.write("Server error! Couldn't get response.");
            console.log(error);
        }
        else {
            response.write(file);
            response.end();
        }
    });
}

server.listen(`${port}`);

console.log(`Server is running: http://localhost:${port} or http://127.0.0.1:${port}`);
