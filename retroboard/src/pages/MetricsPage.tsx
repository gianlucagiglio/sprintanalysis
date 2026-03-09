import { AppLayout } from '@/components/layout/AppLayout'
import { SentimentChart } from '@/components/metrics/SentimentChart'
import { SentimentOverview } from '@/components/metrics/SentimentOverview'
import { TrendKPIs } from '@/components/metrics/TrendKPIs'
import { HappinessTrendLine } from '@/components/metrics/HappinessTrendLine'
import { CommentSentimentChart } from '@/components/metrics/CommentSentimentChart'
import { SentimentDelta } from '@/components/metrics/SentimentDelta'
import { useGlobalMoods } from '@/hooks/useGlobalMoods'
import { useMetrics } from '@/hooks/useMetrics'
import { BarChart3 } from 'lucide-react'

export function MetricsPage() {
  const { sessionMoods, globalCounts, loading: moodsLoading } = useGlobalMoods()
  const { commentSentiments, happinessData, trendKPIs, sentimentDeltas, loading: metricsLoading } = useMetrics()

  const loading = moodsLoading || metricsLoading

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
            <TrendKPIs kpis={trendKPIs} />
            <HappinessTrendLine data={happinessData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CommentSentimentChart data={commentSentiments} />
              <SentimentChart sessionMoods={sessionMoods} />
            </div>
            <SentimentDelta data={sentimentDeltas} />
            <SentimentOverview sessionMoods={sessionMoods} globalCounts={globalCounts} />
          </>
        )}
      </div>
    </AppLayout>
  )
}
