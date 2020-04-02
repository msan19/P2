// TO DO 

let http = require('http');
let fs = require('fs'); // fs = filesystem module

let port = 8080;

let server = http.createServer( (request, response) => {
    console.log("GOT: " + request.method + " " + request.url); // this is called every time createServer is called, namely for every request.
    

    if (request.method === "GET") {
        switch (request.url){
            case '/':
                response.writeHead(200, {'Content-Type': 'text/html'});
                writeFileToServer('index.html', response);
                break;
            case '/build/sigma.min.js':
                response.writeHead(200, {'Content-Type': 'text/javascript'});
                writeFileToServer('build/sigma.min.js', response);
                break;
                
            case '/scripts/example.js':
                response.writeHead(200, {'Content-type' : 'text/javascript'});
                writeFileToServer('scripts/example.js', response);
                break;
                    

            case '/display_graph_from_json.html':
                response.writeHead(200, {'Content-Type': 'text/html'});
                writeFileToServer('display_graph_from_json.html', response);
                break;

            case '/build/plugins/sigma.parsers.json.min.js':
                response.writeHead(200, {'Content-Type': 'text/javascript'});
                writeFileToServer('build/plugins/sigma.parsers.json.min.js', response);
                break;

            case '/scripts/display_graph_from_json.js':
                response.writeHead(200, {'Content-type' : 'text/javascript'});
                writeFileToServer('scripts/display_graph_from_json.js', response);
                break;
                
            
            case '/graph.json': // expenses from .json file
                f_data = fs.readFileSync('graph.json');
                expenses = JSON.parse(f_data);
                console.log(expenses)
                response.writeHead(200, {'Content-type' : 'text/json'})
                response.write(JSON.stringify(expenses))
                response.end()
                break;
            case '/warehouse_graph.json': // expenses from .json file
                f_data = fs.readFileSync('warehouse_graph.json');
                expenses = JSON.parse(f_data);
                console.log(expenses)
                response.writeHead(200, {'Content-type' : 'text/json'})
                response.write(JSON.stringify(expenses))
                response.end()
                break;
        }   
    }

});

function writeFileToServer(fname, response){
    fs.readFile(`${fname}`, 'utf8', (error, file) => { //'utf8' if the utf-8 option is not given, then you get bytes and not characters.
        if (error === 1){
            response.write("Server error! Couldn't get response.");
            console.log(error);
        } 
        else {
            response.write(file);
            response.end();
        }
    });
}

server.listen(`${port}`); // apparently the port number must be a string when passed as parameter to listen() 

console.log(`Server is running: http://localhost:${port} or http://127.0.0.1:${port}`);
