# Issue 7: Kachel-basierte Konten-Initialisierung & Server Action
**Status:** Offen  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf `.activeContext.md` (Onboarding & Account Initialisierung).

## Was gebaut wird (What to build)
Die Benutzeroberfläche für den ersten Onboarding-Schritt. Nutzer wählen Kontotypen via Kacheln und füllen ein dynamisch generiertes Formular aus. Die Daten werden via Server Action gespeichert.

## Akzeptanzkriterien
- [ ] UI-Komponente mit 3 Kacheln (Girokonto, Aktiendepot, Kasse) und +/- Steuerung ist implementiert.
- [ ] Formular-Sektion generiert sich dynamisch basierend auf der Kachel-Auswahl (z.B. 2 Girokonten gewählt -> 2 Formular-Blöcke für Giro).
- [ ] Spezifisches Feld `investedCapital` wird nur bei Typ "Aktiendepot" angezeigt.
- [ ] Client-seitige Validierung verhindert "Weiter" ohne mindestens ein Konto.
- [ ] Server Action `createProfileAccounts` speichert die Liste der Konten in der DB (mit `householdId: null`).
- [ ] Nach erfolgreichem Speichern erfolgt ein Redirect zum nächsten Onboarding-Schritt.

## Blockiert durch
- Issue 5 (Datenbank-Migration & Schema-Setup)
- Issue 6 (Proxy & Routing - für die Erreichbarkeit der Route)

## Zugewiesene User Stories
- **User Story 1, 2, 3, 4, 5**
