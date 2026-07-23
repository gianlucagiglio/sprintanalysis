# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Progetto

**RetroBoard** - Piattaforma italiana per retrospettive agili, team collaboration e gamification. Include:
- Retrospettive multi-fase (commenti, votazione, grouping, brainstorming, action plan)
- Mood tracking (personale e team)
- Quiz di team building
- Kanban board per action items
- Sistema di gamification (punti, livelli, badge)
- Leaderboard e metriche team

**Lingua UI**: Italiano (tutti i testi, messaggi, label devono essere in italiano)

## Stack Tecnologico

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + RLS)
- **State Management**: Zustand (authStore, sessionStore)
- **Styling**: Tailwind CSS con tema custom "retro"
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Charts**: Recharts
- **DnD**: @dnd-kit (drag and drop per Kanban/Grouping)
- **Animations**: Framer Motion

## Comandi Sviluppo

```bash
# Development server (porta 5178)
npm run dev

# Build di produzione (auto-increment patch version)
npm run build

# Lint
npm run lint

# Preview build
npm run preview

# Serve dist localmente (porta 10000)
npm start
```

## Environment Setup

Crea `.env` nella root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:5178
```

## Architettura Generale

### Backend: Supabase con RLS

**Database**: PostgreSQL con 17 migrations (vedi `supabase/migrations/`)
- **RLS Policies**: Tutte le tabelle hanno Row Level Security abilitata
- **Realtime**: WebSocket subscriptions per aggiornamenti live
- **Auth**: Supabase Auth con session persistence

**Tabelle principali**:
- `profiles` - Utenti (id, name, email, is_super_admin)
- `sessions` - Retrospettive (current_step: 0-5, retro_phase, mood_phase)
- `session_participants` - Partecipanti sessioni (role, is_done, can_group)
- `sections` - Sezioni retrospettiva (Positivo/Negativo/Neutro)
- `comments` - Commenti utenti (group_id, sentiment, discussion_status)
- `votes` - Voti su commenti
- `actions` - Action items (assigned_to_multi, status, deadline)
- `mood_votes` - Voti mood personale (glad/sad/mad/custom)
- `team_mood_votes` - Voti mood team (ottima/buona/sufficiente/scarsa)
- `teams` + `team_members` - Gestione team
- `quiz_questions` + `quiz_answers` - Sistema quiz
- `user_points` + `point_transactions` + `badge_definitions` + `user_badges` - Gamification

**RPC Functions**:
- `add_user_points(user_id, team_id, action_type, points, session_id, action_id)` - Assegna punti (con deduplication)
- Database triggers per badge unlock automatico

### State Management: Zustand

**authStore** (`src/stores/authStore.ts`):
- User authentication state
- `initialize()` - Setup auth listener (chiamato una sola volta in App.tsx)
- `isSuperAdmin()` - Check admin privileges
- **IMPORTANTE**: Event listeners devono essere puliti con `resetAuthInitialization()`

**sessionStore** (`src/stores/sessionStore.ts`):
- Current session state (usato nei componenti interni alla sessione)

### Custom Hooks Pattern

**Pattern standard** per hooks di data fetching (`src/hooks/`):
1. **fetch function** con `useCallback`
2. **Initial fetch** con `useEffect(() => fetch(), [fetch])`
3. **Realtime subscription** con cleanup:
   ```typescript
   useEffect(() => {
     const channel = supabase.channel(...)
       .on('postgres_changes', {...}, () => fetch())
       .subscribe()
     return () => { supabase.removeChannel(channel) }
   }, [deps]) // NO fetch in deps to avoid infinite loop
   ```
4. **NO polling** - solo Realtime (polling rimosso per ridurre carico DB)

**Hooks principali**:
- `useSession(sessionId)` - Gestisce sessione, step, fasi
- `useComments(sessionId, sections)` - CRUD commenti + Realtime
- `useVotes(commentIds, sessionId, maxVotes)` - Sistema votazione
- `useActions(sessionId)` - Action items
- `useMood(sessionId)` - Mood voting personale
- `useTeamMood(sessionId)` - Mood voting team
- `useGamification(teamId)` - Sistema punti (`awardPoints(actionType, sessionId)`)
- `useBadges(userId, teamId)` - Badge utente
- `useTeams()` - Gestione team

**CRITICAL: Race Condition Prevention**:
- **Votes/Mood**: Dopo insert/upsert, verificare stato con query fresca DB prima di assegnare punti
- **Points**: Controllare `point_transactions` esistenti prima di chiamare `awardPoints()`
- Non fare check su stato locale React prima di operazioni DB (usa query fresche)

### Session Workflow

**Steps** (session.current_step):
- `0` - **Mood Voting** (personal → team)
- `1` - **Quiz** (se quiz_theme_id non null)
- `2` - **Retrospettiva** (comments → grouping → voting → brainstorming)
- `3` - **Action Plan** (Kanban board)
- `4` - **Review** (summary page)
- `5` - **Closed** (sessione conclusa, read-only)

**Retro Phases** (session.retro_phase quando current_step=2):
1. `comments` - Aggiunta commenti per sezione
2. `grouping` - Raggruppamento commenti simili
3. `voting` - Votazione commenti (max N voti per utente)
4. `brainstorming` - Discussione e creazione action items

**Mood Phases** (session.mood_phase quando current_step=0):
1. `personal` - Glad/Sad/Mad/Custom
2. `team` - Ottima/Buona/Sufficiente/Scarsa

### Gamification System

**Punti assegnati per**:
- `comment` - Aggiunta commento (+5)
- `vote` - Voto su commento (+5)
- `mood_vote` - Voto mood (+5)
- `action_create` - Creazione action (+10)
- `action_complete` - Completamento action (+20)
- `quiz_answer` - Risposta quiz (variabile: 1000 base - time_penalty)

**Badge System**:
- Badge definitions in `badge_definitions` table (criteri in JSON)
- Trigger DB automatico per unlock: `check_and_unlock_badges(user_id, team_id)`
- UI: BadgeUnlockedToast (globale) + BadgeShowcase (profilo)

**Leaderboard**:
- Per team (`user_points.team_id`)
- Global (tutti gli utenti)

## Patterns & Best Practices

### Database Queries

**Anti-pattern: N+1 queries**
```typescript
// ❌ BAD - una query per sessione
const counts = await Promise.all(
  sessions.map(s => supabase.from('table').select().eq('session_id', s.id))
)

// ✅ GOOD - una query per tutte
const { data } = await supabase.from('table')
  .select('session_id').in('session_id', sessionIds)
const countMap = data.reduce(...)
```

**Race Conditions Prevention**:
```typescript
// ✅ Verifica stato DOPO operazione DB
const { error } = await supabase.from('votes').insert({...})
if (!error) {
  await fetchVotes()

  // Query fresca per verificare prima di award points
  const { count } = await supabase.from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (count <= maxVotes) {
    await awardPoints('vote', sessionId)
  }
}
```

### Memory Leaks Prevention

**Cleanup subscriptions**:
```typescript
useEffect(() => {
  const channel = supabase.channel('channel-name')
    .on('postgres_changes', {...}, handler)
    .subscribe()

  return () => {
    channel.unsubscribe()
    supabase.removeChannel(channel) // CRITICAL: always remove channel
  }
}, [deps])
```

**Event listeners**:
```typescript
useEffect(() => {
  const handler = () => {...}
  document.addEventListener('event', handler)
  return () => document.removeEventListener('event', handler)
}, [])
```

### Realtime Subscriptions

**Pattern standard**:
```typescript
useEffect(() => {
  if (!entityId) return
  const channel = supabase
    .channel(`entity-${entityId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'table_name' },
      () => fetchData()
    )
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR') console.error('channel error:', err)
    })
  return () => { supabase.removeChannel(channel) }
  // fetchData catturato in closure - NON in deps (infinite loop prevention)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [entityId])
```

## Permissions & Authorization

**Create Restrictions** (`src/config/permissions.ts`):
- Solo utenti autorizzati possono creare sessioni/team
- Check: `canCreate(user.email)` prima di mostrare bottoni "Crea"
- Per rimuovere restrizione: eliminare file e check relativi

**Super Admin**:
- Flag `is_super_admin` in `profiles` table
- Può vedere TUTTE le sessioni (non solo quelle a cui partecipa)
- Check: `authStore.isSuperAdmin()`

## Database Migrations

**Location**: `supabase/migrations/`
- Migrations numerati: `001_initial_schema.sql` → `017_rls_gamification.sql`
- **Idempotency**: Usare sempre `DROP IF EXISTS` prima di `CREATE`
- **RLS**: Ogni nuova tabella deve avere policies

**Pattern migration**:
```sql
-- Drop existing
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Create
CREATE POLICY "policy_name" ON table_name
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
```

## Convenzioni UI

- **Tema**: Colori "retro" definiti in `src/index.css` (retro-primary, retro-text, etc.)
- **Componenti UI**: `src/components/ui/` (Button, Card, Input, Badge, etc.)
- **Layout**: AppLayout + Sidebar (solo in sessioni attive)
- **Icons**: Lucide React (importare specifici, mai `import * from 'lucide-react'`)
- **Responsive**: Mobile-first con Tailwind breakpoints

## Troubleshooting

**Auth issues**: Verificare `authStore.initialize()` chiamato una volta in App.tsx

**Realtime non funziona**: Controllare che il channel sia subscribed e cleanup fatto correttamente

**Memory leaks**: Cercare subscriptions/listeners senza cleanup in useEffect return

**Query lente**: Verificare indici DB e N+1 patterns (usare `.in()` per batch queries)

**RLS errors**: Utente potrebbe non avere permessi - verificare policies in migrations

**Points duplicati**: Race condition - usare pattern di verifica post-operazione
