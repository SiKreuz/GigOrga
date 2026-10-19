# GigOrga

Selbst gehostete Gig-Planung für die Band: Venue, Kontakte, Zeitplan (mit verbindlichem Get-in), Support Acts, Technik/Backline, Deal & Tickets mit Live-Kalkulation, Fahrtkosten-Überschlag mit automatischer Route (auch über Touren mit mehreren Gigs, getrennt nach Diesel und Benzin), Hospitality und Übernachtung.

Die Anmeldung läuft über [Pocket ID](https://pocket-id.org) (OpenID Connect mit Passkeys). Wer GigOrga nutzen darf, legst du in Pocket ID fest.

## Schnellstart (Docker)

```sh
cp .env.example .env   # ORIGIN und OIDC_* eintragen
docker compose up -d --build
```

Die App läuft auf http://localhost:3000, die Daten liegen im Volume `gigorga-data` (`/data/gigorga.db`). Migrationen laufen beim Start automatisch.

## Entwicklung

Voraussetzung: [Bun](https://bun.sh) 1.4.

```sh
bun install
bunx vp run dev      # Migrationen + Dev-Server
bunx vp run test     # Unit-Tests
bunx vp run check    # Format, Lint, Typen
```

Für die Anmeldung lokal einen Pocket ID starten (nur für die Entwicklung):

```sh
docker compose -f compose.dev.yml up -d
```

Einmalig einrichten:

1. http://localhost:1411/setup öffnen und das Admin-Konto mit Passkey anlegen.
2. Unter „OIDC Clients“ einen Client „GigOrga“ mit der Callback-URL `http://localhost:5173/auth/callback` anlegen.
3. `cp .env.example .env` und Client-ID und Secret in `OIDC_CLIENT_ID` und `OIDC_CLIENT_SECRET` eintragen.

## Anmeldung mit Pocket ID

Pocket ID ist nicht Teil dieses Repos und läuft im Betrieb separat, z. B. neben dem Reverse Proxy (mit HTTPS, sonst funktionieren Passkeys nicht).

1. In Pocket ID eine Gruppe `twiceasmad` anlegen und die Bandmitglieder hinzufügen.
2. Einen OIDC-Client für GigOrga mit der Callback-URL `https://<deine-domain>/auth/callback` anlegen und unter „Allowed User Groups“ auf `twiceasmad` beschränken.
3. Die Selbstregistrierung in Pocket ID ausgeschaltet lassen. Neue Mitglieder lädst du als Admin ein: Benutzer anlegen und den Einmal-Login-Link schicken, damit sie einen Passkey registrieren.
4. `ORIGIN`, `OIDC_ISSUER`, `OIDC_CLIENT_ID` und `OIDC_CLIENT_SECRET` setzen.
5. Die Basic Auth am Reverse Proxy entfernen; sie stört den Login-Redirect.

## Umgebungsvariablen

| Variable             | Standard                              | Zweck                                                 |
| -------------------- | ------------------------------------- | ----------------------------------------------------- |
| `DATA_DIR`           | `data`                                | Ordner für die SQLite-Datenbank                       |
| `PORT`               | `3000`                                | Port des Servers                                      |
| `ORIGIN`             | `http://localhost:5173`               | Öffentliche URL der App (Basis der OIDC-Callback-URL) |
| `OIDC_ISSUER`        | –                                     | URL des Pocket ID                                     |
| `OIDC_CLIENT_ID`     | –                                     | Client-ID des GigOrga-Clients in Pocket ID            |
| `OIDC_CLIENT_SECRET` | –                                     | Client-Secret dazu                                    |
| `GEOCODER_URL`       | `https://nominatim.openstreetmap.org` | Geocoding für die Routenberechnung                    |
| `ROUTER_URL`         | `https://router.project-osrm.org`     | Routing (OSRM) für Entfernung und Fahrzeit            |

Die öffentlichen Nominatim- und OSRM-Server sind für gelegentliche Abfragen gedacht. Koordinaten werden pro Venue und für die Startadresse zwischengespeichert.

## Backup

Die komplette Datenbank ist eine Datei: `gigorga.db` im `DATA_DIR` (im WAL-Modus zusätzlich `-wal`/`-shm`). Zum Sichern den Container stoppen oder `sqlite3 gigorga.db ".backup backup.db"` verwenden.
