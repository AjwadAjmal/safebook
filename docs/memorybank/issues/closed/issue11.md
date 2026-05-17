# Issue 11: Multi-Account Management im Modal
**Status:** Abgeschlossen  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf die `.activeContext.md`. Optimierung des Modals für Nutzer mit mehreren Konten.

## Was gebaut wird (What to build)
Erweiterung des Modals um die Funktion "Weiteres Konto hinzufügen". Implementierung einer Akkordeon-Logik: Wenn ein neues Konto hinzugefügt wird, klappt das vorherige Formular ein. Nur ein Formularabschnitt ist gleichzeitig zur Bearbeitung geöffnet.

## Akzeptanzkriterien
- [x] Option "Weiteres Konto hinzufügen" ist im Modal verfügbar.
- [x] Bestehende Formularabschnitte klappen bei Hinzufügen eines neuen Abschnitts ein.
- [x] Der Nutzer kann zwischen den Abschnitten wechseln (Akkordeon-Verhalten).
- [x] Alle Konten im Modal werden beim finalen Schließen des Modals in den Haupt-State übernommen.

## Blockiert durch
- Issue 10

## Zugewiesene User Stories
- Story 4: Weiteres Konto hinzufügen.
- Story 5: Akkordeon-Logik (Einklappen).
