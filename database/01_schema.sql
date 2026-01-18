-- =====================================================
-- RESVO - Database Schema per Supabase
-- =====================================================
-- Questo file crea tutte le tabelle necessarie per il sistema
-- di gestione prenotazioni ristorante
-- =====================================================

-- Abilita le estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Per ricerca full-text fuzzy

-- =====================================================
-- TABELLA: restaurants
-- Informazioni del ristorante
-- =====================================================
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    max_capacity_lunch INTEGER NOT NULL DEFAULT 80,
    max_capacity_dinner INTEGER NOT NULL DEFAULT 100,
    default_table_duration INTEGER NOT NULL DEFAULT 120, -- in minuti
    opening_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT max_capacity_lunch_positive CHECK (max_capacity_lunch > 0),
    CONSTRAINT max_capacity_dinner_positive CHECK (max_capacity_dinner > 0),
    CONSTRAINT default_table_duration_positive CHECK (default_table_duration > 0)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON public.restaurants(user_id);

-- Commenti
COMMENT ON TABLE public.restaurants IS 'Informazioni generali del ristorante';
COMMENT ON COLUMN public.restaurants.opening_hours IS 'Orari di apertura in formato JSON: { "Lunedì": { "lunch": { "start": "12:00", "end": "15:00" }, "dinner": { "start": "19:00", "end": "23:00" } } }';

-- =====================================================
-- TABELLA: room_spaces
-- Spazi/Sale del ristorante (interno, esterno, veranda, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.room_spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    value VARCHAR(100) NOT NULL, -- identificatore univoco (es: 'interno', 'sala-principale')
    label VARCHAR(255) NOT NULL, -- nome visualizzato (es: 'Interno', 'Sala Principale')
    is_default BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_space_value_per_restaurant UNIQUE (restaurant_id, value)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_room_spaces_restaurant_id ON public.room_spaces(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_room_spaces_display_order ON public.room_spaces(restaurant_id, display_order);

-- Commenti
COMMENT ON TABLE public.room_spaces IS 'Spazi e sale del ristorante';
COMMENT ON COLUMN public.room_spaces.value IS 'Identificatore univoco dello spazio (slug)';
COMMENT ON COLUMN public.room_spaces.label IS 'Nome visualizzato dello spazio';
COMMENT ON COLUMN public.room_spaces.is_default IS 'Indica se è uno spazio predefinito (non eliminabile)';

-- =====================================================
-- TABELLA: tables
-- Tavoli del ristorante
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    position VARCHAR(100) NOT NULL, -- deve corrispondere a room_spaces.value
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT capacity_positive CHECK (capacity > 0),
    CONSTRAINT unique_table_number_per_restaurant UNIQUE (restaurant_id, table_number)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_tables_restaurant_id ON public.tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tables_position ON public.tables(restaurant_id, position);
CREATE INDEX IF NOT EXISTS idx_tables_active ON public.tables(restaurant_id, is_active);

-- Commenti
COMMENT ON TABLE public.tables IS 'Tavoli del ristorante';
COMMENT ON COLUMN public.tables.position IS 'Posizione/spazio del tavolo (deve corrispondere a room_spaces.value)';

-- =====================================================
-- TABELLA: reservations
-- Prenotazioni
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    
    -- Informazioni prenotazione
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('lunch', 'dinner')),
    num_guests INTEGER NOT NULL,
    
    -- Informazioni cliente
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    
    -- Tavolo assegnato
    table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
    
    -- Stato e note
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed')),
    notes TEXT,
    special_requests TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT num_guests_positive CHECK (num_guests > 0)
);

-- Indici per performance (MOLTO IMPORTANTI per le query)
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON public.reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(restaurant_id, reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_date_service ON public.reservations(restaurant_id, reservation_date, service_type);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_table_id ON public.reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_phone ON public.reservations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_email ON public.reservations(customer_email) WHERE customer_email IS NOT NULL;

-- Indice per ricerca full-text sul nome cliente
CREATE INDEX IF NOT EXISTS idx_reservations_customer_name_trgm ON public.reservations USING gin(customer_name gin_trgm_ops);

-- Commenti
COMMENT ON TABLE public.reservations IS 'Prenotazioni del ristorante';
COMMENT ON COLUMN public.reservations.service_type IS 'Tipo di servizio: lunch (pranzo) o dinner (cena)';
COMMENT ON COLUMN public.reservations.status IS 'Stato: pending (in attesa), confirmed (confermata), cancelled (cancellata), completed (completata)';

-- =====================================================
-- TABELLA: daily_stats (Opzionale - per performance)
-- Statistiche giornaliere pre-calcolate
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('lunch', 'dinner')),
    
    total_reservations INTEGER NOT NULL DEFAULT 0,
    total_guests INTEGER NOT NULL DEFAULT 0,
    capacity_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    no_shows INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint per evitare duplicati
    CONSTRAINT unique_daily_stat UNIQUE (restaurant_id, stat_date, service_type)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_daily_stats_restaurant_date ON public.daily_stats(restaurant_id, stat_date);

-- Commenti
COMMENT ON TABLE public.daily_stats IS 'Statistiche giornaliere pre-calcolate (opzionale, per migliorare performance)';
