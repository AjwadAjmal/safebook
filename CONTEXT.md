# Safebook Kontext

Das private, datenschutzorientierte Haushaltsbuch zur manuellen Finanzkontrolle.

## Sprache

### Profile Creation (Profilerstellung)

**Profilerstellung** (Profile Creation):
Der Prozess zur initialen Erstellung von Konten nach der Registrierung und deren Speicherung im Nutzerprofil.
_Vermeiden_: Onboarding, Registrierung (für diesen Teil)

**Kachelansicht** (Tile Grid):
Die visuelle Übersicht der verfügbaren Kontotypen zur initialen Auswahl während der Profilerstellung.

**Account-Karte** (Account Card):
Eine kompakte, aufklappbare Darstellung eines lokal konfigurierten Kontos.
_Vermeiden_: Konto-Eintrag, Konto-Zeile

**Profile-Creation-Modal**:
Ein modales Dialogfenster, das den Prozess zur Erstellung oder Bearbeitung von Konten eines bestimmten Typs führt.

**Lokal sammeln** (Local Staging):
Der Zustand, in dem Kontoinformationen im Frontend zwischengespeichert werden, bevor sie final durch den Nutzer in die Datenbank übernommen werden.

**Girokonto**:
Ein klassisches Bankkonto für den täglichen Zahlungsverkehr.

**Aktiendepot**:
Ein Konto zur Verwaltung von Wertpapieren, das zusätzlich das Feld "Investiertes Kapital" erfordert.

**Kasse**:
Ein virtuelles Konto zur Erfassung von Bargeldbeständen.

### Household Onboarding (Haushalts-Onboarding)

**Haushalts-Onboarding** (Household Onboarding):
Der Prozess des Erstellens eines Haushalts oder des Beitretens zu einem Haushalt per Einladungscode, nachdem Konten initialisiert wurden.
_Vermeiden_: Profilerstellung, Setup

**Haushalt** (Household):
Zentrale Einheit für den gemeinsamen Datenraum mehrerer Nutzer.

### Dashboard (Finanzübersicht)

**Dashboard** (Finanzübersicht):
Die Hauptübersicht des Haushalts für angemeldete Nutzer, die den Gesamtsaldo und alle verknüpften Konten gruppiert auflistet.
_Vermeiden_: Landing-Page, Konten-Setup

### Navigation

**Sidebar-Navigation** (Navigation Drawer):
Ein seitliches Overlay-Menü (Drawer), das über ein Menü-Icon in der Kopfzeile geöffnet wird und die primären Verlinkungen der Anwendung sowie den Haushaltsnamen bereitstellt.
_Vermeiden_: Bottom Navigation, Tab-Bar

**Kopfzeile** (Global Header):
Die fixierte Leiste am oberen Bildschirmrand, die das Menü-Icon und den Namen der aktuell geöffneten Seite (z. B. "Dashboard", "Meine Konten", "Neue Transaktion") anzeigt.

### Kontenverwaltung (Account Management)

**Konten-Seite** (Accounts Page / `/accounts`):
Eine eigenständige Seite zur Anzeige aller verknüpften Konten des Haushalts, gruppiert nach Kontotypen (Girokonten, Aktiendepots, Kasse).
_Vermeiden_: Konten-Setup, Profile Creation

**Gruppensumme** (Group Subtotal):
Die aufsummierte Gesamtsumme der Salden aller Konten innerhalb einer Kontogruppe (z. B. Summe aller Girokonten).

### Transaktionsverwaltung (Transaction Management)

**Transaktion** (Transaction / Buchung):
Eine einzelne finanzielle Bewegung (Ausgabe oder Einnahme), die einem bestimmten Konto zugeordnet ist und dessen Kontostand (`currentValue`) direkt verändert.
_Vermeiden_: Aktivität, Bewegung

**Transaktionserfassung** (Transaction Entry):
Der Vorgang des schnellen Erfassens einer neuen Transaktion über eine eigene Seite (z. B. `/transactions/new`), aufgerufen über den Quicklink-Button unter der Gesamtsaldo-Karte auf dem Dashboard.

**Transaktionsliste** (Recent Transactions):
Die zusammenhängende Listenansicht in einer gemeinsamen Karte im Dashboard, in der die letzten Transaktionen bündig ohne Zwischenabstände und mit dezenten Trennlinien dargestellt werden.

**Kategorie** (Category):
Eine logische Klassifizierung einer Transaktion (z. B. "Tanken", "Lebensmittel", "Gehalt"). Das System bietet vordefinierte Standardkategorien sowie die Möglichkeit, direkt bei der Erfassung eigene haushaltsspezifische Kategorien anzulegen.

**Transaktionszusammenfassung** (Transaction Summary):
Die finale Übersicht (Schritt 4) im Transaktions-Wizard vor dem Speichern, in der alle erfassten Details (Konto, Typ, Betrag, Datum, Kategorie) in einzelnen Zeilen mit Bearbeiten-Aktionen geprüft und mit einer optionalen Beschreibung versehen werden können.

### Benutzerverwaltung & Administration (User Management)

**Benutzerverwaltung** (User Management):
Der exklusive Administrationsbereich zur manuellen Neuanlage von Benutzerkonten und zur rückstandslosen Löschung von Benutzern und deren verwaisten Haushalten.
_Vermeiden_: Registrierung, Nutzereinstellungen

**Superadmin** (Dev / Systemadministrator):
Eine übergeordnete Systemrolle, die berechtigt ist, neue Benutzerkonten zu erstellen und bestehende Benutzer sowie deren Daten aus dem System zu entfernen.
_Vermeiden_: Haushalts-Admin (dieser verwaltet nur einen einzelnen Haushalt)

**Rückstandslose Bereinigung** (Clean Deletion):
Der vollständige Löschvorgang, der bei Entfernung eines Benutzers alle mit ihm verknüpften Konten, Transaktionen und bei alleiniger Haushaltszugehörigkeit auch den gesamten Haushalt mitsamt dessen Kategorien aus der Datenbank tilgt.

## Beziehungen


- Die **Profilerstellung** erzeugt ein Benutzerprofil mit initialen Konten (**Girokonto**, **Aktiendepot**, **Kasse**), welche über das **Profile-Creation-Modal** im **Local Staging** gesammelt werden.
- Nach erfolgreicher **Profilerstellung** führt das **Haushalts-Onboarding** den Benutzer dazu, einen **Haushalt** zu erstellen oder einem beizutreten.
- Ein **Superadmin** erstellt neue Benutzerkonten in der **Benutzerverwaltung**, woraufhin der Benutzer nach dem ersten Login die **Profilerstellung** und das **Haushalts-Onboarding** durchläuft.
- Die **Rückstandslose Bereinigung** entfernt einen Benutzer, seine Konten und Transaktionen; verbleiben keine weiteren Mitglieder im Haushalt, wird der gesamte **Haushalt** mitsamt Kategorien gelöscht.

## Beispieldialog

> **Entwickler:** "Muss der Nutzer beim **Haushalts-Onboarding** sofort ein **Girokonto** anlegen?"
> **Fachexperte:** "Nein. Die Konten werden bereits vorher während der **Profilerstellung** initialisiert. Im **Haushalts-Onboarding** wird nur noch der **Haushalt** erstellt oder beigetreten, wobei die zuvor erstellten Konten verknüpft werden."

## Markierte Mehrdeutigkeiten

- "Onboarding" wurde fälschlicherweise sowohl für die Profilerstellung (Konto-Initialisierung) als auch für das Haushalts-Setup verwendet — gelöst: die Phasen sind nun strikt getrennt in **Profilerstellung** (Profile Creation) und **Haushalts-Onboarding** (Household Onboarding).
- "Admin" bezog sich zuvor nur auf den Verwalter eines Haushalts — geschärft: Es gibt nun den **Haushalts-Admin** (lokal für einen Haushalt) und den **Superadmin** (systemweit zur Benutzerverwaltung).


