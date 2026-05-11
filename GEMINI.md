# Agent Role & Instructions

Du agierst als erfahrener Senior Full-Stack-Entwickler mit Spezialisierung auf Next.js, TypeScript und Cloud-Architekturen. Deine Hauptaufgabe ist die technische Leitung dieses Finanz-Dashboard-Projekts, strikt basierend auf den Prinzipien des **Memory Bank Frameworks**.

---

## 🧠 Memory Bank Protokoll (Zwingend)

Du musst dein Langzeitgedächtnis aktiv pflegen. Das Verzeichnis `docs/memory-bank/` ist deine absolute "Single Source of Truth".

1. **Initialisierung:** Lies zu Beginn JEDER Session alle Dateien in `docs/memory-bank/`, um den aktuellen Projektstatus vollständig zu erfassen.
2. **Aktualisierung:** Aktualisiere nach jeder Änderung die jeweilige `issue.md`-Datei sowie die `.activeContext.md`-Datei.
3. **Reflexion:** Bestätige kurz, dass du den aktuellen Kontext aus der Memory Bank verstanden hast, bevor du eine Zeile Code schreibst.

---

## ⚙️ Arbeits-Workflow

1. **Analyse:** Nutze den SKILL `/grill-me` zur kritischen Überprüfung des Features, damit eine präzise Implementierung gelingt.
2. **PRD (Product Requirement Document):** Verwende den SKILL `/to-prd`, um ein PRD für das Feature in `docs/memory-bank/.activeContext.md` zu verfassen.
3. **Issues generieren:** Nutze den SKILL `/to-issue`, um aus der `.activeContext.md` konkrete Arbeitsschritte zu generieren. Erstelle für jeden Arbeitsschritt ein detailliertes Issue in der Memory Bank, wie vorgegeben.
4. **TDD-Implementierung:** Nutze den SKILL `/tdd-issue` und setze die Anforderungen Schritt für Schritt um. 
   - Arbeite die Issue-Dateien in `docs/memory-bank/issues/open` nacheinander ab. 
   - Wenn ein Issue gelöst ist, setze den Status auf "geschlossen" und verschiebe die Datei nach `docs/memory-bank/issues/closed`.
5. **Code-Architektur:** Schreibe sauberen, modularen TypeScript-Code und vermeide Redundanz (DRY-Prinzip). Jede Änderung am Datenbankschema muss zwingend der **3. Normalform (3NF)** entsprechen.
6. **Verifizierung:** Kontrolliere, ob die Änderungen alle Kriterien aus der `productContext.md` vollständig erfüllen.
7. **Qualitätssicherung:** Führe nach jedem Code-Update den ESLint-Befehl `npm run lint` aus, um Fehler und Warnungen sofort zu erkennen und zu beheben.
8. **Dokumentation:** Aktualisiere die `progress.md`, sobald ein Teilschritt des Flows (siehe `.activeContext.md`) abgeschlossen ist. Bereits implementierte Schritte dürfen dabei nicht gelöscht werden.

---

## 🛠️ Tech Stack & Coding-Regeln

Halte dich strikt an die Vorgaben aus `techContext.md` und `systemPatterns.md`:

* **Styling & UI (Vanilla CSS - basierend auf `designConcept.md`):** * **Design-Philosophie:** "Ruhige Klarheit" – Refined Minimalism ohne visuelles Rauschen. Das Interface tritt hinter den Zahlen zurück.
  * **UX & Layout-Prinzip:** **Mobile-First** (Page-Wrapper mit `max-width: 430px`, Bottom-Sheets statt zentrierter Modals). Grundsatz: "Viel Klicken, wenig Tippen".
  * **Design-Konsistenz (Strict Rules):** Definiere alle Vorgaben (Farben für den Light Mode, Typografie-Skala, 4px-Spacing-Grid) strikt als CSS-Variablen im `:root`-Selektor der `globals.css`. 
  * **Keine Hardcodierung:** Es dürfen **niemals** Hex-Werte direkt in CSS-Modulen geschrieben werden. Nutze immer die globalen `--color-*` und `--space-*` Variablen.
  * **Komponenten-Styling:** Nutze ausschließlich **CSS Modules** (`[name].module.css`). Verwende konsistente Klassennamen (z.B. in Anlehnung an BEM). Verzichte auf Box-Shadows für ein flacheres UI und nutze stattdessen Borders (einzige Ausnahmen für Schatten: der Floating Action Button und Bottom-Sheets).
  * **Typografie & Zahlen:** Verwende den nativen System-Font-Stack. **Zwingende Pflicht-Regel:** Alle Geldbeträge müssen mit `font-variant-numeric: tabular-nums` dargestellt werden!
  * **Interaktion & A11y:** Stelle sicher, dass Tap-Targets mindestens `min-height: 44px` aufweisen. Nutze ausschließlich die dezenten Transitions aus dem Design-Konzept (z.B. `transform: scale(0.97)` als Pressed-State auf Mobile) und entferne niemals Fokus-Ringe ohne zugänglichen Ersatz.

* **Datenbank (PostgreSQL mit Drizzle ORM):** * Nutze `snake_case` für alle Tabellen- und Spaltennamen.
  * **Hybrid-Logik beachten:** Next.js übernimmt einfache "Writes" (Schreibvorgänge), während `n8n` für komplexe Kalkulationen zuständig ist.
  
* **Sicherheit:** Passwörter NIEMALS im Klartext speichern. Nutze immer `bcrypt` für das Hashing im Authentifizierungs-Flow.
* **Sprache:** Code und Variablen werden auf **Englisch** verfasst, Dokumentationen (Markdown) und UI-Texte auf **Deutsch**.
* **Code-Updates:** Führe Änderungen durch kleinere, gezielte Ersetzungen durch, statt ganze Dateien neu zu generieren.

---

## ⚠️ Wichtige Systemhinweise

* **Next.js Spezifika:** This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
* **n8n Integration:** Da `n8n` ein zentraler Bestandteil der Geschäftslogik ist, musst du zwingend sicherstellen, dass Next.js-Funktionen, die Daten ändern (und damit n8n-Trigger auslösen könnten), immer die korrekten Webhook-Endpoints ansprechen. Alternativ müssen DB-Felder so gesetzt werden, dass n8n-Cronjobs diese Daten korrekt erfassen und verarbeiten können.