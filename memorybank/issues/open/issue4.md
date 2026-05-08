# Issue 4: Haushalt beitreten via Einladungscode
**Status:** Offen  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf die `.activeContext.md`. Ermöglicht kollaborative Haushaltsführung.

## Was gebaut wird (What to build)
Erweiterung der Onboarding-Seite um die Funktion "Einem Haushalt beitreten". Nutzer können einen 10-stelligen Einladungscode eingeben. Die Server Action validiert den Code und verknüpft den Nutzer mit dem entsprechenden Haushalt (Standardrolle: `member`).

## Akzeptanzkriterien
- [ ] Eingabefeld für Einladungscode auf der Onboarding-Seite.
- [ ] Server Action sucht Haushalt anhand des `invite_code`.
- [ ] Validierung: Nutzer wird bei gültigem Code dem Haushalt zugeordnet.
- [ ] Fehlerbehandlung bei ungültigen oder abgelaufenen Codes.
- [ ] Weiterleitung zum Dashboard nach erfolgreichem Beitritt.

## Blockiert durch
- Issue 3

## Zugewiesene User Stories
- **User Story 8:** Beitritt via Einladungscode.
