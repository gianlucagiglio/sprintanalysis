import { useState, FormEvent } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const signIn = useAuthStore((s) => s.signIn)
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string })?.from || '/dashboard'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-bold text-retro-text mb-6">Accedi al tuo account</h2>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="nome@email.com"
        required
      />
      <div>
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="La tua password"
          required
        />
        <div className="text-right mt-1">
          <Link to="/forgot-password" className="text-xs text-retro-primary hover:underline">
            Password dimenticata?
          </Link>
        </div>
      </div>
      {error && <p className="text-sm text-retro-mad">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        <LogIn size={16} />
        {loading ? 'Accesso...' : 'Accedi'}
      </Button>
      <p className="text-sm text-center text-retro-text-secondary">
        Non hai un account?{' '}
        <Link to="/register" state={location.state} className="text-retro-primary font-medium hover:underline">Registrati</Link>
      </p>
    </form>
  )
}
