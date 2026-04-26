# EL Passkit MVP

Apple-ähnlicher Wallet-Karten-Editor mit Supabase-orientierter Projektstruktur.

## Struktur

- `frontend/`: Dashboard, Editor, Live-Vorschau, pass.json-Export
- `backend/supabase/migrations/database.sql`: Tabellen für Kunden, Templates, Passes, Geräte-Registrierungen
- `backend/supabase/functions/*`: Edge-Function-Stubs für Pass-Lifecycle

## Lokal starten

Da es ein statisches Frontend ist, reicht ein beliebiger Static-Server, z. B.:

```bash
python3 -m http.server 4173 --directory frontend
```

Dann öffnen: `http://localhost:4173`
