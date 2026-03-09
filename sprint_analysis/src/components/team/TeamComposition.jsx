import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { useTeam } from '@/context/TeamContext'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { PROFESSIONAL_FAMILIES, OVERHEAD_FAMILIES, formatNumber } from '@/lib/utils'
import { Plus, Trash2, Users, Euro, Calendar } from 'lucide-react'

export default function TeamComposition() {
  const { hasData, availableSprints } = useData()
  const {
    periods, addPeriod, removePeriod, updatePeriod, updateMember,
    getTotalTeamSize, costConfig, updateCostConfig, getSprintCost,
  } = useTeam()
  const costSummary = useMemo(() => {
    const teamSize = periods.length > 0 ? getTotalTeamSize(periods[0]) : 0
    const sprintCost = teamSize * costConfig.sprintDays * costConfig.costPerDay
    const monthlyCost = sprintCost * 2 // ~2 sprints per month
    const yearlyCost = sprintCost * 26 // ~26 sprints per year
    return { teamSize, sprintCost, monthlyCost, yearlyCost }
  }, [periods, costConfig, getTotalTeamSize])

  if (!hasData) return <Navigate to="/" replace />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Composition & Costs</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Define the team size per professional family and i parametri di costo.
          </p>
        </div>
        <Button onClick={addPeriod}>
          <Plus className="h-4 w-4 mr-2" />
          Add Period
        </Button>
      </div>

      {/* Cost configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Euro className="h-4 w-4" />
            Cost Parameters
          </CardTitle>
          <CardDescription>
            These values are used to calculate sprint and project costs based on team composition.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            {/* Cost per day */}
            <div>
              <label className="text-sm font-medium block mb-2">Average cost per person per day</label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-muted-foreground">€</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={costConfig.costPerDay}
                  onChange={(e) => updateCostConfig({ costPerDay: Math.max(0, parseFloat(e.target.value) || 0) })}
                  className="w-36 rounded-md border border-input bg-background px-3 py-2 text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-sm text-muted-foreground">/ day</span>
              </div>
            </div>

            {/* Sprint duration */}
            <div>
              <label className="text-sm font-medium block mb-2">Sprint duration (working days)</label>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={costConfig.sprintDays}
                  onChange={(e) => updateCostConfig({ sprintDays: Math.max(1, parseInt(e.target.value) || 10) })}
                  className="w-24 rounded-md border border-input bg-background px-3 py-2 text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
          </div>

          {/* Cost preview */}
          {costSummary.teamSize > 0 && (
            <>
              <Separator className="my-4" />
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground font-medium">Cost per Sprint</p>
                  <p className="text-xl font-bold font-mono mt-1">€{formatNumber(costSummary.sprintCost)}</p>
                  <p className="text-xs text-muted-foreground">
                    {costSummary.teamSize} people × {costConfig.sprintDays}d × €{costConfig.costPerDay}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground font-medium">Estimated Monthly</p>
                  <p className="text-xl font-bold font-mono mt-1">€{formatNumber(costSummary.monthlyCost)}</p>
                  <p className="text-xs text-muted-foreground">~2 sprints/month</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground font-medium">Estimated Yearly</p>
                  <p className="text-xl font-bold font-mono mt-1">€{formatNumber(costSummary.yearlyCost)}</p>
                  <p className="text-xs text-muted-foreground">~26 sprints/year</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Team periods */}
      {periods.map((period) => (
        <Card key={period.id}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-base">
                  <input
                    type="text"
                    value={period.label}
                    onChange={(e) => updatePeriod(period.id, { label: e.target.value })}
                    className="bg-transparent border-b border-transparent hover:border-input focus:border-primary focus:outline-none px-1 py-0.5 text-base font-semibold"
                  />
                </CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Sprint</span>
                  <div className="w-32">
                    <Select
                      value={period.fromSprint ?? ''}
                      onChange={(e) => updatePeriod(period.id, {
                        fromSprint: e.target.value ? parseInt(e.target.value) : null
                      })}
                    >
                      <option value="">From...</option>
                      {availableSprints.map(s => (
                        <option key={s.sprint} value={s.sprint}>{s.label}</option>
                      ))}
                    </Select>
                  </div>
                  <span className="text-muted-foreground">—</span>
                  <div className="w-32">
                    <Select
                      value={period.toSprint ?? ''}
                      onChange={(e) => updatePeriod(period.id, {
                        toSprint: e.target.value ? parseInt(e.target.value) : null
                      })}
                    >
                      <option value="">To...</option>
                      {availableSprints.map(s => (
                        <option key={s.sprint} value={s.sprint}>{s.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {getTotalTeamSize(period)} people
                </span>
                <span className="text-sm font-mono text-muted-foreground">
                  €{formatNumber(getSprintCost(period))}/sprint
                </span>
                {periods.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removePeriod(period.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {PROFESSIONAL_FAMILIES.map(family => (
                <div key={family} className="text-center">
                  <label className="text-xs font-medium text-muted-foreground block mb-2">{family}</label>
                  <input
                    type="number"
                    min="0"
                    value={period.members[family] || 0}
                    onChange={(e) => updateMember(period.id, family, e.target.value)}
                    className="w-full text-center rounded-md border border-input bg-background px-2 py-2 text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-3">Management / Overhead</p>
              <div className="grid grid-cols-7 gap-4">
                {OVERHEAD_FAMILIES.map(family => (
                  <div key={family} className="text-center">
                    <label className="text-xs font-medium text-muted-foreground block mb-2">{family}</label>
                    <input
                      type="number"
                      min="0"
                      value={period.members[family] || 0}
                      onChange={(e) => updateMember(period.id, family, e.target.value)}
                      className="w-full text-center rounded-md border border-input bg-background px-2 py-2 text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Create multiple periods if the team composition changes over time.
            The sprint range defines when each configuration was active.
            Leave sprint range empty for a default/fallback team composition.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
