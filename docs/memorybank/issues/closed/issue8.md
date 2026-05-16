# Issue 8: Selektiver Konten-Import & Haushalts-Verknüpfung
**Status:** Offen  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf `.activeContext.md` (Onboarding & Account Initialisierung).

## Was gebaut wird (What to build)
Erweiterung des bestehenden Haushalts-Onboardings. Der Nutzer entscheidet beim Erstellen/Beitreten eines Haushalts, welche seiner Profil-Konten geteilt werden sollen.

## Akzeptanzkriterien
- [ ] `/onboarding/household` zeigt eine Liste aller Konten des Nutzers an, die noch keine `householdId` haben.
- [ ] Nutzer kann Konten via Checkbox für den Import markieren.
- [ ] Server Actions `createHousehold` und `joinHousehold` wurden angepasst, um die IDs der ausgewählten Konten zu empfangen.
- [ ] Nach erfolgreicher Haushalts-Operation werden die ausgewählten Konten in der DB mit der neuen `householdId` aktualisiert.
- [ ] Nach Abschluss erfolgt die Weiterleitung zum Dashboard.

## Blockiert durch
- Issue 7 (Kachel-basierte Konten-Initialisierung)

## Zugewiesene User Stories
- **User Story 7, 8**
