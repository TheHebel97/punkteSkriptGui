# Bewertungsskript für Abgaben im Modul Grundlagen und Userinterface

## Beschreibung

Ein Skript, welches das Bewerten und Dokumentieren von Abgaben der Studenten im ersten Semester im Modul Grundlagen
und Userinterface vereinfacht. Es ermöglicht das Anzeigen, Bearbeiten und Speichern von Bewertungstabellen direkt
im Browser auf der Ilias Seite der Hochschule Osnabrück.

## Installation

1. **Tampermonkey einrichten**
    - Installiere [Tampermonkey](https://www.tampermonkey.net/) in deinem Browser.
    - Aktiviere den Entwicklermodus in deinem Browser, um benutzerdefinierte Skripte auszuführen zu können.

2. **Skript hinzufügen**
    - Öffne Tampermonkey und erstelle ein neues Skript.
    - Kopiere den gesamten Inhalt der Datei `index.js` in das neue Skript und speichere es.

3. **Projekt starten**
    - Lade die Webseite, auf der das Skript ausgeführt werden soll, neu.

## Benutzung des Skriptes

1. **Tabelle anzeigen**
    - Klicke auf den Button **"Toggle Table"**, um die Bewertungstabelle ein- oder auszublenden.

2. **Bewertungen importieren**
    - Kopiere den Inhalt der Bewertungstabelle der Excel-Datei und füge ihn in das Eingabefeld ein.
    - Entferne Studenten durch Klicken auf das rote **"X"** neben ihrem Namen.

3. **Daten anwenden**
    - Klicke auf **"Daten bestätigen"**, um die aktuellen Bewertungen anzuwenden.
    - Wenn das Skript Daten auf der Seite anpasst werden diese Gelb hervorgehoben.

4. **Daten löschen**
    - Klicke auf **"Daten löschen"**, um alle gespeicherten Bewertungen zu entfernen.

5. **Tabellenanzeige speichern**
    - Die Sichtbarkeit der Tabelle wird automatisch gespeichert und beim nächsten Laden der Seite wiederhergestellt.

## Setup für die Weiterentwicklung

1. **Repository klonen**
   Klone das Repository auf deinen lokalen Rechner:
   ```bash
   git clone <repository-url>
   cd <repository-name>

2. **Hot Reload**
   - soon