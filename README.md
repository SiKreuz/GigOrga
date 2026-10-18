# GigOrga

Selbst gehostete Gig-Planung für die Band: Venue, Kontakte, Zeitplan (mit verbindlichem Get-in), Support Acts, Technik/Backline, Deal & Tickets mit Live-Kalkulation, Fahrtkosten-Überschlag mit automatischer Route, Hospitality und Übernachtung.

Eine Authentifizierung gibt es in der App nicht; den Zugang regelst du über Basic Auth am Reverse Proxy.

## Schnellstart (Docker)

```sh
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

## Umgebungsvariablen

| Variable       | Standard                              | Zweck                                      |
| -------------- | ------------------------------------- | ------------------------------------------ |
| `DATA_DIR`     | `data`                                | Ordner für die SQLite-Datenbank            |
| `PORT`         | `3000`                                | Port des Servers                           |
| `ORIGIN`       | –                                     | Öffentliche URL hinter einem Reverse Proxy |
| `GEOCODER_URL` | `https://nominatim.openstreetmap.org` | Geocoding für die Routenberechnung         |
| `ROUTER_URL`   | `https://router.project-osrm.org`     | Routing (OSRM) für Entfernung und Fahrzeit |

Die öffentlichen Nominatim- und OSRM-Server sind für gelegentliche Abfragen gedacht. Koordinaten werden pro Venue und für die Startadresse zwischengespeichert.

## Backup

Die komplette Datenbank ist eine Datei: `gigorga.db` im `DATA_DIR` (im WAL-Modus zusätzlich `-wal`/`-shm`). Zum Sichern den Container stoppen oder `sqlite3 gigorga.db ".backup backup.db"` verwenden.
