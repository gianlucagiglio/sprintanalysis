import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { CLASSIFICATION_COLORS, PROFESSIONAL_FAMILIES, formatNumber, formatSP, getDimensionColor } from '@/lib/utils'
import { Columns2, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { computeAggregate, computeDelta, getSprintsForQuarter, getSprintsForRange } from '@/lib/comparison-utils'

function DeltaIndicator({ delta }) {
  if (!delta) return null
  const { value, percent } = delta
  const isPositive = value > 0
  const isNeutral = value === 0

  if (isNeutral) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> 0%
      </span>
    )
  }

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
      {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {isPositive ? '+' : ''}{percent}%
    </span>
  )
}

function ComparisonMetric({ label, valueA, valueB, delta }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-border/50 last:border-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-center">
        <span className="font-mono font-bold">{valueA}</span>
      </div>
      <div className="text-center flex items-center justify-center gap-2">
        <span className="font-mono font-bold">{valueB}</span>
        <DeltaIndicator delta={delta} />
      </div>
    </div>
  )
}

function SideSelector({ label, mode, setMode, value, setValue, sprints, quarters }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <Select value={mode} onChange={e => { setMode(e.target.value); setValue('') }}>
        <option value="sprint">Single Sprint</option>
        <option value="quarter">Quarter</option>
      </Select>
      {mode === 'sprint' && (
        <Select value={value} onChange={e => setValue(e.target.value)}>
          <option value="">Seleziona sprint...</option>
          {sprints.map(s => (
            <option key={s.sprint} value={s.sprint}>{s.label}</option>
          ))}
        </Select>
      )}
      {mode === 'quarter' && (
        <Select value={value} onChange={e => setValue(e.target.value)}>
          <option value="">Seleziona quarter...</option>
          {quarters.map(q => (
            <option key={q.key} value={q.key}>{q.label}</option>
          ))}
        </Select>
      )}
    </div>
  )
}

export default function SprintComparison() {
  const { processedData, hasData, availableSprints, availableQuarters } = useData()
  const [modeA, setModeA] = useState('sprint')
  const [valueA, setValueA] = useState('')
  const [modeB, setModeB] = useState('sprint')
  const [valueB, setValueB] = useState('')

  const sprintNumsA = useMemo(() => {
    if (!processedData || !valueA) return []
    if (modeA === 'sprint') return [parseInt(valueA)]
    if (modeA === 'quarter') return getSprintsForQuarter(processedData.sprintTimeline, valueA)
    return []
  }, [processedData, modeA, valueA])

  const sprintNumsB = useMemo(() => {
    if (!processedData || !valueB) return []
    if (modeB === 'sprint') return [parseInt(valueB)]
    if (modeB === 'quarter') return getSprintsForQuarter(processedData.sprintTimeline, valueB)
    return []
  }, [processedData, modeB, valueB])

  const aggA = useMemo(() => {
    if (!processedData || sprintNumsA.length === 0) return null
    return computeAggregate(processedData.items, processedData.sprintTimeline, sprintNumsA)
  }, [processedData, sprintNumsA])

  const aggB = useMemo(() => {
    if (!processedData || sprintNumsB.length === 0) return null
    return computeAggregate(processedData.items, processedData.sprintTimeline, sprintNumsB)
  }, [processedData, sprintNumsB])

  const delta = useMemo(() => {
    if (!aggA || !aggB) return null
    return computeDelta(aggA, aggB)
  }, [aggA, aggB])

  if (!hasData) return <Navigate to="/" replace />

  const hasBothSelections = aggA && aggB

  // Classification pie data
  const classDataA = aggA ? Object.entries(aggA.classificationEffort)
    .map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }))
    .filter(d => d.value > 0) : []

  const classDataB = aggB ? Object.entries(aggB.classificationEffort)
    .map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }))
    .filter(d => d.value > 0) : []

  // Family grouped bar data
  const familyData = hasBothSelections ? PROFESSIONAL_FAMILIES.map(f => ({
    name: f,
    A: Math.round((aggA.familyEffort[f] || 0) * 10) / 10,
    B: Math.round((aggB.familyEffort[f] || 0) * 10) / 10,
  })) : []

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sprint Comparison</h2>

      {/* Selectors */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-8">
            <SideSelector
              label="Side A"
              mode={modeA} setMode={setModeA}
              value={valueA} setValue={setValueA}
              sprints={availableSprints}
              quarters={availableQuarters}
            />
            <SideSelector
              label="Side B"
              mode={modeB} setMode={setModeB}
              value={valueB} setValue={setValueB}
              sprints={availableSprints}
              quarters={availableQuarters}
            />
          </div>
        </CardContent>
      </Card>

      {!hasBothSelections && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Columns2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Seleziona due sprint o quarter per confrontarli.</p>
          </CardContent>
        </Card>
      )}

      {hasBothSelections && (
        <>
          {/* Metrics comparison */}
          <Card>
            <CardHeader>
              <div className="grid grid-cols-3 gap-4">
                <CardTitle className="text-base">Metric</CardTitle>
                <CardTitle className="text-base text-center">{aggA.label}</CardTitle>
                <CardTitle className="text-base text-center">{aggB.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ComparisonMetric
                label="Total Effort"
                valueA={formatSP(aggA.totalEffort)}
                valueB={formatSP(aggB.totalEffort)}
                delta={delta.totalEffort}
              />
              <ComparisonMetric
                label="Total Items"
                valueA={formatNumber(aggA.totalItems)}
                valueB={formatNumber(aggB.totalItems)}
                delta={delta.totalItems}
              />
              <ComparisonMetric
                label="Closed Items"
                valueA={formatNumber(aggA.closedCount)}
                valueB={formatNumber(aggB.closedCount)}
                delta={delta.closedCount}
              />
              <ComparisonMetric
                label="Avg Velocity"
                valueA={formatSP(aggA.avgVelocity)}
                valueB={formatSP(aggB.avgVelocity)}
                delta={delta.avgVelocity}
              />
              <ComparisonMetric
                label="Completion Rate"
                valueA={`${aggA.completionRate}%`}
                valueB={`${aggB.completionRate}%`}
                delta={delta.completionRate}
              />
            </CardContent>
          </Card>

          {/* Charts row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Pie A */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Classification — {aggA.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={classDataA}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {classDataA.map(entry => (
                        <Cell key={entry.name} fill={CLASSIFICATION_COLORS[entry.name] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [`${val} SP`, 'Effort']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie B */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Classification — {aggB.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={classDataB}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {classDataB.map(entry => (
                        <Cell key={entry.name} fill={CLASSIFICATION_COLORS[entry.name] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => [`${val} SP`, 'Effort']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Family distribution grouped bar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Effort by Professional Family</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={familyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip formatter={(val) => [`${val} SP`, '']} />
                  <Legend />
                  <Bar dataKey="A" name={aggA.label} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="B" name={aggB.label} fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
