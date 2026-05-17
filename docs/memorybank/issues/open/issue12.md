# Issue 12: Account-Karten & Listenansicht
**Status:** Erledigt  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf die `.activeContext.md`. Visualisierung des Fortschritts auf der Hauptseite.

## Was gebaut wird (What to build)
Implementierung der `AccountCard` Komponente. Diese erscheint unterhalb der Kacheln für jedes lokal angelegte Konto. Die Karte zeigt den Typ und den Namen an und kann aufgeklappt werden, um alle Details (Institut, Saldo, Datum) zu sehen.

## Akzeptanzkriterien
- [x] Komponente `AccountCard` zeigt Typ (Icon/Label) und Namen an.
- [x] Karten sind aufklappbar (Toggle-Mechanismus für Details).
- [x] Karten erscheinen dynamisch unter den Kacheln, sobald Konten im State vorhanden sind.

## Blockiert durch
- Issue 9

## Zugewiesene User Stories
- Story 6: Kompakte Karten unter Kacheln.
- Story 7: Aufklappen für Eigenschaften.
