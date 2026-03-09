import { AppLayout } from '@/components/layout/AppLayout'
import { SentimentChart } from '@/components/metrics/SentimentChart'
import { SentimentOverview } from '@/components/metrics/SentimentOverview'
import { useGlobalMoods } from '@/hooks/useGlobalMoods'
import { BarChart3 } from 'lucide-react'

export function MetricsPage() {
  const { sessionMoods, globalCounts, loading } = useGlobalMoods()

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-retro-text flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-retro-primary to-violet-500 flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </span>
            Dashboard
          </h1>
          <p className="text-sm text-retro-text-secondary mt-1">
            Panoramica sentiment delle tue retrospettive
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-retro-primary" />
          </div>
        ) : (
          <>
            <SentimentChart sessionMoods={sessionMoods} />
            <SentimentOverview sessionMoods={sessionMoods} globalCounts={globalCounts} />
          </>
        )}
      </div>
    </AppLayout>
  )
}
