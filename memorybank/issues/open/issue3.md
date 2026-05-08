# Issue 3: Onboarding-Redirect & Haushalt-Erstellung
**Status:** Offen  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf die `.activeContext.md`. Nutzer müssen einem Haushalt zugeordnet sein, um die Finanzfunktionen nutzen zu können.

## Was gebaut wird (What to build)
Erweiterung der Routing-Logik: Eingeloggte Nutzer ohne `household_id` (Initialzustand nach Registrierung) werden automatisch zu einer Onboarding-Seite (`/onboarding`) geleitet. Dort kann der Nutzer einen neuen Haushalt erstellen. Die Server Action erstellt den Haushalt und verknüpft den Ersteller als Admin.

## Akzeptanzkriterien
- [ ] Middleware/Session-Check leitet Nutzer ohne Haushalt zu `/onboarding`.
- [ ] Onboarding-Seite mit Option "Haushalt erstellen".
- [ ] Server Action erstellt neuen Eintrag in `households`.
- [ ] Aktueller Nutzer wird in der DB mit der neuen `household_id` verknüpft und bekommt die Rolle `admin`.
- [ ] Nach Erstellung erfolgt die Weiterleitung zum Haupt-Dashboard.

## Blockiert durch
- Issue 2

## Zugewiesene User Stories
- **User Story 6:** Redirect zum Onboarding.
- **User Story 7:** Neuen Haushalt benennen/erstellen.
