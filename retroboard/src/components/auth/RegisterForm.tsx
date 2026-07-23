import { useState, FormEvent } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserPlus } from 'lucide-react'

export function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const signUp = useAuthStore((s) => s.signUp)
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string })?.from || '/dashboard'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('La password deve avere almeno 6 caratteri')
      return
    }
    setLoading(true)
    try {
      await signUp(email, password, name)
      navigate(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-bold text-retro-text mb-6">Crea il tuo account</h2>
      <Input
        label="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Il tuo nome"
        required
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="nome@email.com"
        required
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Minimo 6 caratteri"
        required
      />
      {error && <p className="text-sm text-retro-mad">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading} loading={loading}>
        <UserPlus size={16} />
        {loading ? 'Registrazione...' : 'Registrati'}
      </Button>
      <p className="text-sm text-center text-retro-text-secondary">
        Hai già un account?{' '}
        <Link to="/login" state={location.state} className="text-retro-primary font-medium hover:underline">Accedi</Link>
      </p>
    </form>
  )
}
