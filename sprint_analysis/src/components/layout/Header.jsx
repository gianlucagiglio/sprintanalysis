import { useData } from '@/context/DataContext'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { FileSpreadsheet, Trash2, SlidersHorizontal } from 'lucide-react'

export default function Header() {
  const {
    fileName, hasData, clearData,
    selectedQuarter, setSelectedQuarter,
    availableQuarters, availableSprints,
    sprintRange, setSprintRange,
  } = useData()

  return (
    <header className="h-14 border-b flex items-center justify-between px-6 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {hasData && (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">{fileName}</span>
            </div>
          </>
        )}
      </div>

      {hasData && (
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />

          <div className="w-40">
            <Select
              value={selectedQuarter}
              onChange={(e) => {
                setSelectedQuarter(e.target.value)
                setSprintRange([null, null])
              }}
            >
              <option value="all">All Quarters</option>
              {availableQuarters.map(q => (
                <option key={q.key} value={q.key}>{q.label}</option>
              ))}
            </Select>
          </div>

          <div className="w-32">
            <Select
              value={sprintRange[0] ?? ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : null
                setSprintRange([val, sprintRange[1]])
              }}
            >
              <option value="">From...</option>
              {availableSprints.map(s => (
                <option key={s.sprint} value={s.sprint}>{s.label}</option>
              ))}
            </Select>
          </div>
          <span className="text-xs text-muted-foreground">—</span>
          <div className="w-32">
            <Select
              value={sprintRange[1] ?? ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : null
                setSprintRange([sprintRange[0], val])
              }}
            >
              <option value="">To...</option>
              {availableSprints.map(s => (
                <option key={s.sprint} value={s.sprint}>{s.label}</option>
              ))}
            </Select>
          </div>

          {(selectedQuarter !== 'all' || sprintRange[0] || sprintRange[1]) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSelectedQuarter('all'); setSprintRange([null, null]) }}
              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Reset
            </Button>
          )}

          <div className="w-px h-6 bg-border mx-1" />

          <Button variant="ghost" size="sm" onClick={clearData} className="text-muted-foreground hover:text-destructive hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Clear
          </Button>
        </div>
      )}
    </header>
  )
}
