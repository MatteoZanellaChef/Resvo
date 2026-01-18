-- =====================================================
-- RESVO - Dati Iniziali (Seed Data)
-- =====================================================
-- Questo file inserisce i dati iniziali per iniziare a usare
-- l'applicazione subito dopo la creazione del database
-- =====================================================
-- IMPORTANTE: Esegui questo file SOLO DOPO aver fatto login
-- con l'email autorizzata (alcervorabbi@gmail.com)
-- =====================================================

-- =====================================================
-- NOTA: Sostituisci 'YOUR_USER_ID' con il tuo user_id
-- =====================================================
-- Per ottenere il tuo user_id, puoi eseguire questa query:
-- SELECT id FROM auth.users WHERE email = 'alcervorabbi@gmail.com';
-- 
-- Oppure esegui questo script dopo login e usa la funzione auth.uid()
-- =====================================================

DO $$
DECLARE
    v_user_id UUID;
    v_restaurant_id UUID;
    v_space_interno_id UUID;
    v_space_esterno_id UUID;
    v_space_veranda_id UUID;
BEGIN
    -- Ottieni l'ID dell'utente corrente (funziona solo se sei loggato)
    v_user_id := auth.uid();
    
    -- Se non sei loggato, termina con errore
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Devi essere autenticato per eseguire questo script. Effettua il login con alcervorabbi@gmail.com';
    END IF;
    
    -- =====================================================
    -- 1. Crea il ristorante
    -- =====================================================
    INSERT INTO public.restaurants (
        user_id,
        name,
        max_capacity_lunch,
        max_capacity_dinner,
        default_table_duration,
        opening_hours
    ) VALUES (
        v_user_id,
        'Ristorante Demo',
        80,
        100,
        120,
        '{
            "Lunedì": {"lunch": {"start": "12:00", "end": "15:00"}, "dinner": {"start": "19:00", "end": "23:00"}},
            "Martedì": {"lunch": {"start": "12:00", "end": "15:00"}, "dinner": {"start": "19:00", "end": "23:00"}},
            "Mercoledì": {"closed": true},
            "Giovedì": {"lunch": {"start": "12:00", "end": "15:00"}, "dinner": {"start": "19:00", "end": "23:00"}},
            "Venerdì": {"lunch": {"start": "12:00", "end": "15:00"}, "dinner": {"start": "19:00", "end": "23:00"}},
            "Sabato": {"lunch": {"start": "12:00", "end": "15:00"}, "dinner": {"start": "19:00", "end": "23:00"}},
            "Domenica": {"lunch": {"start": "12:00", "end": "15:00"}, "dinner": {"start": "19:00", "end": "23:00"}}
        }'::jsonb
    ) RETURNING id INTO v_restaurant_id;
    
    RAISE NOTICE 'Ristorante creato con ID: %', v_restaurant_id;
    
    -- =====================================================
    -- 2. Crea gli spazi predefiniti
    -- =====================================================
    INSERT INTO public.room_spaces (restaurant_id, value, label, is_default, display_order)
    VALUES 
        (v_restaurant_id, 'interno', 'Interno', true, 1)
    RETURNING id INTO v_space_interno_id;
    
    INSERT INTO public.room_spaces (restaurant_id, value, label, is_default, display_order)
    VALUES 
        (v_restaurant_id, 'esterno', 'Esterno', true, 2)
    RETURNING id INTO v_space_esterno_id;
    
    INSERT INTO public.room_spaces (restaurant_id, value, label, is_default, display_order)
    VALUES 
        (v_restaurant_id, 'veranda', 'Veranda', true, 3)
    RETURNING id INTO v_space_veranda_id;
    
    RAISE NOTICE 'Spazi creati';
    
    -- =====================================================
    -- 3. Crea tavoli di esempio
    -- =====================================================
    INSERT INTO public.tables (restaurant_id, table_number, capacity, position, is_active) VALUES
        -- Interno
        (v_restaurant_id, '1', 2, 'interno', true),
        (v_restaurant_id, '2', 2, 'interno', true),
        (v_restaurant_id, '3', 4, 'interno', true),
        (v_restaurant_id, '4', 4, 'interno', true),
        (v_restaurant_id, '5', 6, 'interno', true),
        (v_restaurant_id, '6', 6, 'interno', true),
        -- Esterno
        (v_restaurant_id, '7', 4, 'esterno', true),
        (v_restaurant_id, '8', 4, 'esterno', true),
        -- Veranda
        (v_restaurant_id, '9', 8, 'veranda', true),
        (v_restaurant_id, '10', 8, 'veranda', true);
    
    RAISE NOTICE 'Tavoli creati: 10 tavoli';
    
    RAISE NOTICE 'Setup completato con successo!';
    RAISE NOTICE 'Restaurant ID: %', v_restaurant_id;
    
END $$;
