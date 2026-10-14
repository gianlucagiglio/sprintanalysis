-- ============================================
-- FIX: Abilita owner originali dalla vecchia whitelist
-- ============================================

-- 1. Verifica stato attuale
SELECT
  name,
  email,
  can_create_sessions,
  is_super_admin
FROM profiles
WHERE email IN (
  'bciarlante@qubicaamf.com',
  'gianluca.giglio@gmail.com'
)
ORDER BY email;

-- 2. Abilita come owner
UPDATE profiles
SET can_create_sessions = true
WHERE email IN (
  'bciarlante@qubicaamf.com',
  'gianluca.giglio@gmail.com'
);

-- 3. Verifica risultato
SELECT
  name,
  email,
  can_create_sessions,
  is_super_admin,
  '✅ Owner abilitato' as status
FROM profiles
WHERE email IN (
  'bciarlante@qubicaamf.com',
  'gianluca.giglio@gmail.com'
)
ORDER BY email;
