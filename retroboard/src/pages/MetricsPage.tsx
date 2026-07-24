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
import { TeamHealthScore } from '@/components/metrics/TeamHealthScore'
import { EngagementMetrics } from '@/components/metrics/EngagementMetrics'
import { ActionFunnel } from '@/components/metrics/ActionFunnel'
import { RedFlagsAlert } from '@/components/metrics/RedFlagsAlert'
import { useGlobalMoods } from '@/hooks/useGlobalMoods'
import { useMetrics } from '@/hooks/useMetrics'
import { useTeamStats } from '@/hooks/useTeamStats'
import { useAdvancedMetrics } from '@/hooks/useAdvancedMetrics'
import { BarChart3, Users, TrendingUp, Activity, Target } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'

export function MetricsPage() {
  const { sessionMoods, sessionTeamMoods, globalCounts, globalTeamMoodCounts, loading: moodsLoading } = useGlobalMoods()
  const { commentSentiments, happinessData, trendKPIs, sentimentDeltas, loading: metricsLoading } = useMetrics()
  const { teamStats, noTeamStats, loading: teamStatsLoading } = useTeamStats()
  const { teamHealth, engagement, actionFunnel, redFlags, loading: advancedLoading } = useAdvancedMetrics()

  const loading = moodsLoading || metricsLoading || advancedLoading

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          variant="hero"
          title="Dashboard Sentiment"
          description="Monitora e analizza il sentiment e il mood delle tue retrospettive in tempo reale"
          icon={BarChart3}
          gradient="primary"
          badge={{
            label: 'Analytics',
            variant: 'default'
          }}
        />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
              <BarChart3 size={32} className="text-white" />
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* ── KPI Globali ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <TrendKPIs kpis={trendKPIs} />
            </motion.div>

            {/* ── Red Flags Alert ── */}
            {redFlags && redFlags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <RedFlagsAlert flags={redFlags} />
              </motion.div>
            )}

            {/* ── Metriche Avanzate ── */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Target size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-retro-text">
                    Metriche Chiave
                  </h2>
                  <p className="text-sm text-retro-text-secondary">
                    KPI actionable per decisioni informate
                  </p>
                </div>
              </div>

              {/* Engagement Metrics */}
              {engagement && <EngagementMetrics {...engagement} />}

              {/* Team Health Score + Action Funnel */}
              {(teamHealth || actionFunnel) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {teamHealth && <TeamHealthScore {...teamHealth} />}
                  {actionFunnel && <ActionFunnel data={actionFunnel} />}
                </div>
              )}
            </motion.div>

            {/* ── Sezione Team ── */}
            {(teamStats.length > 0 || noTeamStats) && (
              <motion.div
                className="space-y-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-retro-text">
                      I tuoi team
                    </h2>
                    <p className="text-sm text-retro-text-secondary">
                      Statistiche e performance per team
                    </p>
                  </div>
                </div>

                {teamStatsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-retro-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {teamStats.map((ts, idx) => (
                      <motion.div
                        key={ts.team.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                      >
                        <TeamStatsCard stats={ts} />
                      </motion.div>
                    ))}
                    {noTeamStats && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + teamStats.length * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                      >
                        <NoTeamStatsCard stats={noTeamStats} />
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Trend Globale ── */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-retro-text">
                    Trend Globale
                  </h2>
                  <p className="text-sm text-retro-text-secondary">
                    Analisi longitudinale del sentiment
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <Card className="!p-6 !rounded-2xl">
                  <HappinessTrendLine data={happinessData} />
                </Card>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <Card className="!p-6 !rounded-2xl">
                    <CommentSentimentChart data={commentSentiments} />
                  </Card>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <Card className="!p-6 !rounded-2xl">
                    <SentimentChart sessionMoods={sessionMoods} />
                  </Card>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <Card className="!p-6 !rounded-2xl">
                  <SentimentDelta data={sentimentDeltas} />
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <SentimentOverview sessionMoods={sessionMoods} globalCounts={globalCounts} />
              </motion.div>
            </motion.div>

            {/* ── Collaborazione Team ── */}
            {sessionTeamMoods.some(s => s.total > 0) && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Activity size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-retro-text">
                      Collaborazione Team
                    </h2>
                    <p className="text-sm text-retro-text-secondary">
                      Mood e engagement del team
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0, type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <Card className="!p-6 !rounded-2xl">
                      <TeamMoodChart sessionTeamMoods={sessionTeamMoods} />
                    </Card>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0, type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <Card className="!p-6 !rounded-2xl h-full flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Activity size={48} className="text-retro-text-secondary mx-auto opacity-30" />
                        <p className="text-sm text-retro-text-secondary">
                          Ulteriori metriche di collaborazione
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <TeamMoodOverview sessionTeamMoods={sessionTeamMoods} globalTeamMoodCounts={globalTeamMoodCounts} />
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
