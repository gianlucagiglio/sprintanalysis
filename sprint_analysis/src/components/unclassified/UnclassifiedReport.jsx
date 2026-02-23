import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import MetricCard from '@/components/dashboard/MetricCard'
import { exportUnclassifiedFeatures } from '@/lib/export-utils'
import { formatSP } from '@/lib/utils'
import { AlertCircle, Download } from 'lucide-react'

export default function UnclassifiedReport() {
  const { processedData, hasData } = useData()
  const features = useMemo(() => {
    if (!processedData) return []
    return processedData.unclassifiedFeatures.sort((a, b) => b.childEffort - a.childEffort)
  }, [processedData])

  const totalUnclassifiedEffort = useMemo(() =>
    features.reduce((sum, f) => sum + f.childEffort, 0),
    [features]
  )

  const totalUnclassifiedItems = useMemo(() => {
    if (!processedData) return 0
    return processedData.classificationSummary.Unclassified.count
  }, [processedData])

  if (!hasData) return <Navigate to="/" replace />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Unclassified Report</h2>
        <Button variant="outline" size="sm" onClick={() => exportUnclassifiedFeatures(features)}>
          <Download className="h-4 w-4 mr-2" />
          Export for Classification
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          title="Unclassified Features"
          value={features.length}
          subtitle="need classification tags"
          icon={AlertCircle}
        />
        <MetricCard
          title="Unclassified Items"
          value={totalUnclassifiedItems}
          subtitle={`${processedData.coveragePercent.toFixed(1)}% coverage`}
          icon={AlertCircle}
        />
        <MetricCard
          title="Unclassified Effort"
          value={formatSP(Math.round(totalUnclassifiedEffort))}
          subtitle="SP without classification"
          icon={AlertCircle}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Features Missing Classification Tags</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Epic Parent</TableHead>
                <TableHead>Children</TableHead>
                <TableHead>Total Effort</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono">{f.id}</TableCell>
                  <TableCell className="max-w-xs truncate font-medium">{f.title}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{f.epicTitle}</TableCell>
                  <TableCell className="font-mono">{f.childCount}</TableCell>
                  <TableCell className="font-mono">{formatSP(f.childEffort)}</TableCell>
                  <TableCell>
                    <Badge variant="unclassified">Da Classificare</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {features.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    All features are classified!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
