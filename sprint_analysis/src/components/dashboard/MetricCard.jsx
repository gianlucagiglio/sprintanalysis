import { Card, CardContent } from '@/components/ui/card'

const ICON_COLORS = [
  { bg: 'bg-blue-50', text: 'text-blue-500' },
  { bg: 'bg-emerald-50', text: 'text-emerald-500' },
  { bg: 'bg-violet-50', text: 'text-violet-500' },
  { bg: 'bg-amber-50', text: 'text-amber-500' },
  { bg: 'bg-rose-50', text: 'text-rose-500' },
]

export default function MetricCard({ title, value, subtitle, icon: Icon, colorIndex = 0 }) {
  const color = ICON_COLORS[colorIndex % ICON_COLORS.length]

  return (
    <Card className="card-hover">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold font-mono tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${color.text}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
