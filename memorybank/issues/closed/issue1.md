# Issue 1: Auth.js Basis-Setup & Login-Route
**Status:** Abgeschlossen  
**Typ:** AFK

## Übergeordneter Kontext
Referenz auf die `.activeContext.md` (Authentifizierung & Onboarding). Die App benötigt ein sicheres Zugangssystem.

## Was gebaut wird (What to build)
Grundkonfiguration von Auth.js (NextAuth) mit dem CredentialsProvider für Benutzername und Passwort. Implementierung einer zentralen Login-Seite. Einbindung einer Middleware, die standardmäßig alle Routen schützt und nicht eingeloggte Nutzer zur Login-Seite umleitet. Die Session soll als flüchtiges Session-Cookie konfiguriert werden.

## Akzeptanzkriterien
- [x] Auth.js Konfigurationsdatei erstellt.
- [x] CredentialsProvider validiert Benutzername und Passwort gegen die Datenbank (via Drizzle).
- [x] Middleware schützt alle Routen außer `/login` und `/register`.
- [x] Login-Seite mit Formular (Benutzername, Passwort) ist funktional.
- [x] Generische Fehlermeldung bei ungültigen Anmeldedaten.
- [x] Session verfällt nach 1 Stunde.

## Blockiert durch
Keine – kann sofort gestartet werden.

## Zugewiesene User Stories
- **User Story 2:** Anmeldung mit Zugangsdaten.
- **User Story 4:** Generische Fehlermeldung bei falschen Daten.
- **User Story 5:** Sitzungsende nach 1 Stunde.
- **User Story 9:** Erneute Anmeldung beim Öffnen der App.
