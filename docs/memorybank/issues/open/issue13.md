# Issue 13: Bearbeiten & Löschen
**Status:** Offen  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf die `.activeContext.md`. Nachträgliche Korrekturen der lokalen Daten.

## Was gebaut wird (What to build)
Hinzufügen von Aktions-Icons (Stift zum Bearbeiten, Mülleimer zum Löschen) zu den `AccountCard` Komponenten.
- Löschen: Entfernt das Konto sofort aus dem lokalen State.
- Bearbeiten: Öffnet das Modal des entsprechenden Typs erneut und fokussiert direkt auf das gewählte Konto (Akkordeon offen).

## Akzeptanzkriterien
- [ ] Löschen-Icon entfernt das Konto aus dem State.
- [ ] Bearbeiten-Icon öffnet das Modal im korrekten Kontext.
- [ ] Das zu bearbeitende Konto ist im Modal vorausgewählt und aufgeklappt.

## Blockiert durch
- Issue 11
- Issue 12

## Zugewiesene User Stories
- Story 8: Löschen-Funktion.
- Story 9: Bearbeiten-Funktion.
- Story 10: Modal-Fokus beim Bearbeiten.
