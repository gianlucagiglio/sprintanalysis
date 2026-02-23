import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge, classificationToVariant } from '@/components/ui/badge'
import { PROFESSIONAL_FAMILIES, CLASSIFICATION_COLORS, formatSP } from '@/lib/utils'

const EFFORT_FIELD_MAP = {
  'BE': 'effortBE',
  'FE': 'effortFE',
  'Design': 'effortDesign',
  'Analysis': 'effortAnalysis',
  'QA': 'effortQA',
  'Automation': 'effortAutomation',
  'Native': 'effortNative',
  'Platform Eng': 'effortPlatformEng',
}

function FamilyTab({ family, items, sprintTimeline }) {
  const field = EFFORT_FIELD_MAP[family]

  const pieData = useMemo(() => {
    const classEffort = { Strategic: 0, KTLO: 0, 'Small Change': 0, Other: 0, Unclassified: 0 }
    items.forEach(item => {
      const cls = item.classification || 'Unclassified'
      classEffort[cls] = (classEffort[cls] || 0) + (item[field] || 0)
    })
    return Object.entries(classEffort)
      .map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }))
      .filter(d => d.value > 0)
  }, [items, field])

  const totalEffort = pieData.reduce((s, d) => s + d.value, 0)

  const topItems = useMemo(() => {
    return [...items]
      .map(i => ({ ...i, familyEffort: i[field] || 0 }))
      .filter(i => i.familyEffort > 0)
      .sort((a, b) => b.familyEffort - a.familyEffort)
      .slice(0, 10)
  }, [items, field])

  const timelineData = useMemo(() => {
    const sprintMap = new Map()
    items.forEach(item => {
      if (!item.sprintInfo) return
      const key = item.sprintInfo.sprint
      if (!sprintMap.has(key)) {
        sprintMap.set(key, { sprint: key, label: item.sprintInfo.fullLabel, effort: 0 })
      }
      sprintMap.get(key).effort += (item[field] || 0)
    })
    return Array.from(sprintMap.values()).sort((a, b) => a.sprint - b.sprint)
  }, [items, field])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{family} Effort by Classification ({formatSP(Math.round(totalEffort))} total)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={CLASSIFICATION_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} SP`, 'Effort']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{family} Effort Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis />
                <Tooltip formatter={(val) => [`${Number(val).toFixed(1)} SP`, 'Effort']} />
                <Line type="monotone" dataKey="effort" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 10 Work Items - {family}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>{family} Effort</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono">{item.id}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.title}</TableCell>
                  <TableCell>
                    <Badge variant={classificationToVariant(item.classification)}>
                      {item.classification || 'Unclassified'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{formatSP(item.familyEffort)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfessionalAnalysis() {
  const { processedData, hasData } = useData()
  if (!hasData) return <Navigate to="/" replace />

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Professional Family Analysis</h2>

      <Tabs defaultValue="BE">
        <TabsList>
          {PROFESSIONAL_FAMILIES.map(f => (
            <TabsTrigger key={f} value={f}>{f}</TabsTrigger>
          ))}
        </TabsList>
        {PROFESSIONAL_FAMILIES.map(f => (
          <TabsContent key={f} value={f}>
            <FamilyTab
              family={f}
              items={processedData.items}
              sprintTimeline={processedData.sprintTimeline}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
