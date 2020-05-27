# P2

## Projektets struktur 
Projektets kildekode er inddelt i fem hovedmapper: **blackBox**, **forklifts**, **planningScheduler**, **webClient** og **shared**.
Derudover, findes der to hjælpemapper kaldet **docs** og **test**. 

Hovedmappernes indhold:
- [blackBox](./src/blackBox/)
- [forklifts](./src/forklifts/)
- [orderSpammer](./src/orderSpammer/)
- [planningScheduler](./src/planningScheduler/)
- [webClient](./src/webClient/)
- [shared](./src/shared/)

Hjælpemappernes indhold:
- [test](./test/)
- [docs](./docs/)

---

## Hent krævede npm-moduler
Programmet kræver visse moduler relateret til Node.js. Disse skal derfor hentes.

Først hentes Node.js og npm fra siden https://www.npmjs.com/get-npm

Dernæst åbnes en terminal fra roden af projektmappen. I denne terminal indtastes:
```
npm i 
```
Derved hentes alle nødvendige moduler, og programmet kan derefter køres

## Start programmet
Programmet kan startes på to forskellige måder; enten gennem en konsol eller gennem Visual Studio Code. 

Programmet er sat op til at køre i VS Code, men kan også køres i en terminal. 

På begge metoder køres programmet, således at websiden kan tilgås på http://localhost:8080/

### I VS Code:
1. Åben projektmappen i VsCode
2. Vælg debug-menuen i venstre side
3. Vælg "Run Entire Project" i dropdown'en i toppen til venstre
4. Tryk på den grønne pil

### I konsol: 
Opsætning
```
git clone https://github.com/msan19/P2.git --branch aflevering
cd P2
npm i
npm run program
```
Eksekvering:
```
npm run program
```

For at slukke programmet kan der i konsolen trykkes ctrl + c

## Ændring typen af grafen
Når programmet hentes vil den være indstillet til at køre for en graf af typen "transit" med ordrer, der passer hertil.

For at ændre dette skal der i følgende filer ændres:

### Ændring til Kiva-opsætning
```
I src/blackBox/run linje 17: Ændr GraphTypes.transit til GraphTypes.kiva
I src/blackBox/run linje 32-34: Fjerne kommentarerne rundt om dette for at aktivere det
I src/forklifts/run linje 43: Ændr strengen fra "real" til "kiva"
I src/orderSpammer/run linje 22: Udkommenter denne linje
```
### Ændring til Simpel-opsætning (10 x 10)
```
I src/blackBox/run linje 17: Ændr GraphTypes.transit til GraphTypes.simpel
I src/blackBox/run linje 32-34: Fjerne kommentarerne rundt om dette for at aktivere det
I src/blackBox/orderSpammer linje 112-118: Udkommenter dette
I src/blackBox/orderSpammer linje 95-97: Enten fjern kommentering om dette, hvis der ønskes forudbestemte ordrer, eller gør intet, for ikke at modtage nogen ordrer. 
I src/forklifts/run linje 43: Ændr strengen fra "real" til "none"
I src/orderSpammer/run linje 22: Udkommenter denne linje
```

## Programmets HTML-dokumentation
Der er genereret HTML-dokumentation til mapperne [blackBox](./src/blackBox/), [forklifts](./src/forklifts/), [planningScheduler](./src/planningScheduler/), [shared](./src/shared/) og [orderSpammer](./src/orderSpammer/). 
HTML-dokumentationen kan ses ved åbne mappen [./docs/html](./docs/html), hvorefter [globals.html](./docs/html/globals.html) skal åbnes i en browser.