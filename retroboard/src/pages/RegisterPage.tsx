import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card } from '@/components/ui/Card'

export function RegisterPage() {
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
          <p className="text-sm text-retro-text-secondary">Unisciti al team! Crea il tuo account</p>
        </div>
        <Card className="shadow-card p-8">
          <RegisterForm />
        </Card>
      </div>
    </div>
  )
}
