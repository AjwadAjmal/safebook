# Issue 9: State-Refactoring & Modal-Basis
**Status:** Erledigt  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf die `.activeContext.md` - Umstellung des Account-Onboardings auf lokale Zustandsverwaltung und Modals.

## Was gebaut wird (What to build)
Refactoring des Zustands in `AccountOnboardingForm`. Statt einer Liste von Zählern (`selections`) wird eine Liste von Account-Objekten (`accounts`) eingeführt. Zudem wird die Grundstruktur für das Modal-System (Overlay, Backdrop, Steuerung des Sichtbarkeits-States) implementiert.

## Akzeptanzkriterien
- [x] Der lokale State `accounts` speichert Objekte mit Typ, Name, Institut und Werten.
- [x] Ein `activeModalType` State steuert, welches Modal (giro, depot, cash) gerade sichtbar ist.
- [x] Eine Basis-Modal-Komponente mit Backdrop und Schließen-Logik ist vorhanden.
- [x] Die Kachel-Klicks öffnen das Modal für den jeweiligen Typ, anstatt nur einen Zähler zu erhöhen.

## Blockiert durch
- Keine – kann sofort gestartet werden.

## Zugewiesene User Stories
- Story 1: Modal-Ansicht beim Klick auf Kachel.
- Story 6 (Teilweise): Vorbereitung der Datenstruktur.
