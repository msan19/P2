# Kodestil 


## Casing

#### Variabel- og funktionsnavne: 

- camelCase

#### Objekter: 

- PascalCase


## Sprog i programmering

- Vi anvender amerikansk engelsk


## if/else kæder

```Typescript
if (denneLinjeErMereEnd100Tegn) {
    // something
}
```

```Typescript
if (denneLinjeErMindreEnd100Tegn) // something
```

```Typescript
if (logicalExpression) {
    // something
} else if (logicalExpression) {
    // something
} else {
    // something
}
```


## Indrykning

- 4 x whitespace per indrykning


## For loops

```typescript
for (let i = 0; i < MAX_NUM; i++) {
    console.log(i);
}
```

```typescript
// for each loop
for (let key in items) {
    //item = items[key]
}
```


## Variabler

```typescript
let var1: string = "Hello";
let var2: number = 63;
```


## Switch

```typescript
switch (expression) {
    case val1:
        // something
        break;
    case val2:
        // something
        break;
    case val3: 
    case val4:
        // something
        break;
    default
        // something
        break;
}
```


## Importering 

```typescript
import ObjectName from "library";

import * as http from "http";
import * as WebSocket from "ws";
import * as net from "net";

import { Handler } from "./handler";
import { DataContainer } from "./dataContainer";
import { Forklift } from "./forklift";
```


## Funktioner

```typescript
function name(param1: type): returnType {
    return /* something */ ;
}

function name(): void {
    return /* something */ ;
}

function name(): string {
    return /* something */ ;
}

function name(): number {
    return /* something */ ;
}

function name(param1: number, param2: string): number {
    return /* something */ ;
}
```

### Anonyme funktioner 

Vi bruger udelukkende `arrow functions`.
```typescript
// Arrow functions
() => { 
    /* one line */ 
}

() => { 
    // first line;
    // second line;
}

(param1: type, param2: type) => { 
    console.log(param1);
    console.log(param2);
}

// Vi bruger ikke anonyme funktioner med function keyword
function () {
    return /* something */ ; 
}
```

### Funktionskæder

```typescript
let vec1 = new Vector(x1, y1);
let vec2 = new Vector(x2, y2);
let vec3 = new Vector(x3, y3);


vec1.add(vec2.scale(7)).scale(5).subtract(vec2).add(vec3).getLength();
```


## Promises 

```typescript
function getEntireString(request: IncomingMessage): Promise<string> {
    let socket = request.connection;

    return new Promise((resolve: (value?: any) => void, reject: (value?: any) => void) => {
        let body = "";
        socket.on("close", () => {
            reject("Connection Closed"))
        };
        socket.on("data", (data: Buffer) => {
            body += data;
        });
        socket.on("end", () => {
            resolve(body))
        };
    });
}

function getJson(request: IncomingMessage): Promise<object> {
    return getEntireString(request)
        .then((str) => {
            return new Promise((resolve: (value: object) => void) => {
                resolve(JSON.parse(str));
            });
        })
        .then( () => {

        });
}
```

## Symbolske konstanter i all caps
