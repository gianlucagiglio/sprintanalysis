-- ============================================
-- Disabilita auto-sync Owner Globale → Team Owner
-- Ownership diventa completamente granulare per team
-- ============================================

-- Rimuovi il trigger di auto-sync
DROP TRIGGER IF EXISTS trigger_sync_team_ownership ON profiles;

-- Rimuovi la function (opzionale, la manteniamo commentata per riferimento)
-- DROP FUNCTION IF EXISTS sync_team_ownership();

COMMENT ON FUNCTION sync_team_ownership IS 'DISABLED: Ownership is now team-based only. Use admin UI to manage roles per team.';

SELECT '✅ Auto-sync disabilitato. Ownership ora gestita per team.' as status;
