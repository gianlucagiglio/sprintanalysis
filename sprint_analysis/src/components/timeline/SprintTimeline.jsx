import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { CLASSIFICATION_COLORS, PROFESSIONAL_FAMILIES } from '@/lib/utils'

export default function SprintTimeline() {
  const { processedData, hasData } = useData()
  const [familyFilter, setFamilyFilter] = useState('all')

  const timelineData = useMemo(() => {
    if (!processedData) return []
    if (familyFilter === 'all') return processedData.sprintTimeline

    // Re-aggregate by selected professional family
    const effortField = {
      'BE': 'effortBE', 'FE': 'effortFE', 'Design': 'effortDesign',
      'Analysis': 'effortAnalysis', 'QA': 'effortQA', 'Automation': 'effortAutomation',
      'Native': 'effortNative', 'Platform Eng': 'effortPlatformEng',
    }[familyFilter]

    const sprintMap = new Map()
    processedData.items.forEach(item => {
      if (!item.sprintInfo) return
      const key = item.sprintInfo.sprint
      if (!sprintMap.has(key)) {
        sprintMap.set(key, {
          sprint: key,
          label: item.sprintInfo.label,
          fullLabel: item.sprintInfo.fullLabel,
          quarter: item.sprintInfo.quarter,
          Strategic: 0, KTLO: 0, 'Small Change': 0, Other: 0, Unclassified: 0, total: 0,
        })
      }
      const entry = sprintMap.get(key)
      const effort = item[effortField] || 0
      const cls = item.classification || 'Unclassified'
      entry[cls] += effort
      entry.total += effort
    })
    return Array.from(sprintMap.values()).sort((a, b) => a.sprint - b.sprint)
  }, [processedData, familyFilter])

  const chartData = useMemo(() => {
    return timelineData.map(d => ({
      ...d,
      strategicPct: d.total > 0 ? (d.Strategic / d.total * 100) : 0,
    }))
  }, [timelineData])

  if (!hasData) return <Navigate to="/" replace />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sprint Timeline</h2>
        <div className="w-48">
          <Select value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)}>
            <option value="all">All Families</option>
            {PROFESSIONAL_FAMILIES.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Effort by Classification Over Time
            {familyFilter !== 'all' && ` (${familyFilter})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fullLabel" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis />
              <Tooltip
                formatter={(val, name) => [`${Number(val).toFixed(1)} SP`, name]}
                labelFormatter={(label) => `Sprint: ${label}`}
              />
              <Legend />
              <Area type="monotone" dataKey="Strategic" stackId="1" fill={CLASSIFICATION_COLORS.Strategic} stroke={CLASSIFICATION_COLORS.Strategic} />
              <Area type="monotone" dataKey="KTLO" stackId="1" fill={CLASSIFICATION_COLORS.KTLO} stroke={CLASSIFICATION_COLORS.KTLO} />
              <Area type="monotone" dataKey="Small Change" stackId="1" fill={CLASSIFICATION_COLORS['Small Change']} stroke={CLASSIFICATION_COLORS['Small Change']} />
              <Area type="monotone" dataKey="Other" stackId="1" fill={CLASSIFICATION_COLORS.Other} stroke={CLASSIFICATION_COLORS.Other} />
              <Area type="monotone" dataKey="Unclassified" stackId="1" fill={CLASSIFICATION_COLORS.Unclassified} stroke={CLASSIFICATION_COLORS.Unclassified} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Strategic Work % Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fullLabel" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis unit="%" />
              <Tooltip formatter={(val) => [`${Number(val).toFixed(1)}%`, 'Strategic %']} />
              <Line type="monotone" dataKey="strategicPct" stroke={CLASSIFICATION_COLORS.Strategic} strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
