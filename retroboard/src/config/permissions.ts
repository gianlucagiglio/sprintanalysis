// Temporary restriction: only these emails can create retros and teams.
// Remove this file and related checks to lift the restriction.
const AUTHORIZED_CREATORS = [
  'bciarlante@qubicaamf.com',
  'gianluca.giglio@gmail.com',
]

export function canCreate(email: string | undefined): boolean {
  if (!email) return false
  return AUTHORIZED_CREATORS.includes(email.toLowerCase())
}
