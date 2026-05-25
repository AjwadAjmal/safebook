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

## Beziehungen

- Die **Profilerstellung** erzeugt ein Benutzerprofil mit initialen Konten (**Girokonto**, **Aktiendepot**, **Kasse**), welche über das **Profile-Creation-Modal** im **Local Staging** gesammelt werden.
- Nach erfolgreicher **Profilerstellung** führt das **Haushalts-Onboarding** den Benutzer dazu, einen **Haushalt** zu erstellen oder einem beizutreten.

## Beispieldialog

> **Entwickler:** "Muss der Nutzer beim **Haushalts-Onboarding** sofort ein **Girokonto** anlegen?"
> **Fachexperte:** "Nein. Die Konten werden bereits vorher während der **Profilerstellung** initialisiert. Im **Haushalts-Onboarding** wird nur noch der **Haushalt** erstellt oder beigetreten, wobei die zuvor erstellten Konten verknüpft werden."

## Markierte Mehrdeutigkeiten

- "Onboarding" wurde fälschlicherweise sowohl für die Profilerstellung (Konto-Initialisierung) als auch für das Haushalts-Setup verwendet — gelöst: die Phasen sind nun strikt getrennt in **Profilerstellung** (Profile Creation) und **Haushalts-Onboarding** (Household Onboarding).

