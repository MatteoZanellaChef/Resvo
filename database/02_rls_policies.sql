-- =====================================================
-- RESVO - Row Level Security (RLS) Policies
-- =====================================================
-- Questo file configura le politiche di sicurezza per garantire
-- che ogni utente possa accedere solo ai dati del proprio ristorante
-- =====================================================

-- =====================================================
-- Abilita RLS su tutte le tabelle
-- =====================================================
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES per RESTAURANTS
-- =====================================================

-- Lettura: l'utente può vedere solo i propri ristoranti
CREATE POLICY "Users can view their own restaurants"
    ON public.restaurants
    FOR SELECT
    USING (auth.uid() = user_id);

-- Inserimento: l'utente può creare ristoranti associati al proprio account
CREATE POLICY "Users can insert their own restaurants"
    ON public.restaurants
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Aggiornamento: l'utente può modificare solo i propri ristoranti
CREATE POLICY "Users can update their own restaurants"
    ON public.restaurants
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Eliminazione: l'utente può eliminare solo i propri ristoranti
CREATE POLICY "Users can delete their own restaurants"
    ON public.restaurants
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- POLICIES per ROOM_SPACES
-- =====================================================

-- Lettura: l'utente può vedere gli spazi dei propri ristoranti
CREATE POLICY "Users can view spaces of their restaurants"
    ON public.room_spaces
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = room_spaces.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- Inserimento: l'utente può creare spazi per i propri ristoranti
CREATE POLICY "Users can insert spaces for their restaurants"
    ON public.room_spaces
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = room_spaces.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- Aggiornamento: l'utente può modificare spazi dei propri ristoranti
CREATE POLICY "Users can update spaces of their restaurants"
    ON public.room_spaces
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = room_spaces.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = room_spaces.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- Eliminazione: l'utente può eliminare spazi dei propri ristoranti
CREATE POLICY "Users can delete spaces of their restaurants"
    ON public.room_spaces
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = room_spaces.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- =====================================================
-- POLICIES per TABLES
-- =====================================================

-- Lettura: l'utente può vedere i tavoli dei propri ristoranti
CREATE POLICY "Users can view tables of their restaurants"
    ON public.tables
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = tables.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- Inserimento: l'utente può creare tavoli per i propri ristoranti
CREATE POLICY "Users can insert tables for their restaurants"
    ON public.tables
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = tables.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- Aggiornamento: l'utente può modificare tavoli dei propri ristoranti
CREATE POLICY "Users can update tables of their restaurants"
    ON public.tables
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = tables.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = tables.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- Eliminazione: l'utente può eliminare tavoli dei propri ristoranti
CREATE POLICY "Users can delete tables of their restaurants"
    ON public.tables
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = tables.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- =====================================================
-- POLICIES per RESERVATIONS
-- =====================================================

-- Lettura: l'utente può vedere le prenotazioni dei propri ristoranti
CREATE POLICY "Users can view reservations of their restaurants"
    ON public.reservations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = reservations.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- Inserimento: l'utente può creare prenotazioni per i propri ristoranti
CREATE POLICY "Users can insert reservations for their restaurants"
    ON public.reservations
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = reservations.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- Aggiornamento: l'utente può modificare prenotazioni dei propri ristoranti
CREATE POLICY "Users can update reservations of their restaurants"
    ON public.reservations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = reservations.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = reservations.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- Eliminazione: l'utente può eliminare prenotazioni dei propri ristoranti
CREATE POLICY "Users can delete reservations of their restaurants"
    ON public.reservations
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = reservations.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- =====================================================
-- POLICIES per DAILY_STATS
-- =====================================================

-- Lettura: l'utente può vedere le statistiche dei propri ristoranti
CREATE POLICY "Users can view stats of their restaurants"
    ON public.daily_stats
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = daily_stats.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- Inserimento: l'utente può creare statistiche per i propri ristoranti
CREATE POLICY "Users can insert stats for their restaurants"
    ON public.daily_stats
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = daily_stats.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- Aggiornamento: l'utente può modificare statistiche dei propri ristoranti
CREATE POLICY "Users can update stats of their restaurants"
    ON public.daily_stats
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = daily_stats.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = daily_stats.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );

-- Eliminazione: l'utente può eliminare statistiche dei propri ristoranti
CREATE POLICY "Users can delete stats of their restaurants"
    ON public.daily_stats
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants
            WHERE restaurants.id = daily_stats.restaurant_id
            AND restaurants.user_id = auth.uid()
        )
    );
