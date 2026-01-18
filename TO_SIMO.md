# TO_SIMO.md - Operazioni Manuali

#### Test 3.5: Eliminazione Spazio (senza tavoli)
**Passi:**
1. Click "🗑️" su "Terrazza" (custom, senza tavoli)
2. Conferma eliminazione

**Risultato Atteso:**
- ✅ Toast verde "Spazio eliminato!"
- ✅ Spazio rimosso dalla lista

#### Test 3.6: Tentativo Eliminazione Spazio con Tavoli
**Passi:**
1. Crea uno spazio "Test"
2. Crea un tavolo assegnato a "Test"
3. Click "🗑️" su spazio "Test"

**Risultato Atteso:**
- ✅ Toast rosso: "Impossibile eliminare lo spazio: ci sono X tavoli"
- ✅ Spazio NON eliminato
- ✅ Prima devi spostare/eliminare i tavoli

---

### ✅ FASE 4: Gestione Tavoli (COMPLETATA)

**Prerequisito**: Login + `/settings/restaurant` → Tab "Tavoli"

#### Test 4.1: Visualizzazione Tavoli Iniziali
**Passi:**
1. Guarda la sezione "Gestione Tavoli"

**Risultato Atteso:**
- ✅ Vedi 10 tavoli creati dal seed data
- ✅ Raggruppati per posizione (Interno, Esterno, Veranda)
- ✅ Statistiche in alto:
  - Tavoli Totali: 10
  - Posti Totali: somma capacità
  - Tavoli Attivi: 10

#### Test 4.2: Creazione Nuovo Tavolo
**Passi:**
1. Click "Aggiungi Tavolo"
2. Numero Tavolo: "11"
3. Capacità: 4
4. Posizione: "Interno"
5. Click "Crea Tavolo"

**Risultato Atteso:**
- ✅ Toast verde "Tavolo aggiunto!"
- ✅ Tavolo 11 appare nella sezione "Interno"
- ✅ Statistiche aggiornate (Tavoli Totali: 11)

#### Test 4.3: Modifica Tavolo
**Passi:**
1. Click "✏️" su tavolo esistente
2. Cambia capacità da 2 a 4
3. Cambia posizione da "Interno" a "Esterno"
4. Click "Aggiorna Tavolo"

**Risultato Atteso:**
- ✅ Toast verde "Tavolo aggiornato!"
- ✅ Tavolo spostato nella sezione corretta
- ✅ Capacità visibile aggiornata

#### Test 4.4: Eliminazione Tavolo
**Passi:**
1. Click "🗑️" su un tavolo
2. Conferma

**Risultato Atteso:**
- ✅ Toast verde "Tavolo eliminato"
- ✅ Tavolo rimosso dalla lista
- ✅ Statistiche aggiornate

---

### ✅ FASE 4: Reservations Service (COMPLETATA)

**Prerequisito**: Avere il database Supabase collegato.

#### Test 4.1: Verifica Service
**Passi:**
1. Il servizio `reservations.service.ts` è attivo e integrato.
2. Le chiamate CRUD (Create, Read, Update, Delete) sono funzionanti.

---

### ✅ FASE 5: Calendario e Lista Prenotazioni (COMPLETATA)

**Prerequisito**: Login + `/reservations` o Dashboard (Home)

#### Test 5.1: Lista Prenotazioni
**Passi:**
1. Vai su `/reservations`
2. Verifica che la lista mostri le prenotazioni dal DB
3. Prova i filtri (Servizio, Stato, Ricerca)

#### Test 5.2: Calendario (Day View)
**Passi:**
1. Seleziona un giorno nel calendario o clicca "Giorno"
2. Verifica che le prenotazioni appaiano negli slot corretti
3. Verifica che i contatori (coperti, occupazione) siano reali

---
