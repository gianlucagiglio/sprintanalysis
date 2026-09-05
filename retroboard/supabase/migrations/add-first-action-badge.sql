-- ============================================
-- Aggiungi badge "First Action"
-- ============================================

-- 1. Aggiungi il nuovo badge
INSERT INTO badge_definitions (code, name, description, icon, category, criteria, sort_order)
VALUES (
  'first_action',
  'First Action',
  'Completa la tua prima azione assegnata',
  '✅',
  'contribution',
  '{"type": "actions_completed", "threshold": 1}',
  5
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  criteria = EXCLUDED.criteria;

-- 2. Aggiungi anche badge per creatori di azioni
INSERT INTO badge_definitions (code, name, description, icon, category, criteria, sort_order)
VALUES (
  'action_creator',
  'Action Creator',
  'Crea 5 azioni durante le retrospettive',
  '📝',
  'contribution',
  '{"type": "actions_created", "threshold": 5}',
  13
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  criteria = EXCLUDED.criteria;

-- 3. Verifica i nuovi badge
SELECT code, name, icon, description, criteria
FROM badge_definitions
WHERE code IN ('first_action', 'action_creator')
ORDER BY sort_order;
