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
import { Download, ArrowUpDown, ChevronRight, ChevronDown, FolderOpen, FileText, Layers } from 'lucide-react'

function EffortCells({ item }) {
  const parts = [
    item.effortBE > 0 && `BE ${item.effortBE}`,
    item.effortFE > 0 && `FE ${item.effortFE}`,
    item.effortDesign > 0 && `Des ${item.effortDesign}`,
    item.effortAnalysis > 0 && `Ana ${item.effortAnalysis}`,
    item.effortQA > 0 && `QA ${item.effortQA}`,
    item.effortNative > 0 && `Nat ${item.effortNative}`,
    item.effortAutomation > 0 && `Aut ${item.effortAutomation}`,
    item.effortPlatformEng > 0 && `PE ${item.effortPlatformEng}`,
  ].filter(Boolean)
  return (
    <span className="ml-auto flex items-center gap-2 shrink-0">
      {parts.length > 0 && (
        <span className="text-xs text-muted-foreground font-mono">{parts.join(' · ')}</span>
      )}
      <span className="font-mono text-xs font-semibold w-10 text-right">
        {item.totalEffort > 0 ? item.totalEffort.toFixed(1) : ''}
      </span>
    </span>
  )
}

function LeafRow({ item }) {
  return (
    <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/10 transition-colors">
      <span className="w-3" />
      <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
      <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
      <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">{item.type}</Badge>
      <span className="text-sm truncate">{item.title}</span>
      <EffortCells item={item} />
    </div>
  )
}

export default function EffortBreakdown() {
  const { processedData, hasData } = useData()
  const [sortField, setSortField] = useState('sprint')
  const [sortDir, setSortDir] = useState('asc')
  const [dialogData, setDialogData] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState(new Set())
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
    // Expand all nodes by default
    const allKeys = new Set()
    const classifications = ['Strategic', 'KTLO', 'Small Change', 'Other', 'Unclassified']
    classifications.forEach(cls => allKeys.add(`cls-${cls}`))
    const byId = new Map()
    items.forEach(i => byId.set(i.id, i))
    items.forEach(i => {
      if (i.type === 'Epic' || i.type === 'Feature') allKeys.add(`item-${i.id}`)
    })
    setExpandedNodes(allKeys)
  }

  const toggleNode = (key) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Build tree structure: Classification → Epic → Feature → Leaf items
  const dialogTree = useMemo(() => {
    if (!dialogData?.items) return []

    const items = dialogData.items
    const byId = new Map()
    items.forEach(i => byId.set(i.id, i))

    // Group by classification
    const classMap = new Map()
    const classifications = ['Strategic', 'KTLO', 'Small Change', 'Other', 'Unclassified']
    classifications.forEach(cls => classMap.set(cls, []))

    items.forEach(item => {
      const cls = item.classification || 'Unclassified'
      if (!classMap.has(cls)) classMap.set(cls, [])
      classMap.get(cls).push(item)
    })

    // For each classification, build Epic → Feature → children hierarchy
    const tree = []
    for (const [cls, clsItems] of classMap) {
      if (clsItems.length === 0) continue

      const totalEffort = clsItems.reduce((s, i) => s + (i.totalEffort || 0), 0)

      // Separate by type
      const epics = clsItems.filter(i => i.type === 'Epic')
      const features = clsItems.filter(i => i.type === 'Feature')
      const leaves = clsItems.filter(i => i.type !== 'Epic' && i.type !== 'Feature')

      // Build Feature → children map
      const featureChildren = new Map()
      features.forEach(f => featureChildren.set(f.id, []))
      leaves.forEach(leaf => {
        if (leaf.parent && featureChildren.has(leaf.parent)) {
          featureChildren.get(leaf.parent).push(leaf)
        }
      })

      // Leaves not under any feature in this sprint
      const orphanLeaves = leaves.filter(leaf => !leaf.parent || !featureChildren.has(leaf.parent))

      // Build Epic → features map
      const epicFeatures = new Map()
      epics.forEach(e => epicFeatures.set(e.id, []))
      features.forEach(f => {
        if (f.parent && epicFeatures.has(f.parent)) {
          epicFeatures.get(f.parent).push(f)
        }
      })

      // Features not under any epic in this sprint
      const orphanFeatures = features.filter(f => !f.parent || !epicFeatures.has(f.parent))

      const epicNodes = epics.map(epic => ({
        type: 'epic',
        item: epic,
        effort: epic.totalEffort || 0,
        features: (epicFeatures.get(epic.id) || []).map(feat => ({
          type: 'feature',
          item: feat,
          effort: feat.totalEffort || 0,
          children: featureChildren.get(feat.id) || [],
        })),
      }))

      const orphanFeatureNodes = orphanFeatures.map(feat => ({
        type: 'feature',
        item: feat,
        effort: feat.totalEffort || 0,
        children: featureChildren.get(feat.id) || [],
      }))

      tree.push({
        classification: cls,
        count: clsItems.length,
        totalEffort,
        epics: epicNodes,
        orphanFeatures: orphanFeatureNodes,
        orphanLeaves,
      })
    }

    return tree
  }, [dialogData])

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
        <DialogContent className="max-w-6xl max-h-[90vh]" onClose={() => setDialogData(null)}>
          <DialogHeader>
            <DialogTitle className="text-xl">
              Sprint {dialogData?.sprint?.label} — {dialogData?.sprint?.quarter}
              <span className="text-muted-foreground text-sm font-normal ml-3">
                {dialogData?.items?.length} items — {dialogData?.sprint?.total?.toFixed(1)} effort
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[calc(90vh-100px)] overflow-auto pr-1">
            {dialogTree.map(cls => (
              <div key={cls.classification} className="mb-3">
                {/* Classification level */}
                <button
                  className="flex items-center gap-2 w-full text-left py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                  onClick={() => toggleNode(`cls-${cls.classification}`)}
                >
                  {expandedNodes.has(`cls-${cls.classification}`)
                    ? <ChevronDown className="h-4 w-4 shrink-0" />
                    : <ChevronRight className="h-4 w-4 shrink-0" />}
                  <Badge variant={classificationToVariant(cls.classification)} className="text-xs">
                    {cls.classification}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {cls.count} items
                  </span>
                  <span className="ml-auto font-mono text-sm font-semibold">
                    {cls.totalEffort.toFixed(1)}
                  </span>
                </button>

                {expandedNodes.has(`cls-${cls.classification}`) && (
                  <div className="ml-4 border-l border-border pl-2">
                    {/* Epics */}
                    {cls.epics.map(epicNode => (
                      <div key={epicNode.item.id} className="mb-1">
                        <button
                          className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded hover:bg-muted/30 transition-colors"
                          onClick={() => toggleNode(`item-${epicNode.item.id}`)}
                        >
                          {epicNode.features.length > 0
                            ? (expandedNodes.has(`item-${epicNode.item.id}`)
                              ? <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                              : <ChevronRight className="h-3.5 w-3.5 shrink-0" />)
                            : <span className="w-3.5" />}
                          <Layers className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                          <span className="font-mono text-xs text-muted-foreground">{epicNode.item.id}</span>
                          <span className="text-sm truncate">{epicNode.item.title}</span>
                          <span className="ml-auto font-mono text-xs">{epicNode.effort > 0 ? epicNode.effort.toFixed(1) : ''}</span>
                        </button>

                        {expandedNodes.has(`item-${epicNode.item.id}`) && epicNode.features.length > 0 && (
                          <div className="ml-5 border-l border-border/50 pl-2">
                            {epicNode.features.map(featNode => (
                              <div key={featNode.item.id} className="mb-0.5">
                                <button
                                  className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-muted/20 transition-colors"
                                  onClick={() => toggleNode(`item-${featNode.item.id}`)}
                                >
                                  {featNode.children.length > 0
                                    ? (expandedNodes.has(`item-${featNode.item.id}`)
                                      ? <ChevronDown className="h-3 w-3 shrink-0" />
                                      : <ChevronRight className="h-3 w-3 shrink-0" />)
                                    : <span className="w-3" />}
                                  <FolderOpen className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                  <span className="font-mono text-xs text-muted-foreground">{featNode.item.id}</span>
                                  <span className="text-sm truncate">{featNode.item.title}</span>
                                  <EffortCells item={featNode.item} />
                                </button>

                                {expandedNodes.has(`item-${featNode.item.id}`) && featNode.children.length > 0 && (
                                  <div className="ml-5 border-l border-border/30 pl-2">
                                    {featNode.children.map(child => (
                                      <LeafRow key={child.id} item={child} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Orphan Features (no epic parent in this sprint) */}
                    {cls.orphanFeatures.map(featNode => (
                      <div key={featNode.item.id} className="mb-0.5">
                        <button
                          className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-muted/20 transition-colors"
                          onClick={() => toggleNode(`item-${featNode.item.id}`)}
                        >
                          {featNode.children.length > 0
                            ? (expandedNodes.has(`item-${featNode.item.id}`)
                              ? <ChevronDown className="h-3 w-3 shrink-0" />
                              : <ChevronRight className="h-3 w-3 shrink-0" />)
                            : <span className="w-3" />}
                          <FolderOpen className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                          <span className="font-mono text-xs text-muted-foreground">{featNode.item.id}</span>
                          <span className="text-sm truncate">{featNode.item.title}</span>
                          <EffortCells item={featNode.item} />
                        </button>

                        {expandedNodes.has(`item-${featNode.item.id}`) && featNode.children.length > 0 && (
                          <div className="ml-5 border-l border-border/30 pl-2">
                            {featNode.children.map(child => (
                              <LeafRow key={child.id} item={child} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Orphan leaves (no feature/epic parent in this sprint) */}
                    {cls.orphanLeaves.map(item => (
                      <LeafRow key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
