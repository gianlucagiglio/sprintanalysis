import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge, classificationToVariant } from '@/components/ui/badge'
import { exportSprintData } from '@/lib/export-utils'
import { PROFESSIONAL_FAMILIES } from '@/lib/utils'
import { Download, ArrowUpDown } from 'lucide-react'

export default function EffortBreakdown() {
  const { processedData, hasData } = useData()
  const [sortField, setSortField] = useState('sprint')
  const [sortDir, setSortDir] = useState('asc')
  const [dialogData, setDialogData] = useState(null)
  const [view, setView] = useState('classification') // 'classification' | 'family'

  const tableData = useMemo(() => {
    if (!processedData) return []
    let data = [...processedData.sprintTimeline]
    data.sort((a, b) => {
      const aVal = a[sortField] ?? 0
      const bVal = b[sortField] ?? 0
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal || '') : (bVal || '').localeCompare(aVal)
      return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })
    return data
  }, [processedData, sortField, sortDir])

  // Totals row
  const totals = useMemo(() => {
    if (!tableData.length) return null
    const t = { sprint: 'TOTAL', label: '', fullLabel: '', quarter: '' }
    const fields = ['Strategic', 'KTLO', 'Small Change', 'Other', 'Unclassified', 'total',
      ...PROFESSIONAL_FAMILIES.map(f => `effort_${f}`)]
    fields.forEach(f => { t[f] = tableData.reduce((s, r) => s + (r[f] || 0), 0) })
    return t
  }, [tableData])

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const handleRowClick = (sprint) => {
    const items = processedData.items.filter(i => i.sprintInfo?.sprint === sprint.sprint)
    setDialogData({ sprint, items })
  }

  if (!hasData) return <Navigate to="/" replace />

  const SortHeader = ({ field, children, className }) => (
    <TableHead
      className={`cursor-pointer select-none hover:text-foreground ${className || ''}`}
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </TableHead>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Effort Breakdown</h2>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => exportSprintData(processedData.sprintTimeline)}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="classification" onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="classification">By Classification</TabsTrigger>
          <TabsTrigger value="family">By Professional Family</TabsTrigger>
        </TabsList>

        {/* Classification view */}
        <TabsContent value="classification">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHeader field="sprint">Sprint</SortHeader>
                    <SortHeader field="quarter">Quarter</SortHeader>
                    <SortHeader field="Strategic">Strategic</SortHeader>
                    <SortHeader field="KTLO">KTLO</SortHeader>
                    <SortHeader field="Small Change">Small Ch.</SortHeader>
                    <SortHeader field="Other">Other</SortHeader>
                    <SortHeader field="Unclassified">Unclass.</SortHeader>
                    <SortHeader field="total">Total</SortHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map(row => (
                    <TableRow key={row.sprint} className="cursor-pointer" onClick={() => handleRowClick(row)}>
                      <TableCell className="font-mono font-medium">{row.label}</TableCell>
                      <TableCell>{row.quarter}</TableCell>
                      <TableCell className="font-mono">{row.Strategic.toFixed(1)}</TableCell>
                      <TableCell className="font-mono">{row.KTLO.toFixed(1)}</TableCell>
                      <TableCell className="font-mono">{row['Small Change'].toFixed(1)}</TableCell>
                      <TableCell className="font-mono">{row.Other.toFixed(1)}</TableCell>
                      <TableCell className="font-mono">{row.Unclassified.toFixed(1)}</TableCell>
                      <TableCell className="font-mono font-bold">{row.total.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                  {totals && (
                    <TableRow className="bg-muted/50 font-bold border-t-2">
                      <TableCell className="font-mono">TOTAL</TableCell>
                      <TableCell></TableCell>
                      <TableCell className="font-mono">{totals.Strategic.toFixed(1)}</TableCell>
                      <TableCell className="font-mono">{totals.KTLO.toFixed(1)}</TableCell>
                      <TableCell className="font-mono">{totals['Small Change'].toFixed(1)}</TableCell>
                      <TableCell className="font-mono">{totals.Other.toFixed(1)}</TableCell>
                      <TableCell className="font-mono">{totals.Unclassified.toFixed(1)}</TableCell>
                      <TableCell className="font-mono">{totals.total.toFixed(1)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Family view */}
        <TabsContent value="family">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHeader field="sprint">Sprint</SortHeader>
                    <SortHeader field="quarter">Quarter</SortHeader>
                    {PROFESSIONAL_FAMILIES.map(f => (
                      <SortHeader key={f} field={`effort_${f}`}>{f}</SortHeader>
                    ))}
                    <SortHeader field="total">Total</SortHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.map(row => (
                    <TableRow key={row.sprint} className="cursor-pointer" onClick={() => handleRowClick(row)}>
                      <TableCell className="font-mono font-medium">{row.label}</TableCell>
                      <TableCell>{row.quarter}</TableCell>
                      {PROFESSIONAL_FAMILIES.map(f => (
                        <TableCell key={f} className="font-mono">
                          {(row[`effort_${f}`] || 0).toFixed(1)}
                        </TableCell>
                      ))}
                      <TableCell className="font-mono font-bold">{row.total.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                  {totals && (
                    <TableRow className="bg-muted/50 font-bold border-t-2">
                      <TableCell className="font-mono">TOTAL</TableCell>
                      <TableCell></TableCell>
                      {PROFESSIONAL_FAMILIES.map(f => (
                        <TableCell key={f} className="font-mono">
                          {(totals[`effort_${f}`] || 0).toFixed(1)}
                        </TableCell>
                      ))}
                      <TableCell className="font-mono">{totals.total.toFixed(1)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drill-down dialog */}
      <Dialog open={!!dialogData} onOpenChange={() => setDialogData(null)}>
        <DialogContent className="max-w-3xl" onClose={() => setDialogData(null)}>
          <DialogHeader>
            <DialogTitle>
              Sprint {dialogData?.sprint?.label} — {dialogData?.sprint?.quarter}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Classification</TableHead>
                  <TableHead>BE</TableHead>
                  <TableHead>FE</TableHead>
                  <TableHead>Design</TableHead>
                  <TableHead>Analysis</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dialogData?.items?.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.id}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant={classificationToVariant(item.classification)}>
                        {item.classification || 'Unclassified'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{(item.effortBE || 0) > 0 ? item.effortBE : ''}</TableCell>
                    <TableCell className="font-mono">{(item.effortFE || 0) > 0 ? item.effortFE : ''}</TableCell>
                    <TableCell className="font-mono">{(item.effortDesign || 0) > 0 ? item.effortDesign : ''}</TableCell>
                    <TableCell className="font-mono">{(item.effortAnalysis || 0) > 0 ? item.effortAnalysis : ''}</TableCell>
                    <TableCell className="font-mono font-bold">{item.totalEffort > 0 ? item.totalEffort.toFixed(1) : ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
