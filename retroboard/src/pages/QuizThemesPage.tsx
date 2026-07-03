import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { quizThemes, quizCategories, type QuizCategory } from '@/data/quizThemes'
import { BookOpen, Layers, ChevronDown, ChevronUp } from 'lucide-react'

export function QuizThemesPage() {
  const [expandedCategories, setExpandedCategories] = useState<Set<QuizCategory>>(
    new Set(Object.keys(quizCategories) as QuizCategory[])
  )

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-retro-text mb-2">
              📚 Temi Quiz
            </h1>
            <p className="text-sm text-retro-text-secondary">
              Esplora tutti i temi disponibili per i quiz delle retrospettive
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-retro-primary/10 text-retro-primary text-sm px-3 py-1.5">
              <Layers size={14} className="mr-1.5" />
              {Object.keys(quizCategories).length} categorie
            </Badge>
            <Badge className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1.5">
              <BookOpen size={14} className="mr-1.5" />
              {quizThemes.length} temi
            </Badge>
          </div>
        </div>

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
                      {themes.map((theme) => (
                        <div
                          key={theme.id}
                          className="bg-white rounded-xl border border-retro-border p-4 hover:shadow-soft transition-all duration-200 hover:border-retro-primary/30"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-retro-text text-sm flex-1">
                              {theme.label}
                            </h4>
                            <Badge className="bg-retro-primary/10 text-retro-primary text-xs px-2 py-0.5 shrink-0">
                              {theme.questions.length}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-retro-text-secondary">
                            <BookOpen size={12} />
                            <span>{theme.questions.length} domande</span>
                          </div>
                        </div>
                      ))}
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
    </AppLayout>
  )
}
