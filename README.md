# Wyswietlacz Wagonowy
# PL 🇵🇱
Taki tam poboczny projekt, który zaproponował mi mój kolega.
Projekt zacząłem robić z pomocą AI, co spowodowało, że było ciężko go kontynuować.
Jednak z powodu YSWS Hackclub (konkretnie Reboot), zdecydowałem się zaprogramować nowy wygląd (PR).
Dodatkowo rewriteowałem kilka elementów, bo wersja AI nie funkcjonowała tak jak chciałem oraz była dość nie czytelna.
W trakcie pisania na YSWS nie używałem AI w ogóle (co było dość ciekawym doświadczeniem).

<img height="600" width="400" alt="ic-0" src="/readmeImg/IC.png" />
<img height="600" width="400" alt="ic-0" src="/readmeImg/PR.png" />

## Funkcje
- [x] Symulacja wyświetlania
    - [x] według wzoru IC
        - [x] z opóźnieniem
        - [x] bez opóźnienia
    - [x] według wzoru PR
        - [x] z możliwością włączenia wyświetlania pozostałych przystanków
- [x] Informacja o postoju na stacji / przystanku
- [x] Automatyczne usuwanie przystanków osobowych
- [ ] Możliwość ręcznego przełączania przystanków

## Opis ustawień
#### Prędkość wykrywania postoju
Zmiana minimalnej prędkości, którą symulator uznaję za postój.

### Tylko wersja IC
#### Wyświetlaj opóźnienie
- **WŁĄCZONE:**

    <img alt="obraz" src="/readmeImg/IC-d-on.png" />

- **WYŁĄCZONE:** (lub brak opóźnienia)

    <img alt="obraz" src="/readmeImg/IC-d-off.png" />

#### Tylko główne stacje
Pokazywane są tylko stację uznane za główne przez TD2.

#### Następne przystanki
Pokazywana ilość przystanków na wyświetlaczu.

### Tylko wersja PR
#### Przewijaj pozostałe przystanki
- **WŁĄCZONE:**

    <img height="150" width="400" alt="obraz" src="/readmeImg/PR-s-on.gif" />

- **WYŁĄCZONE:**

    <img height="150" width="400" alt="obraz" src="/readmeImg/PR-s-off.gif" />

# EN 🇬🇧

Just a side project that my friend asked me to do.
I started working on it with AI, which made it hard to keep going.
But because of YSWS Hackclub (Reboot, to be exact), I decided to code a new design (PR).
In addition, I rewritten several elements because the AI version did not function as I wanted it to and was quite unreadable.
While writing for YSWS, I did not use any AI at all (which was quite an interesting experience).

<img height="600" width="400" alt="ic-0" src="/readmeImg/IC.png" />
<img height="600" width="400" alt="ic-0" src="/readmeImg/PR.gif" />

## Features

- [x] Display simulation
    - [x] IC design
        - [x] with delay
        - [x] without delay
    - [x] PR design
        - [x] option to display more then 6 stops
- [x] Stop status information
- [x] Automatic removal of local stops (`po` ones)
- [ ] Manual stop selection

## Settings
#### Stop detection speed (`Prędkość wykrywania postoju`)
Change the minimum speed at which the simulator considers the vehicle to be at a stop.

### IC version only
#### Show delay (`Wyświetlaj opóźnienie`)
- **ON:**

    <img alt="obraz" src="/readmeImg/IC-d-on.png" />

- **OFF:** (or no delay)

    <img alt="obraz" src="/readmeImg/IC-d-off.png" />

#### Only main stations (`Tylko główne stacje`)
Only stations recognized as main ones by TD2 are displayed.

#### Next stops (`Następne przystanki`)
The number of stops displayed.

### PR version only
#### Scroll through remaining stops
- **ON:**

    <img height="150" width="400" alt="obraz" src="/readmeImg/PR-s-on.gif" />

- **OFF:**

    <img height="150" width="400" alt="obraz" src="/readmeImg/PR-s-off.gif" />
