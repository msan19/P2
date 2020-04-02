// TO DO 

import * as http from 'http';
console.log(http);
//import { readFile } from 'fs';

// let port = 8080;

// let server = createServer((request, response) => {
//     console.log("GOT: " + request.method + " " + request.url);

//     if (request.method === "GET") {
//         switch (request.url) {
//             case '/':
//                 console.log("here");
//                 response.writeHead(String(200), { 'Content-Type': 'text/html' });
//                 console.log("THERE");
//                 readFile('index.html', (error, content) => {
//                     response.write(content);
//                 });
//                 //writeFileToServer('index.html', response);
//                 console.log("THIS");
//                 break;
//             case '/build/sigma.min.js':
//                 response.writeHead(200, { 'Content-Type': 'text/javascript' });
//                 writeFileToServer('build/sigma.min.js', response);
//                 break;

//             case '/scripts/example.js':
//                 response.writeHead(200, { 'Content-type': 'text/javascript' });
//                 writeFileToServer('scripts/example.js', response);
//                 break;

//             case '/build/plugins/sigma.parsers.json.min.js':
//                 response.writeHead(200, { 'Content-Type': 'text/javascript' });
//                 writeFileToServer('build/plugins/sigma.parsers.json.min.js', response);
//                 break;

//         }
//     }

//     console.log("END");

// });

// function writeFileToServer(fname, response) {
//     readFile(`${fname}`, 'utf8', (error, file) => {
//         if (error === 1) {
//             response.write("Server error! Couldn't get response.");
//             console.log(error);
//         }
//         else {
//             response.write(file);
//             response.end();
//         }
//     });
// }

// server.listen(`${port}`);

// console.log(`Server is running: http://localhost:${port} or http://127.0.0.1:${port}`);
