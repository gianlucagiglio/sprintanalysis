-- ============================================
-- AUTO SYNC: Owner/Creator → Team Owner
-- Quando promuovi qualcuno come Owner/Creator,
-- diventa automaticamente owner dei team a cui appartiene
-- ============================================

-- ============================================
-- TRIGGER FUNCTION: Sync team ownership
-- ============================================

CREATE OR REPLACE FUNCTION sync_team_ownership()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Solo se can_create_sessions è cambiato
  IF (OLD.can_create_sessions IS DISTINCT FROM NEW.can_create_sessions) THEN

    IF NEW.can_create_sessions = true THEN
      -- PROMUOVI a owner in tutti i team dove è membro
      UPDATE team_members
      SET role = 'owner'
      WHERE user_id = NEW.id
        AND role != 'owner'; -- Solo se non è già owner

      RAISE NOTICE 'Utente % promosso a owner in tutti i suoi team', NEW.name;

    ELSE
      -- DECLASSA da owner ad admin in tutti i team
      UPDATE team_members
      SET role = 'admin'
      WHERE user_id = NEW.id
        AND role = 'owner';

      RAISE NOTICE 'Utente % declassato da owner ad admin in tutti i suoi team', NEW.name;
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGER: Esegui sync quando cambia can_create_sessions
-- ============================================

DROP TRIGGER IF EXISTS trigger_sync_team_ownership ON profiles;

CREATE TRIGGER trigger_sync_team_ownership
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_team_ownership();

COMMENT ON FUNCTION sync_team_ownership IS 'Auto-sync: Owner/Creator (can_create_sessions) → Team Owner (role)';

-- ============================================
-- MIGRAZIONE: Sync stato attuale
-- Promuovi tutti gli Owner/Creator attuali nei loro team
-- ============================================

UPDATE team_members
SET role = 'owner'
WHERE user_id IN (
  SELECT id FROM profiles WHERE can_create_sessions = true
)
AND role != 'owner';

-- Verifica risultato
SELECT
  p.name,
  p.email,
  p.can_create_sessions,
  COUNT(tm.team_id) FILTER (WHERE tm.role = 'owner') as owner_in_teams,
  COUNT(tm.team_id) as total_teams
FROM profiles p
LEFT JOIN team_members tm ON tm.user_id = p.id
WHERE p.can_create_sessions = true
GROUP BY p.id, p.name, p.email, p.can_create_sessions;

SELECT '✅ Auto-sync team ownership attivato!' as status;
