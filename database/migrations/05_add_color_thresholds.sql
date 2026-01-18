-- =====================================================
-- RESVO - Migration: Add Color Thresholds
-- =====================================================
-- Aggiunge le soglie configurabili per le colorazioni
-- della capacità (verde, giallo, arancione, rosso)
-- =====================================================

-- Aggiungi colonne per le soglie di colore alla tabella restaurants
ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS green_threshold INTEGER NOT NULL DEFAULT 60,
ADD COLUMN IF NOT EXISTS yellow_threshold INTEGER NOT NULL DEFAULT 80,
ADD COLUMN IF NOT EXISTS orange_threshold INTEGER NOT NULL DEFAULT 99;

-- Aggiungi constraints per validare i valori delle soglie
ALTER TABLE public.restaurants
ADD CONSTRAINT green_threshold_range CHECK (green_threshold >= 0 AND green_threshold <= 100),
ADD CONSTRAINT yellow_threshold_range CHECK (yellow_threshold >= 0 AND yellow_threshold <= 100),
ADD CONSTRAINT orange_threshold_range CHECK (orange_threshold >= 0 AND orange_threshold <= 100),
ADD CONSTRAINT thresholds_order CHECK (green_threshold < yellow_threshold AND yellow_threshold < orange_threshold);

-- Commenti per documentazione
COMMENT ON COLUMN public.restaurants.green_threshold IS 'Soglia percentuale per il colore verde (0-100). Capacità sotto questa soglia sarà verde.';
COMMENT ON COLUMN public.restaurants.yellow_threshold IS 'Soglia percentuale per il colore giallo (0-100). Capacità tra green_threshold e yellow_threshold sarà gialla.';
COMMENT ON COLUMN public.restaurants.orange_threshold IS 'Soglia percentuale per il colore arancione (0-100). Capacità tra yellow_threshold e orange_threshold sarà arancione. Sopra questa soglia sarà rossa.';

-- Aggiorna i ristoranti esistenti con i valori di default
UPDATE public.restaurants
SET 
    green_threshold = 60,
    yellow_threshold = 80,
    orange_threshold = 99
WHERE green_threshold IS NULL OR yellow_threshold IS NULL OR orange_threshold IS NULL;
