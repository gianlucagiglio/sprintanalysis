import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { useTeam } from '@/context/TeamContext'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import MetricCard from '@/components/dashboard/MetricCard'
import { CLASSIFICATION_COLORS, PROFESSIONAL_FAMILIES, formatNumber, formatSP } from '@/lib/utils'
import { Gauge, TrendingUp, Users, Target, Euro } from 'lucide-react'

export default function VelocityDashboard() {
  const { processedData, allData, hasData, hasActiveFilters } = useData()
  const { getTeamForSprint, getTotalTeamSize, getSprintCost, periods, costConfig } = useTeam()
  const hasTeamData = periods.some(p =>
    Object.values(p.members).some(v => v > 0)
  )

  // Build unfiltered SP per sprint (for proportional cost allocation when filters are active)
  const unfilteredSprintSP = useMemo(() => {
    const map = new Map()
    if (allData?.sprintTimeline) {
      allData.sprintTimeline.forEach(s => map.set(s.sprint, s.total))
    }
    return map
  }, [allData])

  // Velocity data per sprint
  const velocityData = useMemo(() => {
    if (!processedData) return []
    return processedData.sprintTimeline.map(s => {
      const team = getTeamForSprint(s.sprint)
      const teamSize = team ? getTotalTeamSize(team) : 0
      const fullSprintCost = team ? getSprintCost(team) : 0
      // When filters are active, scale cost proportionally to filtered SP
      const unfilteredTotal = unfilteredSprintSP.get(s.sprint) || s.total
      const sprintCost = hasActiveFilters && unfilteredTotal > 0
        ? fullSprintCost * (s.total / unfilteredTotal)
        : fullSprintCost
      return {
        ...s,
        velocity: s.total,
        teamSize,
        spPerPerson: teamSize > 0 ? s.total / teamSize : null,
        cost: sprintCost,
        costPerSP: s.total > 0 && sprintCost > 0 ? sprintCost / s.total : null,
      }
    })
  }, [processedData, getTeamForSprint, getTotalTeamSize, getSprintCost, hasActiveFilters, unfilteredSprintSP])

  // Average velocity
  const avgVelocity = useMemo(() => {
    const withEffort = velocityData.filter(s => s.total > 0)
    if (withEffort.length === 0) return 0
    return withEffort.reduce((s, v) => s + v.velocity, 0) / withEffort.length
  }, [velocityData])

  // Average SP per person
  const avgSPPerPerson = useMemo(() => {
    const withData = velocityData.filter(s => s.spPerPerson != null && s.spPerPerson > 0)
    if (withData.length === 0) return null
    return withData.reduce((s, v) => s + v.spPerPerson, 0) / withData.length
  }, [velocityData])

  // Cost metrics (velocityData already has proportional cost when filters are active)
  const costMetrics = useMemo(() => {
    if (!hasTeamData) return null
    const activeSprints = velocityData.filter(s => s.total > 0)
    const totalCost = activeSprints.reduce((s, v) => s + v.cost, 0)
    const totalSP = activeSprints.reduce((s, v) => s + v.total, 0)
    const avgCostPerSP = totalSP > 0 ? totalCost / totalSP : 0
    const avgCostPerSprint = activeSprints.length > 0 ? totalCost / activeSprints.length : 0

    // Cost by classification
    const costByClass = {}
    const classifications = ['Strategic', 'KTLO', 'Small Change', 'Other', 'Unclassified']
    classifications.forEach(cls => {
      const clsSP = activeSprints.reduce((s, v) => s + (v[cls] || 0), 0)
      const pct = totalSP > 0 ? clsSP / totalSP : 0
      costByClass[cls] = { sp: clsSP, cost: totalCost * pct, pct: pct * 100 }
    })

    return { totalCost, totalSP, avgCostPerSP, avgCostPerSprint, costByClass, sprintCount: activeSprints.length }
  }, [velocityData, hasTeamData])

  // Per-family velocity
  const familyVelocity = useMemo(() => {
    if (!processedData) return []
    return PROFESSIONAL_FAMILIES.map(f => {
      const key = `effort_${f}`
      const sprints = processedData.sprintTimeline.filter(s => (s[key] || 0) > 0)
      const totalSP = processedData.sprintTimeline.reduce((s, sp) => s + (sp[key] || 0), 0)
      const avgPerSprint = sprints.length > 0 ? totalSP / sprints.length : 0
      const avgMembers = periods.length > 0
        ? periods.reduce((s, p) => s + (p.members[f] || 0), 0) / periods.length
        : 0
      // Cost for this family: members × days × costPerDay × active sprints
      // When filters are active, scale proportionally to filtered SP vs unfiltered SP
      let familyCost = avgMembers * costConfig.sprintDays * costConfig.costPerDay * sprints.length
      if (hasActiveFilters && allData?.sprintTimeline) {
        const unfilteredFamilySP = allData.sprintTimeline.reduce((s, sp) => s + (sp[key] || 0), 0)
        if (unfilteredFamilySP > 0) {
          familyCost = familyCost * (totalSP / unfilteredFamilySP)
        }
      }
      return {
        family: f,
        totalSP: Math.round(totalSP),
        sprintCount: sprints.length,
        avgPerSprint: Math.round(avgPerSprint * 10) / 10,
        avgMembers: Math.round(avgMembers * 10) / 10,
        spPerPerson: avgMembers > 0 ? Math.round((avgPerSprint / avgMembers) * 10) / 10 : null,
        totalCost: Math.round(familyCost),
        costPerSP: totalSP > 0 && familyCost > 0 ? Math.round(familyCost / totalSP) : null,
      }
    }).filter(f => f.totalSP > 0)
  }, [processedData, periods, costConfig, hasActiveFilters, allData])

  // Burndown data
  const burndownData = useMemo(() => {
    if (!processedData || velocityData.length === 0) return []
    const totalScope = processedData.totalEffort
    let cumDone = 0
    return velocityData.map(s => {
      cumDone += s.velocity
      return {
        sprint: s.sprint,
        label: s.fullLabel,
        done: Math.round(cumDone * 10) / 10,
        remaining: Math.round((totalScope - cumDone) * 10) / 10,
        scope: Math.round(totalScope * 10) / 10,
      }
    })
  }, [processedData, velocityData])

  if (!hasData) return <Navigate to="/" replace />

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Velocity, Costs & Burndown</h2>

      {/* KPI cards */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard
          title="Avg Velocity"
          value={formatSP(Math.round(avgVelocity))}
          subtitle="per sprint"
          icon={Gauge}
        />
        <MetricCard
          title="Sprints Tracked"
          value={velocityData.filter(s => s.total > 0).length}
          subtitle={`of ${velocityData.length} total`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Total Story Points"
          value={formatNumber(Math.round(processedData.totalEffort))}
          subtitle="all sprints"
          icon={Target}
        />
        <MetricCard
          title="Avg SP/Person"
          value={avgSPPerPerson != null ? formatNumber(avgSPPerPerson, 1) : 'N/A'}
          subtitle={hasTeamData ? 'per sprint' : 'Set team first'}
          icon={Users}
        />
        <MetricCard
          title="Cost per SP"
          value={costMetrics ? `€${formatNumber(Math.round(costMetrics.avgCostPerSP))}` : 'N/A'}
          subtitle={hasTeamData ? 'average' : 'Set team first'}
          icon={Euro}
        />
      </div>

      {/* Cost breakdown by classification */}
      {costMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Cost Allocation by Classification
            </CardTitle>
            <CardDescription>
              Total estimated cost: €{formatNumber(costMetrics.totalCost)} across {costMetrics.sprintCount} sprints
              (€{formatNumber(Math.round(costMetrics.avgCostPerSprint))}/sprint avg)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(costMetrics.costByClass).map(([cls, data]) => (
                <div key={cls} className="text-center p-3 rounded-lg border">
                  <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: CLASSIFICATION_COLORS[cls] }} />
                  <p className="text-xs text-muted-foreground font-medium">{cls}</p>
                  <p className="text-lg font-bold font-mono mt-1">€{formatNumber(Math.round(data.cost))}</p>
                  <p className="text-xs text-muted-foreground">{data.pct.toFixed(1)}% — {Math.round(data.sp)} SP</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Velocity chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Velocity per Sprint (Story Points)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fullLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis />
              <Tooltip formatter={(val) => [`${Number(val).toFixed(1)} SP`, '']} />
              <Legend />
              <Bar dataKey="Strategic" stackId="1" fill={CLASSIFICATION_COLORS.Strategic} />
              <Bar dataKey="KTLO" stackId="1" fill={CLASSIFICATION_COLORS.KTLO} />
              <Bar dataKey="Small Change" stackId="1" fill={CLASSIFICATION_COLORS['Small Change']} />
              <Bar dataKey="Other" stackId="1" fill={CLASSIFICATION_COLORS.Other} />
              <Bar dataKey="Unclassified" stackId="1" fill={CLASSIFICATION_COLORS.Unclassified} />
              <ReferenceLine y={avgVelocity} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `Avg: ${Math.round(avgVelocity)} SP`, position: 'right', fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost per sprint chart (if team data) */}
      {hasTeamData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost per Story Point Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={velocityData.filter(s => s.costPerSP != null)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fullLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tickFormatter={(v) => `€${v}`} />
                <Tooltip formatter={(val) => [`€${Number(val).toFixed(0)}`, 'Cost/SP']} />
                <Line type="monotone" dataKey="costPerSP" stroke="#f59e0b" strokeWidth={2} name="€/SP" />
                {costMetrics && (
                  <ReferenceLine y={costMetrics.avgCostPerSP} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `Avg: €${Math.round(costMetrics.avgCostPerSP)}`, position: 'right', fontSize: 11 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Burndown chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Burndown (Cumulative Story Points)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={burndownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis />
              <Tooltip formatter={(val) => [`${val} SP`, '']} />
              <Legend />
              <Area type="monotone" dataKey="remaining" name="Remaining" fill="#f59e0b" stroke="#f59e0b" fillOpacity={0.3} />
              <Area type="monotone" dataKey="done" name="Completed" fill="#22c55e" stroke="#22c55e" fillOpacity={0.3} />
              <Line type="monotone" dataKey="scope" name="Total Scope" stroke="#6b7280" strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* SP per person chart */}
      {hasTeamData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SP per Person per Sprint</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={velocityData.filter(s => s.spPerPerson != null)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fullLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis />
                <Tooltip formatter={(val) => [`${Number(val).toFixed(1)} SP/person`, '']} />
                <Line type="monotone" dataKey="spPerPerson" stroke="#3b82f6" strokeWidth={2} name="SP/Person" />
                {avgSPPerPerson != null && (
                  <ReferenceLine y={avgSPPerPerson} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `Avg: ${avgSPPerPerson.toFixed(1)}`, position: 'right', fontSize: 11 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Family velocity + cost table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Velocity & Costs by Professional Family</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Family</TableHead>
                <TableHead>Total SP</TableHead>
                <TableHead>Active Sprints</TableHead>
                <TableHead>Avg SP/Sprint</TableHead>
                <TableHead>Avg Team Size</TableHead>
                <TableHead>SP/Person/Sprint</TableHead>
                {hasTeamData && <TableHead>Est. Cost</TableHead>}
                {hasTeamData && <TableHead>€/SP</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {familyVelocity.map(f => (
                <TableRow key={f.family}>
                  <TableCell className="font-medium">{f.family}</TableCell>
                  <TableCell className="font-mono">{f.totalSP}</TableCell>
                  <TableCell className="font-mono">{f.sprintCount}</TableCell>
                  <TableCell className="font-mono">{f.avgPerSprint}</TableCell>
                  <TableCell className="font-mono">{f.avgMembers > 0 ? f.avgMembers : '—'}</TableCell>
                  <TableCell className="font-mono">{f.spPerPerson != null ? f.spPerPerson : '—'}</TableCell>
                  {hasTeamData && <TableCell className="font-mono">€{formatNumber(f.totalCost)}</TableCell>}
                  {hasTeamData && <TableCell className="font-mono">{f.costPerSP != null ? `€${f.costPerSP}` : '—'}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!hasTeamData && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Go to <a href="/team" className="text-primary underline">Team Composition</a> to define team size and cost parameters.
              This enables cost/SP calculations, cost allocation by classification, and cost trend analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
