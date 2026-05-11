# Issue 2: Benutzerregistrierung & Passwort-Hashing
**Status:** Abgeschlossen  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf die `.activeContext.md`. Ermöglicht es neuen Besuchern, Teil der App zu werden.

## Was gebaut wird (What to build)
Implementierung einer Registrierungs-Seite (`/register`) und einer zugehörigen Server Action. Die Registrierung validiert die Eingaben (Benutzername muss eindeutig sein, Passwort min. 8 Zeichen). Passwörter werden mit `bcrypt` gehasht, bevor sie in der `users`-Tabelle gespeichert werden.

## Akzeptanzkriterien
- [x] Registrierungs-Seite mit Formular ist vorhanden.
- [x] Server Action zur Nutzererstellung implementiert.
- [x] Validierung der Passwortlänge (Zod-Schema).
- [x] Passwort wird sicher gehasht gespeichert.
- [x] Erfolgreiche Registrierung leitet zum Login weiter.
- [x] Fehlerbehandlung für bereits existierende Benutzernamen.

## Blockiert durch
- Issue 1

## Zugewiesene User Stories
- **User Story 1:** Account-Erstellung.
- **User Story 3:** Passwort-Mindestlänge (8 Zeichen).
