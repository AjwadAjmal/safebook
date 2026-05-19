# PRD: Onboarding Grouping & Balance Validation

## Problem Statement
Im aktuellen Onboarding-Prozess werden erstellte Konten in einer unsortierten, flachen Liste angezeigt, was bei mehreren Konten die Übersichtlichkeit erschwert. Zudem erlaubt das Eingabefeld für den Saldo inkonsistente Formate und zu viele Nachkommastellen, was zu Fehlern bei der Finanzplanung führen kann.

## Solution
Die Onboarding-Seite gruppiert Konten nun automatisch nach Kategorien (Girokonto, Aktiendepot, Kasse) unter entsprechenden Überschriften. Das Saldo-Eingabefeld wird technisch auf zwei Nachkommastellen begrenzt und formatiert Eingaben beim Verlassen des Feldes automatisch (z.B. `6.9` zu `6.90`), wobei sowohl Komma als auch Punkt als Trenner akzeptiert werden.

## User Stories
1. Als Nutzer möchte ich, dass meine Konten nach Typ gruppiert angezeigt werden, damit ich schnell den Überblick über meine verschiedenen Finanzquellen behalte.
2. Als Nutzer möchte ich aussagekräftige Kategorie-Überschriften (z.B. "Girokonto") sehen, um die Liste besser scannen zu können.
3. Als Nutzer möchte ich, dass Kategorien ohne Konten ausgeblendet werden, um die UI sauber und fokussiert zu halten.
4. Als Nutzer möchte ich, dass die Kategorien in einer logischen Reihenfolge (Giro > Depot > Kasse) erscheinen.
5. Als Nutzer möchte ich beim Eintippen meines Saldos daran gehindert werden, mehr als zwei Nachkommastellen einzugeben, um Eingabefehler von vornherein zu vermeiden.
6. Als Nutzer möchte ich, dass meine Eingabe automatisch auf zwei Stellen ergänzt wird (z.B. `10` -> `10,00`), sobald ich das Feld verlasse, um eine konsistente Darstellung zu gewährleisten.
7. Als Nutzer möchte ich sowohl Komma als auch Punkt als Dezimaltrenner verwenden können, da dies meiner gewohnten Schreibweise entspricht.
8. Als Nutzer möchte ich, dass ungültige Zeichen im Saldo-Feld ignoriert oder sofort validiert werden.

## Implementation Decisions
- **Gruppierungs-Logik:** Die Liste der Konten im `AccountOnboardingForm` wird vor dem Rendering nach Typ gruppiert.
- **Kategorie-Header:** Einführung von UI-Komponenten für die Überschriften in der `accountList`.
- **Eingabe-Validierung (Real-time):** Der `onChange`-Handler im Modal unterbindet die Eingabe von mehr als 2 Nachkommastellen.
- **Auto-Formatierung (On Blur):** Implementierung eines `onBlur`-Events für das Saldo-Feld, das den Wert normiert (Punkt zu Komma für UI) und auf zwei Stellen auffüllt.
- **Zentrale Utility:** Extraktion der Währungs-Formatierung in ein "Deep Module" (`lib/account-utils.ts`), um die Logik isoliert testen zu können.
- **Normalisierung:** Intern wird der Saldo für Berechnungen oder Speicherung in ein einheitliches numerisches Format (String mit Punkt) konvertiert.
- **Technische Trennung (Client/Server):** Um Build-Fehler (wie "Module not found: dns") in Client-Komponenten zu vermeiden, muss Geschäftslogik strikt getrennt werden:
    - `lib/account-utils.ts`: Rein mathematische/formattierungsspezifische Hilfsfunktionen (Client-sicher).
    - `lib/account-db.ts`: Datenbank-Operationen (Server-only).

## Testing Decisions
- **Deep Module Tests:** Unit-Tests für die Formatierungs-Utility in `lib/account-utils.test.ts`. Tests sollten Randfälle wie "nur Punkt", "viele Nullen", "keine Nachkommastellen" abdecken.
- **UI Integration:** Verifikation, dass die Kategorie-Header korrekt erscheinen/verschwinden, wenn Konten hinzugefügt/gelöscht werden.
- **Input-Verhalten:** Testen der Eingabe-Beschränkung (verhindern der 3. Nachkommastelle).

## Out of Scope
- Tausendertrennstellen während der Eingabe (nur einfache Dezimalzahlen).
- Unterstützung von Fremdwährungen (nur €).
- Permanente Datenbank-Speicherung während der Onboarding-Schritte (bleibt lokaler State).
