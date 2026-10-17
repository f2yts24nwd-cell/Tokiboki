# Tokiboki

Eine bunte Spielwelt für das iPad (Querformat), läuft als installierbare Web-App (PWA), auch offline.

**Spielen:** https://f2yts24nwd-cell.github.io/Tokiboki/
Auf dem iPad in Safari öffnen → Teilen ⬆️ → „Zum Home-Bildschirm“.

## Inhalt
- Startseite: animierte Weltkarte – Ort antippen und hineinzoomen (auch über „Karte“ in der Leiste)
- 11 Orte: Haus (Wohnzimmer, Küche, Bad, Schlafzimmer), Café, Supermarkt, Friseur, Badezimmer (Regendusche, Badewanne, Waschbecken, 2 WCs), Heylinschule (Flur und Klassenzimmer der 4A), itmX Büro (Empfang, 3 Büros, Meetingraum), Festival „Tokiland“ (Hauptbühne, Waldbühne, Riesenrad, DJ-Pult mit echter Musik und Scratchen), Freibad (Becken, Sprungturm, Wasserrutsche, Liegen, Kiosk), Zoo (Elefanten, Giraffen, Affen, Pinguine, Löwen, Futterautomat), Park
- Auf dem Klo machen die Figuren ein 💩 – Spülung antippen und weg ist es
- Figuren herumziehen, hinsetzen (Sofa, Stühle, Bett, Badewanne, Schaukel, Rutsche), anziehen und umstylen
- Über 100 Gegenstände: essen, halten, kochen (🥚→🍳), Kühlschrank (💧→🧊), Geschenke auspacken …
- Ablegen mit „Magnet“: Gegenstände rasten auf Tischen und Regalen ein, eine Leuchtlinie zeigt beim Ziehen, wo sie landen; Sachen lassen sich stapeln
- Haustiere folgen ihrer Figur (Tier auf die Figur ziehen), Fahrzeuge zum Einsteigen (Antippen = losfahren, Rakete und Ufo fliegen)
- Wetter draußen (☀️ 🌧️ ❄️ 🌈), Tag/Nacht von Hand, alle 5 Minuten oder nach echter Uhrzeit
- Fotoalbum (📸): Fotos mit Rahmen und Stickern, als Bild speichern/teilen
- Mini-Spiele: Café-Bestellungen, Friseur-Wünsche, Rhythmus-Spiel am DJ-Pult, Quiz der 4A (Buzzer auf dem Lehrerpult)
- Bedienung: ↩️ Rückgängig, Kisten-Suche und „Zuletzt benutzt“, Namen für Figuren, Anleitung
- Einstellungen: Lautstärke (Musik, Geräusche, Stimme), Spar-Modus für ältere iPads, Ort aufräumen, Spielstand als Datei sichern und laden
- Spielzeit-Begrenzung: nach 10 Minuten wackelt der Bildschirm mit einer Warnung, nach 15 Minuten 10 Sekunden Countdown, danach Sperrbildschirm bis zum nächsten Tag. Eltern-Bereich (mit 4-stelliger Eltern-PIN) unter ⚙️ → „Spielzeit“: Zeiten ändern, ausschalten, +15 Min. freigeben
- Geräusche (WebAudio), automatisches Speichern im Browser

## Technik
Reines HTML/CSS/JavaScript ohne Build-Schritt. `sw.js` ist der Offline-Cache – bei Änderungen dort `VERSION` erhöhen.
Lokal starten: `python3 -m http.server` und `http://localhost:8000` öffnen.
Deploy: Push auf `main` → GitHub Actions → GitHub Pages.

## Einrichtung GitHub Pages
Einmalig unter **Settings → Pages → Source** „GitHub Actions“ wählen. Danach veröffentlicht jeder Push auf `main` das Spiel automatisch.

## Musik
Die Festival-Tracks in `audio/` sind eigene, mit `tools/make_music.py` synthetisierte Kompositionen
(gemeinfrei, CC0 – siehe `audio/LIZENZ.txt`). Neu erzeugen: `python3 tools/make_music.py`.

## Vokabel-Trainer
Über **🎓 Lernen** gibt es kurze Englisch-Lektionen (Klasse 6) im Stil von Lern-Apps. Für gelöste Lektionen
gibt es ⭐, damit schaltet man im Shop neue Sachen für die Figuren frei. Die Wortlisten stehen in
`js/vocab.js` und lassen sich dort leicht gegen die genauen Unit-Listen aus dem Schulbuch austauschen.

Außerdem: Wiederholung im Karteikasten-Prinzip (falsche Wörter kommen früher wieder), Wochenziel mit Bonus-Sternen,
16 Abzeichen, Tiere und Fahrzeuge als Belohnung (Kiste → ⭐) und eine Aussprache-Übung mit dem Mikrofon (falls das Gerät
Spracherkennung anbietet – sonst lässt sie sich überspringen).
