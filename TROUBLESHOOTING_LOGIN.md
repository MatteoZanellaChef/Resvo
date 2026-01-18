# Troubleshooting Login - Steps da Seguire

## ❌ Problema: 400 Bad Request durante login

**Errore:**
```
POST https://faymgrntmzzrpbyqzxxn.supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)
```

---

## 🔍 STEP 1: Verifica Utente su Supabase

### A. Controlla se l'utente esiste:

1. **Vai su Supabase Dashboard**
2. **Authentication → Users**
3. **Cerca l'email**: `alcervorabbi@gmail.com`

**Cosa controllare**:
- [ ] L'utente esiste?
- [ ] Status è "Confirmed" (verde) o "Waiting for verification" (giallo)?
- [ ] C'è una colonna "Email Confirmed" = true?

---

## ✅ SOLUZIONE A: L'utente NON esiste

Se non vedi l'utente nella lista:

### Opzione 1: Crea utente da Dashboard (CONSIGLIATO)

1. **Authentication → Users → Add User**
2. **Email**: `alcervorabbi@gmail.com`
3. **Password**: Scegli una password (ricordala!)
4. **✅ IMPORTANTE**: Seleziona "Auto Confirm User" (così eviti la verifica email)
5. Click "Create User"

### Opzione 2: Abilita temporaneamente signup

1. **Authentication → Providers → Email**
2. **Enable sign ups**: Toggle ON
3. Vai su `http://localhost:3000/login`
4. Prova a fare signup (se c'è un form)
5. Poi disabilita signup di nuovo

---

## ✅ SOLUZIONE B: L'utente esiste ma NON è confermato

Se vedi l'utente ma status è "Waiting for verification":

### Forza conferma manuale:

1. **Authentication → Users**
2. Click sui 3 puntini (...) sull'utente
3. Click "Confirm Email"
4. Ora status diventa "Confirmed"
5. Riprova il login

---

## ✅ SOLUZIONE C: L'utente esiste ed è confermato, ma password sbagliata

### Reset password:

1. **Authentication → Users**
2. Click sui 3 puntini (...) sull'utente
3. Click "Send Password Reset Email"
4. **OPPURE** click "Set Password" per cambiarla direttamente
5. Imposta nuova password
6. Riprova login con nuova password

---

## 🔧 SOLUZIONE D: Verifica variabili d'ambiente

Controlla che `.env.local` abbia i valori corretti:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://faymgrntmzzrpbyqzxxn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (tua anon key)
AUTHORIZED_EMAIL=alcervorabbi@gmail.com
```

**IMPORTANTE**: Dopo aver modificato `.env.local`:
1. **Ferma il server** (Ctrl+C)
2. **Riavvia** con `npm run dev`
3. **Ricarica la pagina** nel browser (Cmd+Shift+R)

---

## 🧪 Test dopo ogni soluzione

1. Vai su `http://localhost:3000/login`
2. Inserisci email: `alcervorabbi@gmail.com`
3. Inserisci password corretta
4. Click "Accedi"
5. Dovresti essere redirectato alla dashboard

---

## 📝 Quali informazioni mi servono

Dopo aver controllato, dimmi:

1. **L'utente esiste su Supabase?** SI / NO
2. **Se sì, qual è lo status?** Confirmed / Waiting for verification / altro
3. **Hai creato/confermato l'utente?** SI / NO
4. **Hai provato a fare login dopo?** SI / NO
5. **Stesso errore o errore diverso?**

---

## 🆘 Se nulla funziona

Posso creare un **form di signup temporaneo** per registrarti via app, così siamo sicuri che tutto funzioni.
