# Bugfixes & Lösungen

Hier sind dokumentierte Fehler und deren Behebung im Projekt.

## 001 - 2026-05-29 - Ungültiger Export in Server Action Datei (Next.js)

**Betroffene Dateien / Kontext:**
- [account.ts](file:///C:/Users/Ajwad/Documents/vs_workspace/safebook/src/lib/actions/account.ts)

### Problem
Beim Absenden des Formulars zur Profilerstellung trat ein Next.js-Laufzeitfehler auf:
`Error: A "use server" file can only export async functions, found object.`

Dieser Fehler wird von Next.js geworfen, weil in der Datei `src/lib/actions/account.ts` (die mit `"use server"` deklariert ist) die Zod-Validierung `accountsSchema` als Konstante exportiert wurde (`export const accountsSchema`). Next.js erlaubt in Server-Action-Dateien ausschließlich den Export von asynchronen Funktionen.

### Schrittweiser Lösungsansatz
1. **Export entfernen:** Die Deklaration von `accountsSchema` in [account.ts](file:///C:/Users/Ajwad/Documents/vs_workspace/safebook/src/lib/actions/account.ts) wurde von `export const accountsSchema` auf eine einfache lokale Deklaration (`const accountsSchema`) abgeändert. Da das Schema nur innerhalb der Server Action selbst zur Validierung verwendet wird, war ein externen Export nicht erforderlich.
2. **Abhängigkeiten prüfen:** Es wurde über das gesamte Projekt nach Importen von `accountsSchema` gesucht (via `grep_search`). Außerhalb von `account.ts` gab es keine weiteren Verwendungen, sodass der Verzicht auf das `export` sicher war.
3. **Validierung der Tests:** Alle Node.js-Unit-Tests (`npm run test`) und Vitest-Frontend-Tests (`npm run test:ui -- --run`) wurden lokal ausgeführt. Alle Tests liefen erfolgreich durch.
4. **Fehlerfreiheit bestätigen:** Durch Ausführen von `npm run lint` wurde sichergestellt, dass keine neuen Linter- oder TypeScript-Probleme aufgetreten sind.
