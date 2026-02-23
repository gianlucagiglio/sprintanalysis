import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { parseTags, formatNumber, PROFESSIONAL_FAMILIES, getDimensionColor } from '@/lib/utils'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { Layers, Tag, Target, Activity, Box, FolderTree } from 'lucide-react'

const DIMENSIONS = [
  { key: 'tag', label: 'Tag', icon: Tag, extract: (item) => parseTags(item.tags) },
  { key: 'valueArea', label: 'Value Area', icon: Target, extract: (item) => item.valueArea ? [item.valueArea] : [] },
  { key: 'state', label: 'State', icon: Activity, extract: (item) => item.state ? [item.state] : [] },
  { key: 'type', label: 'Type', icon: Box, extract: (item) => item.type ? [item.type] : [] },
  { key: 'parent', label: 'Parent', icon: FolderTree, extract: (item) => item.parent ? [String(item.parent)] : [] },
]

function groupByDimension(items, extractFn) {
  const groups = new Map()
  items.forEach(item => {
    const values = extractFn(item)
    if (values.length === 0) {
      const key = '(none)'
      if (!groups.has(key)) groups.set(key, { items: [], effort: 0, effortByFamily: {} })
      const g = groups.get(key)
      g.items.push(item)
      g.effort += item.totalEffort
      PROFESSIONAL_FAMILIES.forEach(f => {
        g.effortByFamily[f] = (g.effortByFamily[f] || 0) + (item.effortByFamily?.[f] || 0)
      })
    } else {
      values.forEach(val => {
        if (!groups.has(val)) groups.set(val, { items: [], effort: 0, effortByFamily: {} })
        const g = groups.get(val)
        g.items.push(item)
        g.effort += item.totalEffort
        PROFESSIONAL_FAMILIES.forEach(f => {
          g.effortByFamily[f] = (g.effortByFamily[f] || 0) + (item.effortByFamily?.[f] || 0)
        })
      })
    }
  })
  return groups
}

function crossTabulate(items, extractFnA, extractFnB) {
  const matrix = new Map()
  const rowKeys = new Set()
  const colKeys = new Set()

  items.forEach(item => {
    const aVals = extractFnA(item)
    const bVals = extractFnB(item)
    if (aVals.length === 0) aVals.push('(none)')
    if (bVals.length === 0) bVals.push('(none)')

    aVals.forEach(a => {
      bVals.forEach(b => {
        rowKeys.add(a)
        colKeys.add(b)
        const key = `${a}|||${b}`
        matrix.set(key, (matrix.get(key) || 0) + item.totalEffort)
      })
    })
  })

  return {
    rows: [...rowKeys].sort(),
    cols: [...colKeys].sort(),
    getValue: (r, c) => matrix.get(`${r}|||${c}`) || 0,
  }
}

function DimensionBreakdown({ items, dimension }) {
  const groups = useMemo(
    () => groupByDimension(items, dimension.extract),
    [items, dimension]
  )

  const sorted = useMemo(() => {
    return [...groups.entries()]
      .map(([value, data]) => ({ value, ...data, count: data.items.length }))
      .sort((a, b) => b.effort - a.effort)
  }, [groups])

  const totalEffort = useMemo(
    () => sorted.reduce((s, r) => s + r.effort, 0),
    [sorted]
  )

  const pieData = useMemo(
    () => sorted.slice(0, 12).map((r, i) => ({ name: r.value, value: r.effort, color: getDimensionColor(i) })),
    [sorted]
  )

  const barData = useMemo(
    () => sorted.slice(0, 10).map((r, i) => ({ name: r.value.length > 25 ? r.value.slice(0, 22) + '...' : r.value, effort: r.effort, color: getDimensionColor(i) })),
    [sorted]
  )

  return (
    <div className="space-y-6">
      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Distribuzione Effort</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`${formatNumber(v, 1)} SP`, 'Effort']}
                    contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">Nessun dato</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top 10 per Effort</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) => [`${formatNumber(v, 1)} SP`, 'Effort']}
                    contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="effort" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">Nessun dato</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Breakdown table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Breakdown Dettagliato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">{dimension.label}</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Items</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Effort (SP)</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">% Effort</th>
                  {PROFESSIONAL_FAMILIES.map(f => (
                    <th key={f} className="text-right py-2 px-3 font-medium text-muted-foreground text-xs">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => (
                  <tr key={row.value} className="border-b border-border/50 hover:bg-accent/50">
                    <td className="py-2 px-3 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getDimensionColor(i) }} />
                        <span className="truncate max-w-[200px]">{row.value}</span>
                      </div>
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-xs">{row.count}</td>
                    <td className="text-right py-2 px-3 font-mono text-xs">{formatNumber(row.effort, 1)}</td>
                    <td className="text-right py-2 px-3 font-mono text-xs">
                      {totalEffort > 0 ? `${(row.effort / totalEffort * 100).toFixed(1)}%` : '0%'}
                    </td>
                    {PROFESSIONAL_FAMILIES.map(f => (
                      <td key={f} className="text-right py-2 px-3 font-mono text-xs text-muted-foreground">
                        {row.effortByFamily[f] ? formatNumber(row.effortByFamily[f], 1) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {sorted.length > 1 && (
                <tfoot>
                  <tr className="border-t-2 border-border font-semibold">
                    <td className="py-2 px-3">Totale</td>
                    <td className="text-right py-2 px-3 font-mono text-xs">
                      {sorted.reduce((s, r) => s + r.count, 0)}
                    </td>
                    <td className="text-right py-2 px-3 font-mono text-xs">{formatNumber(totalEffort, 1)}</td>
                    <td className="text-right py-2 px-3 font-mono text-xs">100%</td>
                    {PROFESSIONAL_FAMILIES.map(f => (
                      <td key={f} className="text-right py-2 px-3 font-mono text-xs">
                        {formatNumber(sorted.reduce((s, r) => s + (r.effortByFamily[f] || 0), 0), 1)}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CrossAnalysis({ items }) {
  const [dimA, setDimA] = useState('type')
  const [dimB, setDimB] = useState('state')

  const dimensionA = DIMENSIONS.find(d => d.key === dimA)
  const dimensionB = DIMENSIONS.find(d => d.key === dimB)

  const cross = useMemo(
    () => crossTabulate(items, dimensionA.extract, dimensionB.extract),
    [items, dimensionA, dimensionB]
  )

  const maxVal = useMemo(() => {
    let max = 0
    cross.rows.forEach(r => cross.cols.forEach(c => {
      const v = cross.getValue(r, c)
      if (v > max) max = v
    }))
    return max
  }, [cross])

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Cross-Analysis</CardTitle>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Righe:</span>
            <select
              value={dimA}
              onChange={(e) => setDimA(e.target.value)}
              className="h-7 rounded border border-input bg-background px-2 text-xs"
            >
              {DIMENSIONS.map(d => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
            <span className="text-muted-foreground">×</span>
            <span className="text-muted-foreground">Colonne:</span>
            <select
              value={dimB}
              onChange={(e) => setDimB(e.target.value)}
              className="h-7 rounded border border-input bg-background px-2 text-xs"
            >
              {DIMENSIONS.map(d => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card">
              <tr>
                <th className="text-left py-2 px-2 font-medium text-muted-foreground border-b border-border min-w-[120px]">
                  {dimensionA.label} \ {dimensionB.label}
                </th>
                {cross.cols.map(c => (
                  <th key={c} className="text-center py-2 px-2 font-medium text-muted-foreground border-b border-border min-w-[70px]">
                    <span className="truncate block max-w-[80px]">{c}</span>
                  </th>
                ))}
                <th className="text-right py-2 px-2 font-medium text-muted-foreground border-b border-border">Tot</th>
              </tr>
            </thead>
            <tbody>
              {cross.rows.map(r => {
                const rowTotal = cross.cols.reduce((s, c) => s + cross.getValue(r, c), 0)
                return (
                  <tr key={r} className="border-b border-border/30">
                    <td className="py-1.5 px-2 font-medium truncate max-w-[150px]">{r}</td>
                    {cross.cols.map(c => {
                      const val = cross.getValue(r, c)
                      const intensity = maxVal > 0 ? val / maxVal : 0
                      return (
                        <td
                          key={c}
                          className="text-center py-1.5 px-2 font-mono"
                          style={{
                            background: val > 0 ? `rgba(59, 130, 246, ${0.1 + intensity * 0.5})` : 'transparent',
                          }}
                        >
                          {val > 0 ? formatNumber(val, 1) : '-'}
                        </td>
                      )
                    })}
                    <td className="text-right py-1.5 px-2 font-mono font-semibold">
                      {formatNumber(rowTotal, 1)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-semibold">
                <td className="py-2 px-2">Totale</td>
                {cross.cols.map(c => {
                  const colTotal = cross.rows.reduce((s, r) => s + cross.getValue(r, c), 0)
                  return (
                    <td key={c} className="text-center py-2 px-2 font-mono">{formatNumber(colTotal, 1)}</td>
                  )
                })}
                <td className="text-right py-2 px-2 font-mono">
                  {formatNumber(cross.rows.reduce((s, r) => s + cross.cols.reduce((s2, c) => s2 + cross.getValue(r, c), 0), 0), 1)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
          <span>Intensità:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 rounded" style={{ background: 'rgba(59, 130, 246, 0.1)' }} />
            <span>Bassa</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 rounded" style={{ background: 'rgba(59, 130, 246, 0.35)' }} />
            <span>Media</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-3 rounded" style={{ background: 'rgba(59, 130, 246, 0.6)' }} />
            <span>Alta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DimensionAnalysis() {
  const { processedData, hasData } = useData()
  const [activeDim, setActiveDim] = useState('tag')

  if (!hasData) return <Navigate to="/" replace />

  const items = processedData?.items || []
  const activeDimension = DIMENSIONS.find(d => d.key === activeDim)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-400" />
            Analisi Dimensionale
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analisi breakdown per Tag, Value Area, State, Type e Parent
          </p>
        </div>
      </div>

      <Tabs value={activeDim} onValueChange={setActiveDim}>
        <TabsList className="mb-4">
          {DIMENSIONS.map(d => (
            <TabsTrigger key={d.key} value={d.key} className="gap-1.5">
              <d.icon className="h-3.5 w-3.5" />
              {d.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {DIMENSIONS.map(d => (
          <TabsContent key={d.key} value={d.key}>
            <DimensionBreakdown items={items} dimension={d} />
          </TabsContent>
        ))}
      </Tabs>

      <CrossAnalysis items={items} />
    </div>
  )
}
