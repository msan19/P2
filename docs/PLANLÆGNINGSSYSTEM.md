# Planlægningssystem


## Data systemet skal indeholde
- Graf over lageret
- Ordre
- Palleløfternes position

## Objekter

- ### Ordre
  - #### Palleplacering
    - Startposistion
    - Slutposition
    - Tidspunkt 
      - *Enten* starttidspunkt *eller* sluttidspunkt.
  - #### Kør til opladning
    - startposition, slutposition


- ### Rute
  - #### En rute er en liste af instruktioner
    - Kør
    - Vent
    - Sæt palle på plads 
    - Tag en palle op
    - Lad op
  - #### Oversættelsesfunktion
    - **Input**: 
      - En liste af knuder (*dette er selve ruten fra A til B*)
      - Opsamlingspunkt og afleveringspunkt
    - **Output**: 
      - En liste af instruktioner


- ### Lager
  - ### Graf
    - #### Knuder 
      - 2D koordinat
      - ID / navn
      - En liste af tupler der ser således ud:
        -  `[(palleløfter_ID, tid), ...]`
        -  En tuple angiver at en palleløfter befinder sig på en given knude på et givent tidspunkt.
    - #### Kanter  
      - En kant er et knudepar
        - `(knude1, knude2)`
      - En liste af tupler der ser således ud:
        - `[(palleløfter_ID, tid), ...]`
          - `tid` betegner det tidspunkt hvor palleløfteren med det givne `palleløfter_ID` befinder sig midt på kanten (midtpunkt: halv længde). 
      - Har en længde
  
    - #### Adjencency list?

- ### Palleløfter
  - #### Strømkapacitet
  - #### Løftekapacitet
  - #### Dimensioner
  - #### State
    - 3 mulige tilstande:
      - Holder stille
      - Har en ordre
      - Færdiggjort ordre
      - Lad op
  - #### Position
  - #### Kø af ruter

- ### RouteSet
  - #### En liste af ruter
    - Disse ruter er en mulig konfiguration af alle ordre, der ikke er har fået tildelt en endelig rute. 
  - #### En liste af prioriterede ordre
    - Prioritet = rækkefølge
      - Dette bestemmet rækkefølge af udførelse

---

## Informationsflow mellem systemerne

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


--- 

## Klasse til ruteplanlægning

##### "Pseudoklasse":
```javascript

data = {
      listOfOrders = new Array[];
      listOfRouteSets = new RouteSet[]; 
      bestRouteSet = new RouteSet; 
}

Module {
    function addOrder(order){
      // something
      this.listOfOrders.push(order);
    }

    function getRoute(order){
      route = this.bestRouteSet.get(order);
      addRouteToGraph(route); // locks route in graph
      this.listOfOrders.remove(order);
      return route;
    }

    // calculateRoutes is called inside a loop
    function calculateRoutes(listOfOrders, listOfRouteSets){
      // something
      // makes use of this.listOfOrders
      return listOfRouteSets
    }

    function findBestRouteSet(listOfRouteSets){
      return listOfRouteSets.best()
    }

    function getStartTime(order){
      // something
      return this.bestRouteSet.get(order).getStartTime();
    }

    function addRouteToGraph(route){
      // something
    }

    function update(data){
      data.listOfRouteSets = calculateRoutes(
          data.listOfOrders, data.listOFRouteSets);
      data.bestRouteSet = findBestRouteSet( 
          data.listOfRouteSets);
    }
}

```

### `calculateRoute`-algoritmen

Krav: 
- Algoritmen nuværende rutedata for bestemte ruter skal kunne "låses"
- På et vilkårligt tidspunkt kan algoritmen, ved forespørgsel, "spytte" en bestemt rute ud.
- Du kan ikke få en rute, når algoritmen kører.

**Input:**
- Liste af ordre

**Output:**
- En mængde af gode ruter


