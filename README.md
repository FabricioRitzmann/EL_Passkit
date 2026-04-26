# EL Passkit MVP

Apple-ähnlicher Wallet-Karten-Editor mit Supabase-orientierter Projektstruktur.

## Neu in dieser Version

- Kundenverwaltung mit Punkten und Status
- Vorlagenverwaltung (Pass-Farben, Pass-Typ, Barcode-Typ)
- Pass-Ausgabe mit Seriennummer und Ablaufdatum
- Supabase-gestützte Datenhaltung (Kunden, Vorlagen, Pässe, Punkte)
- `pass.json`-Export für die aktuell gewählte Vorlage

## Struktur

- `frontend/`: Dashboard, Editor, Kundenverwaltung, Vorlagen, Pass-Ausgabe
- `frontend/js/api.js`: einfache Daten-API für Kunden, Vorlagen, Pässe und Punktebuchungen
- `frontend/js/ui.js`: Rendering-Funktionen für Dashboard, Tabellen und Selects
- `backend/supabase/migrations/database.sql`: Basis-Tabellen
- `backend/supabase/migrations/2026-04-26_promillo_extension.sql`: Punkte- und Event-Erweiterung
- `backend/supabase/functions/*`: Edge-Function-Stubs für Pass-Lifecycle
- `backend/supabase/migrations/2026-04-26_storage_and_rls.sql`: Buckets + RLS Policies für Frontend-Zugriff

## Lokal starten

```bash
python3 -m http.server 4173 --directory frontend
```

Dann öffnen: `http://localhost:4173`


## Supabase Credentials (Frontend)

Lege die Datei `frontend/supabase.credentials.json` mit folgenden Keys an:

```json
{
  "supabaseUrl": "https://<PROJECT>.supabase.co",
  "supabaseAnonKey": "<ANON_KEY>"
}
```
