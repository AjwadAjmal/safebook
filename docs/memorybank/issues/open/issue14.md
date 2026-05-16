# Issue 14: Finale Speicherung & Integration
**Status:** Offen  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf die `.activeContext.md`. Abschluss des Onboarding-Schritts.

## Was gebaut wird (What to build)
Implementierung des finalen "Konten speichern & Weiter"-Buttons am Ende der Seite. Dieser Button sammelt alle Daten aus dem lokalen `accounts` State und übergibt sie an die bestehende Server-Action `createProfileAccounts`.

## Akzeptanzkriterien
- [ ] Der finale Button ist nur aktiv, wenn mindestens ein Konto angelegt wurde.
- [ ] Beim Klick werden alle Konten an das Backend gesendet.
- [ ] Nach erfolgreichem Speichern erfolgt die Weiterleitung (bestehende Logik der Server-Action).
- [ ] Fehler vom Server werden korrekt über dem Button angezeigt.

## Blockiert durch
- Issue 9

## Zugewiesene User Stories
- Story 11: Finaler Speicher-Button.
