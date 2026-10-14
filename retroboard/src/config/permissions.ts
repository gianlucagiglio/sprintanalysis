import type { Profile } from '@/types/database'

/**
 * Controlla se un utente può creare sessioni/team
 *
 * PERMESSI:
 * - Super Admin: possono sempre creare
 * - Owner/Creator: utenti con can_create_sessions = true
 *
 * Configurazione: Gestita da super admin in /admin/users
 */
export function canCreate(
  userOrEmail: Profile | string | undefined | null
): boolean {
  if (!userOrEmail) return false

  // Se è una stringa (email), non possiamo controllare permessi DB
  // Questo case è per backward compatibility, sempre false per sicurezza
  if (typeof userOrEmail === 'string') {
    // console.warn(
      '[permissions] canCreate chiamato con email invece di Profile. ' +
      'Usa il profilo completo per controllo accurato.'
    )
    return false
  }

  // Controlla permessi dal profilo
  const user = userOrEmail as Profile

  // Super admin possono sempre creare
  if (user.is_super_admin) {
    return true
  }

  // Owner/Creator con permesso esplicito
  if (user.can_create_sessions) {
    return true
  }

  return false
}
