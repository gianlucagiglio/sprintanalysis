import { useState, FormEvent } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la richiesta')
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
          <p className="text-sm text-retro-text-secondary">Recupera il tuo account</p>
        </div>
        <Card className="shadow-card p-8">
          {success ? (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="text-green-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-retro-text">Email inviata!</h2>
              <p className="text-sm text-retro-text-secondary">
                Controlla la tua casella di posta. Ti abbiamo inviato un link per reimpostare la password.
              </p>
              <Link to="/login">
                <Button className="w-full mt-4">
                  <ArrowLeft size={16} />
                  Torna al login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-bold text-retro-text mb-6">Password dimenticata?</h2>
              <p className="text-sm text-retro-text-secondary mb-4">
                Inserisci la tua email e ti invieremo un link per reimpostare la password.
              </p>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.com"
                required
              />
              {error && <p className="text-sm text-retro-mad">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                <Mail size={16} />
                {loading ? 'Invio in corso...' : 'Invia link di recupero'}
              </Button>
              <p className="text-sm text-center text-retro-text-secondary">
                <Link to="/login" className="text-retro-primary font-medium hover:underline">
                  <ArrowLeft size={14} className="inline mr-1" />
                  Torna al login
                </Link>
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
