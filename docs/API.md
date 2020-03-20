# API
- Definition af kommunikation mellem planlægsningssystemet og andre systemer. 

Der er tre systemer, der interagerer med planlægsningsystemet. Dette er:
- Black Box'en
- Palleløftersystemet
- Kontrolpanelet

----

## Definition af planlæningssystemets grænseflade:

```
http
    /warehouseinfo
        GET
            graph: "JSON"         // Webinterface

        POST 
            graph: "JSON"         // Black Box

    /forklift
        POST
            route_done: boolean
            order_id  : number
            forlift_id: number

    /orders
        POST 
            order :  {...}         // Webinterface & Black Box

        GET
            list_of_orders : []    // Webinterface


```

---

### Grafen over lageret 

Grafen skal indlæses. Dette sker én gang, nemlig i starten. 
  - Grafen skal følge denne struktur:
  
```JSON
{
    "graph" : {
        "vertices" : [
            vertice_1, 
            vertice_2,
            vertice_3,
            .
            .
            .
            vertice_n 
        ],
        "edges" : [
            edge_1, 
            edge_2, 
            edge_3,
            .
            .
            .
            edge_n
        ]
    }
}
```
Hvor en `vertice` er:

```JSON
vertice = {
    "ID"   : "string",
    "x"    : "number", 
    "y"    : "number" 
}
```

Hvor en `edge` er:

```JSON
edge = {
    "vertice_1" : "ID",
    "vertice_2" : "ID"
}
```





---



### Palleløfter-systemet
##### `-->` planlægning
- Bekræftigelse af rutemodtagelse
- Ny information
  - Enten `Bekræftigelse af ruteudførelse` eller `fejlmeddelelse/ikke udført`. 

##### `<--` planlægning
- Sende en rute

### Webinterface
##### `-->` planlægning
- Sende forespørgsel om alt information 
- Tilføjelse af ordre

##### `<--` planlægning
- Graf over lageret
- Palleløfterinformation
  - Palleløfternes planlagte ruter
  - Palleløfternes position i reel tid
    - Hvor på grafen
      - Placering på kant
  - Palleløfterens status
