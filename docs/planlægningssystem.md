# Planlægningssystem

## Objekter

- ### Ordre
  - #### Palleplacering
    - Startposistion
    - Slutposition
    - Tidspunkt 
      - *Enten* starttidspunkt *eller* sluttidspunkt.
  - #### Kør til opladning


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
      - 
    - #### Kanter  
      - Knudepar
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

  

