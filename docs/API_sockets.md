
# API Sockets


## /subscribe
Whenever a change occurs to Forklifts, Routes or Warehouse, it'll be broadcast to any socket connected to /subscribe
## /forklift/{id}/init
When a forklift starts up, it should establish and maintain a connection to this socket to receive routes, and transmit feedback.

# Format
JSON:
```typescript
{
    type: PackageTypesEnum, // The packagetype, used for identifying the body.
    body: {
        // Object
    }
}
```

## Valid PackageTypes
```typescript
enum PackageTypes {
    route = "route",                 // A single instance of Route
    routes = "routes",               // An array of instances of Route
    forkliftInfo = "forkliftInfo",   // A single instance of ForkliftInfo
    forkliftInfos = "forkliftInfos", // ...
    order = "order",
    orders = "orders",
    warehouse = "warehouse",
    json = "json",                   // A body of valid json, but invalid type
    other = "other"                  // A body of something other than json
}
```
Note: *json* and *other* are strictly for error-handling, and should not be used as package types when transmitting.

# Example
Examples include how to send objects using [WebSocket](https://github.com/msan19/P2/blob/master/src/shared/webSocket.ts), as well as the plain-text that is sent.

## WebSocket transmit forkliftInfo
```typescript
let webSocket = new WebSocket(new ws("ws://localhost:3000/forkifts/{forkliftId}/init"));
webSocket.sendForkliftInfo(forkliftInfo);
```

## WebSocket receive forkliftInfo
```typescript
webSocket.on(WebSocket.packageTypes.forkliftInfo, (forkliftInfo) => {
    // This is called whenever a package of type 'forkliftInfo' is received.
    console.log(forkliftInfo);
})
```

## Plaintext forkliftInfo
```typescript
{
    type: "forkliftInfo",
    body: JSON.stringify(forkliftInfo)
}
```

