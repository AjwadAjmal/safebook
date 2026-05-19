# PRD: Onboarding & Account Management Refinement

## Problem Statement
Der aktuelle Onboarding-Prozess erlaubt es Nutzern, beliebig oft auf Kontotyp-Kacheln zu klicken, was zu Verwirrung führen kann, wenn bereits Konten dieses Typs existieren. Zudem ist die UI der Account-Karten mit Icons im Header überladen und die Löschfunktion ist zu präsent und inkonsistent platziert.

## Solution
Die Onboarding-Kacheln werden nach der ersten Erstellung eines Kontos dieses Typs deaktiviert (visuell markiert, aber nicht mehr anklickbar für neue Konten). Die Account-Karten erhalten ein aufgeräumteres Design ohne Header-Icons; stattdessen gibt es einen "Bearbeiten"-Button in der Detailansicht. Die Löschfunktion wird exklusiv in das Modal-Fenster (Akkordeon-Ansicht) verschoben.

## User Stories
1. Als Nutzer möchte ich sehen, wie viele Konten eines Typs ich bereits angelegt habe, damit ich den Überblick behalte.
2. Als Nutzer möchte ich, dass eine Kachel deaktiviert wird, sobald ich ein Konto dieses Typs erstellt habe, damit ich nicht versehentlich den initialen Erstellungsprozess erneut starte.
3. Als Nutzer möchte ich ein bestehendes Konto über einen dedizierten "Bearbeiten"-Button in der Kartenansicht anpassen können, um Details zu korrigieren.
4. Als Nutzer möchte ich, dass weitere Konten eines bereits existierenden Typs nur über den Bearbeitungsmodus des Modals hinzugefügt werden können.
5. Als Nutzer möchte ich Konten nur innerhalb des Modals löschen können, um versehentliches Löschen in der Listenansicht zu vermeiden.

## Implementation Decisions
- **AccountOnboardingForm:** 
    - Logik zum Sperren der Kacheln (`onClick` verhindern), wenn `count > 0`.
    - Visuelle Anpassung der Kacheln via `tileDisabled` Klasse (blauer Rahmen bleibt).
- **AccountCard:**
    - Entfernen der Icons (Stift/Mülleimer) aus dem Header.
    - Hinzufügen eines "Bearbeiten"-Buttons am Ende der aufgeklappten Detailansicht.
- **Modal-Logik:**
    - Integration einer Löschfunktion innerhalb des Akkordeons im Modal.
    - Sicherstellen, dass das Löschen des letzten Kontos eines Typs die entsprechende Kachel im Onboarding wieder freigibt.
- **CSS (auth.module.css):**
    - `tileDisabled`: Spezial-Style für inaktive Kacheln.
    - `accountCardEditButton`: Style für den neuen primären Button in der Karte.
    - `accordionDeleteButton`: Dezenter Lösch-Button für Einträge im Modal.

## Testing Decisions
- Validierung, dass Kacheln bei `count > 0` nicht mehr das "Neu-Erstellen"-Modal öffnen.
- Überprüfung, ob der "Bearbeiten"-Button korrekt das Modal im richtigen Kontext öffnet.
- Sicherstellung, dass die Löschfunktion im Modal die lokale State-Liste korrekt aktualisiert.

## Out of Scope
- Dauerhafte Speicherung in der Datenbank während des Onboardings (bleibt lokal bis zum finalen "Speichern").
- Erweiterte Validierungen über die bestehenden Felder hinaus.
