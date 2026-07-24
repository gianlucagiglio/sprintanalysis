import { AppLayout } from '@/components/layout/AppLayout'
import { SentimentChart } from '@/components/metrics/SentimentChart'
import { SentimentOverview } from '@/components/metrics/SentimentOverview'
import { TeamMoodChart } from '@/components/metrics/TeamMoodChart'
import { TeamMoodOverview } from '@/components/metrics/TeamMoodOverview'
import { TrendKPIs } from '@/components/metrics/TrendKPIs'
import { HappinessTrendLine } from '@/components/metrics/HappinessTrendLine'
import { CommentSentimentChart } from '@/components/metrics/CommentSentimentChart'
import { SentimentDelta } from '@/components/metrics/SentimentDelta'
import { TeamStatsCard, NoTeamStatsCard } from '@/components/dashboard/TeamStatsCard'
import { useGlobalMoods } from '@/hooks/useGlobalMoods'
import { useMetrics } from '@/hooks/useMetrics'
import { useTeamStats } from '@/hooks/useTeamStats'
import { BarChart3, Users } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'

export function MetricsPage() {
  const { sessionMoods, sessionTeamMoods, globalCounts, globalTeamMoodCounts, loading: moodsLoading } = useGlobalMoods()
  const { commentSentiments, happinessData, trendKPIs, sentimentDeltas, loading: metricsLoading } = useMetrics()
  const { teamStats, noTeamStats, loading: teamStatsLoading } = useTeamStats()

  const loading = moodsLoading || metricsLoading

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <PageHeader
          variant="hero"
          title="Dashboard"
          description="Panoramica sentiment delle tue retrospettive"
          icon={BarChart3}
          gradient="primary"
          badge={{
            label: 'Metriche',
            variant: 'default'
          }}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-retro-primary" />
          </div>
        ) : (
          <>
            {/* KPI globali */}
            <TrendKPIs kpis={trendKPIs} />

            {/* Sezione Team */}
            {(teamStats.length > 0 || noTeamStats) && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-retro-text flex items-center gap-2">
                  <Users size={18} className="text-retro-primary" />
                  I tuoi team
                </h2>

                {teamStatsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-retro-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamStats.map((ts) => (
                      <TeamStatsCard key={ts.team.id} stats={ts} />
                    ))}
                    {noTeamStats && <NoTeamStatsCard stats={noTeamStats} />}
                  </div>
                )}
              </div>
            )}

            {/* Trend globale */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-retro-text">
                Trend globale
              </h2>
              <HappinessTrendLine data={happinessData} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CommentSentimentChart data={commentSentiments} />
                <SentimentChart sessionMoods={sessionMoods} />
              </div>
              <SentimentDelta data={sentimentDeltas} />
              <SentimentOverview sessionMoods={sessionMoods} globalCounts={globalCounts} />
            </div>

            {/* Collaborazione Team */}
            {sessionTeamMoods.some(s => s.total > 0) && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-retro-text flex items-center gap-2">
                  <Users size={18} className="text-emerald-500" />
                  Collaborazione Team
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TeamMoodChart sessionTeamMoods={sessionTeamMoods} />
                </div>
                <TeamMoodOverview sessionTeamMoods={sessionTeamMoods} globalTeamMoodCounts={globalTeamMoodCounts} />
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
