# Issue 10: Modal-Wizard & Account-Erstellung
**Status:** Erledigt  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf die `.activeContext.md`. Fokus auf den Workflow innerhalb des Modals.

## Was gebaut wird (What to build)
Implementierung des Zwei-Schritt-Workflows im Modal: 
1. Bestätigungs-Screen ("Möchtest du ein [Typ] Konto anlegen?").
2. Eingabe-Formular für die Kontodetails (Name, Institut, Saldo, Datum).
Inklusive Validierung der Felder innerhalb des Modals, bevor ein Konto zum lokalen State hinzugefügt wird.

## Akzeptanzkriterien
- [x] Das Modal zeigt einen initialen Bestätigungs-Dialog.
- [x] Nach Bestätigung erscheint das Eingabeformular.
- [x] Das Formular validiert Pflichtfelder (Name, Institut, Saldo).
- [x] Beim Klick auf "Speichern" im Modal wird das Konto zum `accounts` State der Hauptkomponente hinzugefügt und das Modal schließt sich.

## Blockiert durch
- Issue 9

## Zugewiesene User Stories
- Story 2: Bestätigung im Modal.
- Story 3: Eingabe der Kontodetails.
