# EL Passkit MVP (Designer Edition)

Apple-Wallet-orientierter Karten-Designer mit Supabase-Backend, EL-Promillo-Logik (Punkte/Status) und pass.json-Export.

## Was jetzt enthalten ist

- Vollständiger Pass-Designer für `storeCard`, `coupon`, `eventTicket`, `generic`, `boardingPass`
- Felder pro Passkit-Sektion (`primary`, `secondary`, `auxiliary`, `back`) als JSON-Arrays
- Erweiterte Pass-Optionen (`barcodeMessage`, `suppressStripShine`, `sharingProhibited`, `locations`, `beacons`)
- Live-Vorschau mit Kunden-/Template-Kombination
- Ausgabe von Pässen inkl. Seriennummer/Ablaufdatum
- Übersicht ausgegebener Pässe
- Zentrale Passkit-Parameter (`passTypeIdentifier`, `teamIdentifier`, Organisation etc.)

## Projektstruktur

- `frontend/`: UI und Designer
- `frontend/js/app.js`: Orchestrierung, Form-Handling, Exporte
- `frontend/js/ui.js`: Rendering + JSON-Parsing der Designer-Felder
- `frontend/js/walletEditor.js`: pass.json-Build nach Passkit-Schema
- `backend/supabase/migrations/`: SQL-Migrationen

## Schnellstart (morgen früh direkt nutzbar)

1. **Supabase SQL ausführen (in dieser Reihenfolge):**
   - `backend/supabase/migrations/database.sql`
   - `backend/supabase/migrations/2026-04-26_promillo_extension.sql`
   - `backend/supabase/migrations/2026-04-26_storage_and_rls.sql`
   - `backend/supabase/migrations/2026-04-26_passkit_settings.sql`
   - `backend/supabase/migrations/2026-04-26_designer_template_fields.sql`

2. **Frontend Credentials anlegen:**

```json
{
  "supabaseUrl": "https://<PROJECT>.supabase.co",
  "supabaseAnonKey": "<ANON_KEY>"
}
```

Datei: `frontend/supabase.credentials.json`

3. **Lokal starten:**

```bash
python3 -m http.server 4173 --directory frontend
```

Dann: `http://localhost:4173`

## GitHub / Deploy Vorbereitung (Checkliste)

- Secrets für CI/CD vorbereiten:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (nur Server/CI, nie im Frontend)
- Branch Protection aktivieren (mind. 1 Review + required checks)
- Optional: GitHub Action ergänzen, die SQL-Migrationen gegen Staging validiert

## Hinweise zu EL_Promillo-Anforderungen

- Punkte-/Status-Logik ist über `customers` + `point_transactions` integriert.
- Designer erlaubt Platzhalterwerte im JSON (`{{fullName}}`, `{{points}}`, `{{status}}`) als redaktionelle Vorlagenwerte.
- Für echte `.pkpass`-Signierung müssen Zertifikate und die Edge-Functions (`backend/supabase/functions/*`) produktiv erweitert werden.
