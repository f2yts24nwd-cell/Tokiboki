# Tokiboki

Eine bunte Spielwelt für das iPad (Querformat), läuft als installierbare Web-App (PWA), auch offline.

**Spielen:** https://f2yts24nwd-cell.github.io/Tokiboki/
Auf dem iPad in Safari öffnen → Teilen ⬆️ → „Zum Home-Bildschirm“.

## Inhalt
- 6 Orte: Haus (Wohnzimmer, Küche, Bad, Schlafzimmer), Café, Supermarkt, Friseur, Badezimmer (Regendusche, Badewanne, Waschbecken, 2 WCs), Park
- Auf dem Klo machen die Figuren ein 💩 – Spülung antippen und weg ist es
- Figuren herumziehen, hinsetzen (Sofa, Stühle, Bett, Badewanne, Schaukel, Rutsche), anziehen und umstylen
- Über 100 Gegenstände: essen, halten, kochen (🥚→🍳), Kühlschrank (💧→🧊), Geschenke auspacken …
- Tag/Nacht, Geräusche (WebAudio), automatisches Speichern im Browser

## Technik
Reines HTML/CSS/JavaScript ohne Build-Schritt. `sw.js` ist der Offline-Cache – bei Änderungen dort `VERSION` erhöhen.
Lokal starten: `python3 -m http.server` und `http://localhost:8000` öffnen.
Deploy: Push auf `main` → GitHub Actions → GitHub Pages.

## Einrichtung GitHub Pages
Einmalig unter **Settings → Pages → Source** „GitHub Actions“ wählen. Danach veröffentlicht jeder Push auf `main` das Spiel automatisch.
