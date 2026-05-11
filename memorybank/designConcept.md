# Design Kontext

## Design-Philosophie & Tonalität

**Kernprinzip:** „Ruhige Klarheit" – Das Interface verschwindet hinter den Zahlen. Kein visuelles Rauschen, keine Ablenkung. Der Nutzer soll in Sekunden verstehen, wo er finanziell steht.

**Ästhetische Richtung:** Refined Minimalism mit einer warmen, organischen Note. Kein steriles Finanz-Banking-Look, sondern eher ein gut geführtes, persönliches Notizbuch – strukturiert, aber menschlich.

---

## Farb-System (Light Mode only)

Alle Farben werden als CSS Custom Properties im `:root`-Selektor in `globals.css` definiert.

```css
:root {
  /* Hintergründe */
  --color-bg-base:        #F7F6F3; /* Warmes Off-White (kein reines Weiß) */
  --color-bg-surface:     #FFFFFF; /* Karten, Modals, Input-Felder */
  --color-bg-subtle:      #EFEDE8; /* Trennflächen, deaktivierte Bereiche */

  /* Text */
  --color-text-primary:   #1A1917; /* Fast-Schwarz, wärmer als #000 */
  --color-text-secondary: #6B6760; /* Labels, Metadaten, Hints */
  --color-text-disabled:  #B0ADA8; /* Deaktivierte Elemente */

  /* Primäre Akzentfarbe (Aktionen, Links, aktive Zustände) */
  --color-accent-primary:       #2563EB; /* Klares Blau */
  --color-accent-primary-light: #EFF4FF; /* Hintergrund für aktive Nav-Items */
  --color-accent-primary-dark:  #1D4ED8; /* Hover/Pressed-Zustand */

  /* Semantische Farben */
  --color-positive:        #16A34A; /* Einnahmen, positiv */
  --color-positive-light:  #F0FDF4; /* Hintergrund für positive Badges */
  --color-negative:        #DC2626; /* Ausgaben, negativ */
  --color-negative-light:  #FFF5F5; /* Hintergrund für negative Badges */
  --color-warning:         #D97706; /* Warnhinweise, bald fällige Abos */
  --color-warning-light:   #FFFBEB;

  /* Rahmen & Trennlinien */
  --color-border:         #E5E2DC; /* Standard-Border */
  --color-border-strong:  #C9C5BE; /* Fokus-Ringe, stärkere Trennungen */
}
```

**Regel:** Niemals Farben als Hex-Werte direkt in CSS Modules schreiben. Immer die CSS-Variable verwenden.

---

## Typografie

**Font-Stack:** Native System-Schriften – für maximale Performance und natives PWA-Gefühl.

```css
:root {
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

### Typografie-Skala

| Variable     | Größe | Gewicht | Verwendung                                   |
|--------------|-------|---------|----------------------------------------------|
| `--text-xs`  | 11px  | 400     | Micro-Labels, Timestamps                     |
| `--text-sm`  | 13px  | 400     | Sekundäre Informationen, Kategorien          |
| `--text-base`| 15px  | 400     | Fließtext, Transaktionsbeschreibungen        |
| `--text-md`  | 17px  | 500     | Listentitel, Konto-Namen                     |
| `--text-lg`  | 20px  | 600     | Sektions-Überschriften                       |
| `--text-xl`  | 24px  | 700     | Primäre Zahl (Gesamtguthaben auf Dashboard)  |
| `--text-2xl` | 32px  | 700     | Hero-Zahl (z.B. Kontostand auf Detailseite)  |

### Pflicht-Regel: Tabular Numbers

**Alle Geldbeträge** müssen mit `font-variant-numeric: tabular-nums` dargestellt werden. Diese Regel gehört in jeden CSS Module, der Zahlen rendert.

```css
/* Beispiel: Transaction.module.css */
.amount {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
```

### Einnahmen vs. Ausgaben

```css
.amountPositive { color: var(--color-positive); }
.amountNegative { color: var(--color-negative); }
```

---

## Spacing & Layout-System

**Basis-Einheit:** 4px. Alle Abstände sind Vielfache davon.

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;   /* Standard innerer Abstand (Karten, Listen-Items) */
  --space-5:  20px;
  --space-6:  24px;   /* Abstand zwischen Sektionen */
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;   /* Unterer Innenabstand für Bottom-Navigation */
}
```

### Seiten-Layout

```css
/* Gilt für alle Page-Wrapper */
.pageContainer {
  max-width: 430px;        /* Optimiert für iPhone 14 Pro viewport */
  margin: 0 auto;
  padding: 0 var(--space-4);
  padding-bottom: 80px;    /* Platz für die fixierte Bottom-Navigation */
}
```

---

## Komponenten-Regeln

### Karten (Cards)

```css
.card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: var(--space-4);
  /* Kein Box-Shadow – Grenzen statt Schatten für ein flacheres, ruhigeres UI */
}
```

### Buttons

| Variante    | Verwendung                         | Styling                                                                  |
|-------------|------------------------------------|--------------------------------------------------------------------------|
| `primary`   | Haupt-CTA (Speichern, Bestätigen)  | `background: var(--color-accent-primary)`, weiße Schrift, `border-radius: 12px` |
| `secondary` | Nebenaktionen (Abbrechen)          | `background: var(--color-bg-subtle)`, `color: var(--color-text-primary)` |
| `ghost`     | Tertiäre Aktionen, In-List-Buttons | Kein Hintergrund, `color: var(--color-accent-primary)`                   |
| `danger`    | Löschen                            | `background: var(--color-negative-light)`, `color: var(--color-negative)` |

- **Mindest-Tap-Target:** `min-height: 44px` für alle interaktiven Elemente (iOS/Android Guidelines).
- **Voller-Breite:** Primäre Buttons auf Mobile sind immer `width: 100%`.

### Floating Action Button (FAB) – „Quick Add"

Der FAB ist das wichtigste UI-Element der gesamten App. Er muss immer sichtbar, immer erreichbar sein.

```css
.fab {
  position: fixed;
  bottom: calc(64px + var(--space-4)); /* Über der Bottom-Navigation */
  right: var(--space-4);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-accent-primary);
  color: #fff;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  z-index: 100;
  border: none;
  cursor: pointer;
}
```

### Bottom Navigation

```css
.bottomNav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--color-bg-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom); /* iOS Home-Indicator Offset */
  z-index: 50;
}

.navItem {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  min-width: 64px;
}

.navItem.active {
  color: var(--color-accent-primary);
  background: var(--color-accent-primary-light);
  border-radius: 12px;
  padding: var(--space-1) var(--space-3);
}
```

### Eingabefelder (Inputs)

```css
.input {
  width: 100%;
  min-height: 44px;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  outline: none;
}

.input:focus {
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
```

### Toasts / Feedback-Meldungen

Visuelles Feedback nach jeder Nutzeraktion (Speichern, Löschen, Fehler).

```css
/* Positionierung: oben zentriert, unter der Status-Bar */
.toastContainer {
  position: fixed;
  top: calc(env(safe-area-inset-top) + var(--space-4));
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
}

.toast {
  padding: var(--space-3) var(--space-4);
  border-radius: 12px;
  font-size: var(--text-sm);
  font-weight: 500;
  white-space: nowrap;
}

.toast.success { background: var(--color-positive); color: #fff; }
.toast.error   { background: var(--color-negative); color: #fff; }
.toast.warning { background: var(--color-warning);  color: #fff; }
```

---

## Ikonographie

- **Icon-Set:** [Lucide Icons](https://lucide.dev/) – konsistent, klar, modern.
- **Standard-Größen:** `20px` für Listen/Navigation, `24px` für FAB und Aktions-Buttons.
- **Stroke-Width:** `1.5` (Standard von Lucide) beibehalten – nicht überschreiben.

---

## Visuelle Hierarchie: Geldbeträge

Das Wichtigste immer zuerst und am größten. Reihenfolge auf dem Dashboard:

1. **Gesamtguthaben aller Konten** (`--text-2xl`, `--color-text-primary`)
2. **Kontostand pro Konto** (`--text-xl`, `--color-text-primary`)
3. **Einzelbetrag einer Transaktion** (`--text-md`, `--color-positive` oder `--color-negative`)
4. **Kleinste Zahl / Kategorie-Summe** (`--text-sm`, `--color-text-secondary`)

---

## Trennlinien & Struktur

- **Zwischen Listenelementen:** `border-bottom: 1px solid var(--color-border)` (kein `<hr>`).
- **Zwischen Sektionen:** `margin-top: var(--space-6)` + optionaler Section-Header.
- **Kein Box-Shadow** außer beim FAB und bei Modals/Bottom-Sheets.

### Modals & Bottom-Sheets

Für Eingabe-Dialoge (Quick Add, Konto bearbeiten) werden **Bottom-Sheets** bevorzugt (slides von unten hoch), keine zentrierten Modals – mobiles Muster.

```css
.bottomSheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg-surface);
  border-radius: 20px 20px 0 0;
  padding: var(--space-4);
  padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  z-index: 150;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08);
}

/* Drag-Handle oben im Sheet */
.sheetHandle {
  width: 36px;
  height: 4px;
  background: var(--color-border-strong);
  border-radius: 2px;
  margin: 0 auto var(--space-4);
}
```

---

## Animationen & Transitions

Bewusst minimalistisch – nur da, wo sie Orientierung geben.

```css
:root {
  --transition-fast:   120ms ease;
  --transition-base:   200ms ease;
  --transition-slow:   300ms ease-out;
}

/* Standard für alle interaktiven Elemente */
button, a, .navItem {
  transition: background var(--transition-fast), color var(--transition-fast),
              opacity var(--transition-fast), transform var(--transition-fast);
}

/* Pressed-State auf Mobile (ersetzt Hover) */
button:active {
  transform: scale(0.97);
  opacity: 0.85;
}
```

---

## Barrierefreiheit (A11y) – Mindestanforderungen

- **Kontrastverhältnis:** Mindestens 4.5:1 für normalen Text (WCAG AA).
- **Fokus-Ringe:** Immer sichtbar – nicht mit `outline: none` entfernen, außer ein eigener Fokus-Style ist definiert.
- **Tap-Targets:** Alle interaktiven Elemente `min-height: 44px`, `min-width: 44px`.
- **Semantisches HTML:** `<button>` für Aktionen, `<a>` für Navigation, `<nav>` für Bottom-Navigation.

---

## File-Struktur Konvention

```
src/
├── app/
│   └── globals.css          ← Alle CSS-Variablen, Reset, Base-Styles
└── components/
    ├── Card/
    │   ├── Card.tsx
    │   └── Card.module.css  ← Nur Card-spezifische Styles
    ├── BottomNav/
    │   ├── BottomNav.tsx
    │   └── BottomNav.module.css
    └── ...
```

**Regel:** Kein globales Styling außerhalb von `globals.css`. Keine Inline-Styles außer für dynamische Werte (z.B. berechnete Breiten).