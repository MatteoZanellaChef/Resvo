# 🗄️ Database Resvo - Documentazione

## 📁 Struttura File SQL

Questa cartella contiene tutti gli script SQL necessari per configurare il database Supabase per l'applicazione **Resvo** (sistema di gestione prenotazioni ristorante).

### File da Eseguire in Ordine

| # | File | Descrizione | Dipendenze |
|---|------|-------------|------------|
| 1 | `01_schema.sql` | Schema completo del database (tabelle, indici, constraints) | Nessuna |
| 2 | `02_rls_policies.sql` | Row Level Security policies per sicurezza multiutente | 01_schema.sql |
| 3 | `03_triggers_functions.sql` | Triggers e funzioni utility per automazione | 01_schema.sql |
| 4 | `04_seed_data.sql` | Dati iniziali (ristorante, spazi, tavoli) | Tutti i precedenti + autenticazione utente |

---

## 📊 Schema Database

### Diagramma ER

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
│  - id (PK)      │
│  - email        │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│  restaurants    │
│  - id (PK)      │──┐
│  - user_id (FK) │  │
│  - name         │  │
│  - capacità     │  │ 1:N
│  - orari        │  │
└─────────────────┘  │
                     │
         ┌───────────┴───────────────┬──────────────┐
         │                           │              │
         │ 1:N                       │ 1:N          │ 1:N
         ▼                           ▼              ▼
┌─────────────────┐     ┌──────────────────┐  ┌─────────────────┐
│  room_spaces    │     │     tables       │  │  reservations   │
│  - id (PK)      │     │  - id (PK)       │  │  - id (PK)      │
│  - restaurant_id│◄────│  - restaurant_id │  │  - restaurant_id│
│  - value        │ 1:N │  - table_number  │  │  - data/ora     │
│  - label        │     │  - capacity      │  │  - num_guests   │
│  - is_default   │     │  - position (FK) │  │  - table_id (FK)│
└─────────────────┘     │  - is_active     │  │  - status       │
                        └──────────┬───────┘  │  - cliente      │
                                   │          └─────────────────┘
                                   │ N:1
                                   │
                                   │
                        ┌──────────▼───────┐
                        │  daily_stats     │
                        │  - id (PK)       │
                        │  - restaurant_id │
                        │  - date          │
                        │  - service_type  │
                        │  - statistiche   │
                        └──────────────────┘
```

---

## 📋 Tabelle

### 1. `restaurants`
Informazioni del ristorante.

**Campi principali:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `name` (VARCHAR)
- `max_capacity_lunch` (INTEGER)
- `max_capacity_dinner` (INTEGER)
- `default_table_duration` (INTEGER, minuti)
- `opening_hours` (JSONB)

**Struttura opening_hours:**
```json
{
  "Lunedì": {
    "lunch": { "start": "12:00", "end": "15:00" },
    "dinner": { "start": "19:00", "end": "23:00" }
  },
  "Mercoledì": {
    "closed": true
  }
}
```

### 2. `room_spaces`
Spazi/sale del ristorante (interno, esterno, veranda, personalizzati).

**Campi principali:**
- `id` (UUID, PK)
- `restaurant_id` (UUID, FK → restaurants)
- `value` (VARCHAR, identificatore univoco)
- `label` (VARCHAR, nome visualizzato)
- `is_default` (BOOLEAN)
- `display_order` (INTEGER)

**Spazi predefiniti:**
- `interno` → "Interno"
- `esterno` → "Esterno"
- `veranda` → "Veranda"

### 3. `tables`
Tavoli del ristorante.

**Campi principali:**
- `id` (UUID, PK)
- `restaurant_id` (UUID, FK → restaurants)
- `table_number` (VARCHAR)
- `capacity` (INTEGER)
- `position` (VARCHAR, deve corrispondere a `room_spaces.value`)
- `is_active` (BOOLEAN)

**Validazione:**
- Trigger verifica che `position` esista in `room_spaces`

### 4. `reservations`
Prenotazioni dei clienti.

**Campi principali:**
- `id` (UUID, PK)
- `restaurant_id` (UUID, FK → restaurants)
- `reservation_date` (DATE)
- `reservation_time` (TIME)
- `service_type` (VARCHAR: 'lunch' | 'dinner')
- `num_guests` (INTEGER)
- `customer_name` (VARCHAR)
- `customer_phone` (VARCHAR)
- `customer_email` (VARCHAR, opzionale)
- `table_id` (UUID, FK → tables, opzionale)
- `status` (VARCHAR: 'confirmed' | 'pending' | 'cancelled' | 'completed')
- `notes` (TEXT, opzionale)
- `special_requests` (TEXT, opzionale)

**Indici ottimizzati per:**
- Ricerca per data e servizio
- Ricerca per cliente (nome, telefono, email)
- Filtraggio per stato
- Join con tavoli

### 5. `daily_stats` (Opzionale)
Statistiche giornaliere pre-calcolate per migliorare le performance.

**Campi principali:**
- `id` (UUID, PK)
- `restaurant_id` (UUID, FK → restaurants)
- `stat_date` (DATE)
- `service_type` (VARCHAR)
- `total_reservations` (INTEGER)
- `total_guests` (INTEGER)
- `capacity_percentage` (DECIMAL)
- `no_shows` (INTEGER)

---

## 🔒 Row Level Security (RLS)

**Tutte le tabelle hanno RLS attivo** per garantire che ogni utente veda solo i dati del proprio ristorante.

### Policy Pattern

Per ogni tabella, le policies sono:

1. **SELECT**: Può vedere solo i record del proprio ristorante
2. **INSERT**: Può inserire solo per il proprio ristorante
3. **UPDATE**: Può modificare solo i record del proprio ristorante
4. **DELETE**: Può eliminare solo i record del proprio ristorante

**Verifica utente:**
```sql
EXISTS (
  SELECT 1 FROM public.restaurants
  WHERE restaurants.id = [table].restaurant_id
  AND restaurants.user_id = auth.uid()
)
```

---

## ⚙️ Triggers e Funzioni

### Triggers Automatici

1. **Auto-update `updated_at`**
   - Trigger su tutte le tabelle
   - Aggiorna automaticamente il campo `updated_at` ad ogni modifica

2. **Validazione posizione tavolo**
   - Verifica che `tables.position` corrisponda a un `room_spaces.value` esistente
   - Impedisce inserimento/modifica con posizioni non valide

3. **Protezione spazi predefiniti**
   - Impedisce eliminazione di spazi con `is_default = true`

4. **Controllo tavoli prima eliminazione spazio**
   - Impedisce eliminazione di uno spazio se ci sono tavoli assegnati

### Funzioni Utility

#### 1. `calculate_daily_stats(restaurant_id, date, service_type)`
Calcola e aggiorna le statistiche giornaliere.

**Parametri:**
- `p_restaurant_id` (UUID)
- `p_date` (DATE)
- `p_service_type` ('lunch' | 'dinner')

**Cosa fa:**
- Conta prenotazioni totali
- Somma coperti totali
- Calcola percentuale capacità
- Conta no-shows (cancellazioni)

#### 2. `get_available_tables(restaurant_id, date, time, service_type, duration)`
Restituisce i tavoli disponibili per una data/ora specifica.

**Parametri:**
- `p_restaurant_id` (UUID)
- `p_date` (DATE)
- `p_time` (TIME)
- `p_service_type` ('lunch' | 'dinner')
- `p_duration_minutes` (INTEGER, default 120)

**Ritorna:**
- Lista di tavoli non prenotati nell'orario richiesto
- Ordinati per capacità crescente

---

## 📈 Performance & Ottimizzazioni

### Indici Critici

**reservations:**
- `idx_reservations_date` - Query per calendario
- `idx_reservations_date_service` - Filtro pranzo/cena
- `idx_reservations_customer_name_trgm` - Ricerca full-text clienti

**tables:**
- `idx_tables_position` - Group by posizione
- `idx_tables_active` - Filtro tavoli attivi

### Query Ottimizzate

1. **Prenotazioni per giorno + servizio**: O(1) grazie a indice composito
2. **Ricerca clienti**: Full-text search con GIN index
3. **Statistiche aggregate**: Possibile uso di `daily_stats` come cache

---

## 🔧 Manutenzione

### Backup Consigliati

- **Automatici**: Supabase fa backup giornalieri
- **Manuali**: Esporta dati prima di modifiche strutturali

### Monitoring

Query da monitorare per performance:
1. Statistiche aggregate (JOIN pesanti)
2. Ricerca full-text su clienti
3. Calcolo disponibilità tavoli

### Cleanup Periodico

Considera di:
- Archiviare prenotazioni vecchie (> 1 anno)
- Eliminare statistiche molto vecchie se non necessarie
- Vacuum periodico su tabelle con molte write

---

## 📞 Supporto

Per domande o problemi:
1. Controlla la sezione Troubleshooting in `TO_SIMO.md`
2. Verifica i log di Supabase
3. Controlla le RLS policies se i dati non sono visibili
