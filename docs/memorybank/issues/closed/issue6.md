# Issue 6: Multi-Step Onboarding Proxy & Routing
**Status:** Erledigt  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf `.activeContext.md` (Onboarding & Account Initialisierung).

## Was gebaut wird (What to build)
Anpassung der Routing-Logik im Proxy (`src/proxy.ts`), um den neuen mehrstufigen Onboarding-Flow zu erzwingen. Nutzer müssen erst Konten anlegen, bevor sie zum Haushalts-Onboarding gelangen.

## Akzeptanzkriterien
- [ ] Proxy prüft, ob ein eingeloggter Nutzer bereits Konten besitzt (Check auf `accounts` Tabelle mit `userId`).
- [ ] Wenn keine Konten vorhanden: Umleitung zu `/onboarding/accounts`.
- [ ] Wenn Konten vorhanden, aber kein `householdId` am User-Objekt: Umleitung zu `/onboarding/household`.
- [ ] Der Zugriff auf interne Seiten (Dashboard etc.) ist erst gestattet, wenn sowohl Konten als auch ein Haushalt vorhanden sind.
- [ ] `/onboarding/accounts` und `/onboarding/household` sind vom Proxy-Schutz ausgenommen (analog zu login/register), sofern der Status dies erfordert.

## Blockiert durch
- Issue 5 (Datenbank-Migration & Schema-Setup)

## Zugewiesene User Stories
- **User Story 1:** ...zuerst aufgefordert werden, meine Konten anzulegen...
- **User Story 6:** ...nach der Konten-Erstellung zum Haushalts-Onboarding weitergeleitet werden...
- **User Story 9:** ...automatisch an den richtigen Schritt weitergeleitet werden...
