# Bugfixes & Lösungen

Hier sind dokumentierte Fehler und deren Behebung im Projekt.

## 002 - 2026-05-29 - Middleware-Laufzeitfehler durch Datenbank-Importe in NextAuth (Edge Runtime)

**Betroffene Dateien / Kontext:**
- [auth.config.ts](file:///C:/Users/Ajwad/Documents/vs_workspace/safebook/src/auth.config.ts)
- [proxy.ts](file:///C:/Users/Ajwad/Documents/vs_workspace/safebook/src/proxy.ts)
- [db/index.ts](file:///C:/Users/Ajwad/Documents/vs_workspace/safebook/src/db/index.ts)

### Problem
Nach der Implementierung der Performance-Optimierungen in den Issues #33 und #34 trat ein Fehler in der Next.js-Middleware auf, wodurch das Routing der Anwendung blockiert wurde.

Die Ursache lag darin, dass in der NextAuth-Konfiguration `auth.config.ts` die Funktion `checkUserHasAccounts` importiert und im `jwt`-Callback aufgerufen wurde. Da `auth.config.ts` von der Middleware importiert und in der Next.js **Edge Runtime** ausgeführt wird, führt jeder Import, der transitiv auf Node.js-spezifische Bibliotheken (wie das `pg`-Modul für die PostgreSQL-Verbindung) verweist, zu Kompilierungs- oder Laufzeitfehlern, da TCP-Verbindungen und Node-Bibliotheken (z. B. `net`, `tls`) in der Edge-Runtime nicht unterstützt werden.

### Schrittweiser Lösungsansatz
1. **Zustand zurücksetzen:** Die fehlerhaften Commits `f472d1c` und `70c5573` wurden mittels `git reset --hard afd6972` verworfen, um die Codebase wieder in den stabilen Zustand vor der Einführung dieser Optimierungen zu bringen.
2. **Issue-Löschung:** Die fehlerhaften Issues #33 und #34 sowie das übergeordnete PRD #32 wurden aus dem GitHub Issue Tracker gelöscht, da das gewählte Architekturmuster (Datenbankzugriff im `jwt`-Callback von `auth.config.ts`) nicht mit den Einschränkungen der Middleware-Laufzeitumgebung kompatibel war.
3. **Tests & Linting verifizieren:** Nach dem Hard-Reset wurden `npm run lint` und `npm test` ausgeführt. Alle 44 Tests (einschließlich der Middleware-Routing-Tests in `src/proxy.test.ts`) liefen erfolgreich durch und bestätigten die Wiederherstellung der korrekten Funktionalität.

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
