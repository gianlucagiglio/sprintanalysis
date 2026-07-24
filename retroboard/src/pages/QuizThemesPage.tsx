import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { quizThemes, quizCategories, type QuizCategory } from '@/data/quizThemes'
import { useQuizThemeUsage } from '@/hooks/useQuizThemeUsage'
import { BookOpen, Layers, ChevronDown, ChevronUp, CheckCircle2, ExternalLink, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'

export function QuizThemesPage() {
  const [expandedCategories, setExpandedCategories] = useState<Set<QuizCategory>>(
    new Set(Object.keys(quizCategories) as QuizCategory[])
  )
  const [selectedTheme, setSelectedTheme] = useState<{ id: string; label: string } | null>(null)
  const { usage } = useQuizThemeUsage()
  const navigate = useNavigate()

  // Close modal if selected theme has no more sessions
  useEffect(() => {
    if (selectedTheme && (!usage[selectedTheme.id] || usage[selectedTheme.id].length === 0)) {
      setSelectedTheme(null)
    }
  }, [usage, selectedTheme])

  const toggleCategory = (category: QuizCategory) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  const toggleAll = () => {
    if (expandedCategories.size === Object.keys(quizCategories).length) {
      setExpandedCategories(new Set())
    } else {
      setExpandedCategories(new Set(Object.keys(quizCategories) as QuizCategory[]))
    }
  }

  // Group themes by category
  const themesByCategory = Object.keys(quizCategories).reduce((acc, category) => {
    acc[category as QuizCategory] = quizThemes.filter((t) => t.category === category)
    return acc
  }, {} as Record<QuizCategory, typeof quizThemes>)

  const allExpanded = expandedCategories.size === Object.keys(quizCategories).length

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-8 space-y-6">
        {/* Header */}
        <PageHeader
          variant="hero"
          title="Temi Quiz"
          description="Esplora tutti i temi disponibili per i quiz delle retrospettive"
          icon={BookOpen}
          gradient="primary"
          badge={{
            label: 'Catalogo Completo',
            variant: 'default'
          }}
          actions={
            <>
              <Badge className="!bg-white/20 !backdrop-blur-md !border-white/40 !text-white !font-bold !shadow-lg">
                <Layers size={14} className="mr-1.5" />
                {Object.keys(quizCategories).length} categorie
              </Badge>
              <Badge className="!bg-white/20 !backdrop-blur-md !border-white/40 !text-white !font-bold !shadow-lg">
                <BookOpen size={14} className="mr-1.5" />
                {quizThemes.length} temi
              </Badge>
            </>
          }
        />

        {/* Expand/Collapse All */}
        <div className="flex justify-end">
          <button
            onClick={toggleAll}
            className="text-sm text-retro-text-secondary hover:text-retro-primary transition-colors flex items-center gap-1.5"
          >
            {allExpanded ? (
              <>
                <ChevronUp size={16} />
                Chiudi tutto
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Espandi tutto
              </>
            )}
          </button>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {(Object.entries(quizCategories) as [QuizCategory, string][]).map(([categoryKey, categoryLabel]) => {
            const themes = themesByCategory[categoryKey]
            const isExpanded = expandedCategories.has(categoryKey)

            return (
              <Card key={categoryKey} className="overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(categoryKey)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{categoryLabel.split(' ')[0]}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-retro-text text-left">
                        {categoryLabel}
                      </h3>
                      <p className="text-sm text-retro-text-secondary">
                        {themes.length} {themes.length === 1 ? 'tema' : 'temi'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-retro-surface text-retro-text-secondary text-xs px-2 py-1">
                      {themes.length * 3} domande
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-retro-text-secondary" />
                    ) : (
                      <ChevronDown size={20} className="text-retro-text-secondary" />
                    )}
                  </div>
                </button>

                {/* Themes List */}
                {isExpanded && (
                  <div className="border-t border-retro-border bg-slate-50/50 px-5 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {themes.map((theme) => {
                        const usageCount = usage[theme.id]?.length || 0
                        const isUsed = usageCount > 0

                        return (
                          <div
                            key={theme.id}
                            onClick={() => isUsed && setSelectedTheme({ id: theme.id, label: theme.label })}
                            className={`bg-white rounded-xl p-4 hover:shadow-soft transition-all duration-200 ${
                              isUsed
                                ? 'border-2 border-emerald-400 hover:border-emerald-500 cursor-pointer'
                                : 'border border-retro-border hover:border-slate-300'
                            }`}
                          >
                            <div className="mb-2">
                              <h4 className="font-medium text-retro-text text-sm">
                                {theme.label}
                              </h4>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-xs text-retro-text-secondary">
                                <BookOpen size={12} />
                                <span>{theme.questions.length} domande</span>
                              </div>
                              {isUsed && (
                                <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                  <CheckCircle2 size={12} />
                                  <span>{usageCount}x</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Stats Footer */}
        <Card className="bg-gradient-to-br from-retro-primary/5 to-violet-500/5 border-retro-primary/20">
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-retro-primary mb-1">
                  {quizThemes.length}
                </div>
                <div className="text-xs md:text-sm text-retro-text-secondary">
                  Temi totali
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-retro-primary mb-1">
                  {quizThemes.length * 3}
                </div>
                <div className="text-xs md:text-sm text-retro-text-secondary">
                  Domande totali
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-retro-primary mb-1">
                  {Object.keys(quizCategories).length}
                </div>
                <div className="text-xs md:text-sm text-retro-text-secondary">
                  Categorie
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-retro-primary mb-1">
                  ~{Math.round((quizThemes.length * 3 * 10) / 60)}
                </div>
                <div className="text-xs md:text-sm text-retro-text-secondary">
                  Minuti di quiz
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Usage Modal */}
      {selectedTheme && usage[selectedTheme.id] && usage[selectedTheme.id].length > 0 && (
        <Modal
          open={!!selectedTheme}
          onClose={() => setSelectedTheme(null)}
          title={`📊 ${selectedTheme.label}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-retro-text-secondary">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>
                Usato in <strong>{usage[selectedTheme.id]?.length || 0}</strong>{' '}
                {usage[selectedTheme.id]?.length === 1 ? 'retrospettiva' : 'retrospettive'}
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {usage[selectedTheme.id]?.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    // Verify session still exists before navigating
                    navigate(`/session/${session.id}`)
                  }}
                  className="w-full bg-white border border-retro-border rounded-xl p-4 hover:border-retro-primary hover:shadow-soft transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-retro-text mb-1 group-hover:text-retro-primary transition-colors truncate">
                        {session.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-retro-text-secondary">
                        <Calendar size={12} />
                        <span>
                          {new Date(session.created_at).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <ExternalLink
                      size={16}
                      className="text-retro-text-secondary group-hover:text-retro-primary transition-colors shrink-0"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  )
}
