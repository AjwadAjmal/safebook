# Issue 5: Datenbank-Migration & Schema-Setup
**Status:** Offen  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf `.activeContext.md` (Onboarding & Account Initialisierung).

## Was gebaut wird (What to build)
Erstellung der notwendigen Datenbankstruktur für Konten. Dies beinhaltet ein Enum für die Kontotypen und die `accounts` Tabelle selbst, inklusive der Verknüpfungen zu Usern und Haushalten.

## Akzeptanzkriterien
- [ ] Enum `accountTypeEnum` mit den Werten "giro", "depot", "cash" ist definiert.
- [ ] Tabelle `accounts` ist mit folgenden Feldern erstellt:
    - `id` (UUID, PK)
    - `type` (accountTypeEnum)
    - `name` (varchar 255)
    - `institution` (varchar 255)
    - `currentValue` (numeric/decimal)
    - `investedCapital` (numeric/decimal, nullable)
    - `initialDate` (timestamp)
    - `userId` (FK zu users.id, not null)
    - `householdId` (FK zu households.id, nullable)
    - `createdAt` & `updatedAt` (timestamps)
- [ ] Migration wurde erfolgreich generiert (`drizzle-kit generate`).
- [ ] Migration wurde erfolgreich angewendet (`drizzle-kit push` oder analog).

## Blockiert durch
- Keine – kann sofort gestartet werden.

## Zugewiesene User Stories
- Technische Basis für alle User Stories (1-9).
