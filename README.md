# MTG Decktester – eigenständige Version (GitHub Pages + Supabase)

Deck einfügen, analysieren, allein testen oder online gegeneinander spielen.
Kartendaten und Bilder kommen direkt von Scryfall, der Online-Tisch läuft über Supabase Realtime.

## Dateien

- `index.html` – die komplette App
- `config.js` – hier trägst du deine Supabase-Zugangsdaten ein
- `cards/` – mitgelieferte Decks (Tannuk, Doctor Doom) samt Regeln für Trigger und Fähigkeiten

## 1. Supabase einrichten (für den Online-Tisch)

1. Auf supabase.com ein kostenloses Konto und ein neues Projekt anlegen.
2. Im Projekt unter **Project Settings → API** kopieren:
   - die **Project URL**
   - den **anon** bzw. **publishable** Key
3. Beides in `config.js` eintragen.

Nie den `service_role`- oder `secret`-Key eintragen – der gehört nicht in eine öffentliche Seite.
Tabellen oder weitere Einstellungen sind nicht nötig, die App nutzt nur Realtime (Presence).

Hinweis: Kostenlose Supabase-Projekte werden bei längerer Inaktivität pausiert.
Wenn der Beitritt zum Tisch fehlschlägt, das Projekt im Supabase-Dashboard wieder aktivieren.

## 2. Auf GitHub Pages veröffentlichen

1. Auf github.com ein neues Repository anlegen (öffentlich).
2. Alle Dateien aus diesem Ordner hochladen (inklusive `cards/`).
3. Im Repository: **Settings → Pages → Build and deployment → Deploy from a branch**,
   Branch `main`, Ordner `/ (root)`, speichern.
4. Nach ein bis zwei Minuten ist die Seite unter `https://<dein-name>.github.io/<repo>/` erreichbar.

## 3. Online spielen

1. Alle Spieler öffnen den Link und laden im Tab **Deck** ihre Liste (Moxfield → Export → Copy Plain Text).
2. Im Tab **Testen** Namen und denselben **Tisch-Code** eingeben → **Tisch beitreten**.
3. Alle behalten ihre Starthand, einer tippt **Startspieler auslosen**.

Tisch-Codes sind nicht geheim: Wer Link und Code kennt, kann beitreten.

## Was diese Version nicht hat

- Keine KI-Funktionen (Deck-Analyse, Hand bewerten, Regeln lernen) – die bräuchten einen API-Schlüssel auf einem Server.
- Automatische Trigger gibt es für die mitgelieferten Decks. Bei anderen Decks lassen sich Regeln pro Karte
  von Hand eintragen (Karte antippen → „Regeln ansehen/bearbeiten“), sonst spielt man diese Karten manuell.
- Keine Blocker, keine Interaktion mit gegnerischen Karten; Spielstand geht beim Neuladen verloren.

Kartendaten und -bilder: Scryfall. Magic: The Gathering ist eine Marke von Wizards of the Coast; dies ist ein inoffizielles Fan-Werkzeug.
