-- =====================================================
-- RESVO - Triggers e Functions
-- =====================================================
-- Questo file contiene trigger e funzioni utility per automazione
-- =====================================================

-- =====================================================
-- FUNCTION: update_updated_at_column
-- Aggiorna automaticamente il campo updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Commento
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Aggiorna automaticamente il timestamp updated_at quando un record viene modificato';

-- =====================================================
-- TRIGGERS per updated_at
-- Applica la funzione a tutte le tabelle con updated_at
-- =====================================================

CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_spaces_updated_at
    BEFORE UPDATE ON public.room_spaces
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tables_updated_at
    BEFORE UPDATE ON public.tables
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at
    BEFORE UPDATE ON public.daily_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- FUNCTION: validate_table_position
-- Valida che la posizione del tavolo esista negli spazi
-- =====================================================
CREATE OR REPLACE FUNCTION public.validate_table_position()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica che il valore position esista in room_spaces per questo ristorante
    IF NOT EXISTS (
        SELECT 1 FROM public.room_spaces
        WHERE room_spaces.restaurant_id = NEW.restaurant_id
        AND room_spaces.value = NEW.position
    ) THEN
        RAISE EXCEPTION 'La posizione specificata "%" non esiste per questo ristorante', NEW.position;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.validate_table_position() IS 'Valida che la posizione del tavolo corrisponda a uno spazio esistente';

-- Trigger per validazione posizione tavolo
CREATE TRIGGER validate_table_position_trigger
    BEFORE INSERT OR UPDATE ON public.tables
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_table_position();

-- =====================================================
-- FUNCTION: prevent_default_space_deletion
-- Impedisce l'eliminazione di spazi predefiniti
-- =====================================================
CREATE OR REPLACE FUNCTION public.prevent_default_space_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_default = true THEN
        RAISE EXCEPTION 'Non è possibile eliminare uno spazio predefinito';
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.prevent_default_space_deletion() IS 'Impedisce l eliminazione di spazi marcati come predefiniti';

-- Trigger per prevenire eliminazione spazi predefiniti
CREATE TRIGGER prevent_default_space_deletion_trigger
    BEFORE DELETE ON public.room_spaces
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_default_space_deletion();

-- =====================================================
-- FUNCTION: check_space_has_no_tables
-- Impedisce l'eliminazione di spazi che hanno tavoli assegnati
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_space_has_no_tables()
RETURNS TRIGGER AS $$
DECLARE
    table_count INTEGER;
BEGIN
    -- Conta i tavoli con questa posizione
    SELECT COUNT(*) INTO table_count
    FROM public.tables
    WHERE tables.restaurant_id = OLD.restaurant_id
    AND tables.position = OLD.value;
    
    IF table_count > 0 THEN
        RAISE EXCEPTION 'Impossibile eliminare lo spazio: ci sono % tavol% assegnati a questo spazio', 
            table_count, 
            CASE WHEN table_count = 1 THEN 'o' ELSE 'i' END;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.check_space_has_no_tables() IS 'Impedisce l eliminazione di spazi che hanno tavoli assegnati';

-- Trigger per controllo tavoli prima di eliminare spazio
CREATE TRIGGER check_space_has_no_tables_trigger
    BEFORE DELETE ON public.room_spaces
    FOR EACH ROW
    EXECUTE FUNCTION public.check_space_has_no_tables();

-- =====================================================
-- FUNCTION: calculate_daily_stats
-- Calcola e aggiorna le statistiche giornaliere
-- =====================================================
CREATE OR REPLACE FUNCTION public.calculate_daily_stats(
    p_restaurant_id UUID,
    p_date DATE,
    p_service_type VARCHAR(20)
)
RETURNS void AS $$
DECLARE
    v_total_reservations INTEGER;
    v_total_guests INTEGER;
    v_capacity INTEGER;
    v_capacity_percentage DECIMAL(5,2);
    v_no_shows INTEGER;
BEGIN
    -- Ottieni la capacità massima
    SELECT CASE 
        WHEN p_service_type = 'lunch' THEN max_capacity_lunch
        ELSE max_capacity_dinner
    END INTO v_capacity
    FROM public.restaurants
    WHERE id = p_restaurant_id;
    
    -- Calcola statistiche dalle prenotazioni
    SELECT 
        COUNT(*),
        COALESCE(SUM(num_guests), 0),
        COUNT(*) FILTER (WHERE status = 'cancelled')
    INTO 
        v_total_reservations,
        v_total_guests,
        v_no_shows
    FROM public.reservations
    WHERE restaurant_id = p_restaurant_id
    AND reservation_date = p_date
    AND service_type = p_service_type;
    
    -- Calcola percentuale capacità
    v_capacity_percentage := (v_total_guests::DECIMAL / v_capacity::DECIMAL) * 100;
    
    -- Inserisci o aggiorna statistiche
    INSERT INTO public.daily_stats (
        restaurant_id,
        stat_date,
        service_type,
        total_reservations,
        total_guests,
        capacity_percentage,
        no_shows
    ) VALUES (
        p_restaurant_id,
        p_date,
        p_service_type,
        v_total_reservations,
        v_total_guests,
        v_capacity_percentage,
        v_no_shows
    )
    ON CONFLICT (restaurant_id, stat_date, service_type)
    DO UPDATE SET
        total_reservations = EXCLUDED.total_reservations,
        total_guests = EXCLUDED.total_guests,
        capacity_percentage = EXCLUDED.capacity_percentage,
        no_shows = EXCLUDED.no_shows,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.calculate_daily_stats(UUID, DATE, VARCHAR) IS 'Calcola e aggiorna le statistiche giornaliere per un ristorante';

-- =====================================================
-- FUNCTION: get_available_tables
-- Ottiene i tavoli disponibili per una data/ora
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_available_tables(
    p_restaurant_id UUID,
    p_date DATE,
    p_time TIME,
    p_service_type VARCHAR(20),
    p_duration_minutes INTEGER DEFAULT 120
)
RETURNS TABLE (
    table_id UUID,
    table_number VARCHAR(50),
    capacity INTEGER,
    "position" VARCHAR(100)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.table_number,
        t.capacity,
        t.position
    FROM public.tables t
    WHERE t.restaurant_id = p_restaurant_id
    AND t.is_active = true
    AND NOT EXISTS (
        -- Verifica che non ci siano prenotazioni in conflitto
        SELECT 1 FROM public.reservations r
        WHERE r.table_id = t.id
        AND r.reservation_date = p_date
        AND r.service_type = p_service_type
        AND r.status NOT IN ('cancelled')
        AND (
            -- Sovrapposizione orari
            (r.reservation_time, r.reservation_time + (p_duration_minutes || ' minutes')::INTERVAL)
            OVERLAPS
            (p_time, p_time + (p_duration_minutes || ' minutes')::INTERVAL)
        )
    )
    ORDER BY t.capacity, t.table_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_available_tables IS 'Restituisce i tavoli disponibili per una data, ora e servizio specifici';
