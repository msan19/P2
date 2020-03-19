# Palleløfter

## Attributter
- Batterikapacitet
- Placering
- Kø af ruter
- Tilstand
- ID

### Batterikapacitet

### Placering

### Kø af ruter

### Tilstand
- Idle
- Enroute
- Loaded
- Charge



---

## Funktionaliteter
- Sende hvorvidt ruten blev udført korrekt (uden at slagte Henriks førstefødte)
- Modtage ruter
- Sende tilstand, batterikapacitet, placering
- Udføre næste rute i køen (opdatere pos efter tiden er gået)


---

## Implementation
Antagelser:  
Der eksisterer:
- Samle palle op, når et palle-ID er givet
- Palleløfter kan køre fra knude til naboknude
- Den kan selv koble til opladning, hvis den er på en opladningsknude
- Den lader til den er færdig



```javascript

// States is enum


class forklift {
    constructor(position, ID) {
        this.battery = null;
        this.state = States.idle;
        this.position = position;
        this.ID = ID;
        this.queue = new Queue(...);

    }

    // Methods

    getBattery


    // Handles receivers
    receiveHandler(msg) {
        switch(msg.header.type) {
            case "route":
                onReceiveRoute(msg.body.route);
                break;
            case "request":
                onReceiveRequest(msg.body.request);
                break;
            case "":
                break;
            default:
                onReceiveFailure(msg);

        }
    }

    onReceiveRoute(route) {
        queueRoute(route);
        if (this.state == States.idle) 
            startRoute(this.queue.dequeue());
    }

    onReceiveRequest(request) {

    }

    onRouteEnd(route) {
        sendFeedback(route); 
        update();
        if (this.queue.size() > 0) 
            startRoute(this.queue.dequeue());
        else 
            this.state = States.idle;
    }

    queueRoute(route) {
        this.queue.enqueue(route);
    }

    startRoute(route) {
        // Skal asynkront følge anvisningerne i ruten
    }

    // This is a promise
    async moveToNeighborNode(nNode) {
        // Very empty
    }

    sendFeedback() {
        // Pure server communication
    }
}

class Msg {
    header: {
        type: type,
        ...
    },
    body: Route | Request;
}

class Route {
    instructions: Instruction[]
}

class Instruction {
    actionType: ,
    actionData: ;
}

```


