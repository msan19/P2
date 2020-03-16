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
