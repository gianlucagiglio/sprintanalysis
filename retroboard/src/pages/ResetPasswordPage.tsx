import { useState, FormEvent } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { useNavigate } from 'react-router-dom'
import { Lock, Check } from 'lucide-react'

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const resetPassword = useAuthStore((s) => s.resetPassword)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Le password non corrispondono')
      return
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }

    setLoading(true)
    try {
      await resetPassword(password)
      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il reset della password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-3xl">🔄</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-retro-primary to-violet-500 bg-clip-text text-transparent">
              RetroBoard
            </span>
          </div>
          <p className="text-sm text-retro-text-secondary">Imposta una nuova password</p>
        </div>
        <Card className="shadow-card p-8">
          {success ? (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="text-green-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-retro-text">Password aggiornata!</h2>
              <p className="text-sm text-retro-text-secondary">
                La tua password è stata modificata con successo. Verrai reindirizzato...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-bold text-retro-text mb-6">Nuova password</h2>
              <Input
                label="Nuova password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Almeno 6 caratteri"
                required
              />
              <Input
                label="Conferma password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ripeti la password"
                required
              />
              {error && <p className="text-sm text-retro-mad">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                <Lock size={16} />
                {loading ? 'Aggiornamento...' : 'Aggiorna password'}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
