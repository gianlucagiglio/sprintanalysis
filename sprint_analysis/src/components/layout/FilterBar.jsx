import { useState, useRef, useEffect } from 'react'
import { useData } from '@/context/DataContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ChevronDown, X, Filter, RotateCcw, Save, Bookmark, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { loadPresets, savePreset, deletePreset } from '@/lib/filter-presets'

function MultiSelect({ label, options, selected, onChange, className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div ref={ref} className={cn('relative min-w-0', className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center justify-between w-full h-8 px-2.5 rounded-md border text-xs transition-colors',
          selected.length > 0
            ? 'border-blue-400/50 bg-blue-500/10 text-blue-300'
            : 'border-input bg-background text-muted-foreground hover:bg-accent'
        )}
      >
        <span className="truncate">
          {selected.length === 0 ? label : `${label} (${selected.length})`}
        </span>
        <ChevronDown className={cn('h-3 w-3 ml-1.5 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] max-h-60 overflow-auto rounded-md border bg-popover p-1 shadow-lg">
          {options.length === 0 && (
            <div className="px-3 py-2 text-xs text-muted-foreground">Nessun valore</div>
          )}
          {options.map(opt => {
            const value = typeof opt === 'object' ? opt.value : opt
            const display = typeof opt === 'object' ? opt.label : String(opt)
            const isSelected = selected.includes(value)
            return (
              <button
                key={value}
                onClick={() => toggle(value)}
                className={cn(
                  'flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm cursor-pointer transition-colors',
                  isSelected ? 'bg-blue-500/15 text-blue-300' : 'hover:bg-accent text-foreground'
                )}
              >
                <div className={cn(
                  'w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0',
                  isSelected ? 'bg-blue-500 border-blue-500' : 'border-muted-foreground/40'
                )}>
                  {isSelected && <span className="text-[10px] text-white font-bold">✓</span>}
                </div>
                <span className="truncate">{display}</span>
              </button>
            )
          })}
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent mt-1 border-t border-border pt-1.5 cursor-pointer"
            >
              <X className="h-3 w-3" />
              Rimuovi filtro
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-[11px] text-blue-300 whitespace-nowrap">
      <span className="max-w-[150px] truncate">{label}</span>
      <button onClick={onRemove} className="hover:text-blue-100 transition-colors cursor-pointer">
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

export default function FilterBar() {
  const {
    hasData, filters, setFilter, resetFilters, resetAllFilters,
    availableFilters, hasActiveFilters, activeFilterCount,
    processedData, selectedQuarter, sprintRange, applyPreset,
    searchText, setSearchText,
  } = useData()

  const [presets, setPresets] = useState(() => loadPresets())
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState('')

  if (!hasData) return null

  const itemCount = processedData?.totalItems ?? 0
  const hasTemporalFilter = selectedQuarter !== 'all' || sprintRange[0] != null || sprintRange[1] != null
  const totalActiveFilters = activeFilterCount + (hasTemporalFilter ? 1 : 0)

  const handleSavePreset = () => {
    if (!presetName.trim()) return
    savePreset(presetName.trim(), filters)
    setPresets(loadPresets())
    setPresetName('')
    setSaveDialogOpen(false)
  }

  const handleDeletePreset = (id) => {
    deletePreset(id)
    setPresets(loadPresets())
  }

  const handleApplyPreset = (preset) => {
    applyPreset(preset.filters)
  }

  return (
    <div className="border-b bg-card/50">
      {/* Top bar: chips + item count + presets */}
      <div className="flex items-center gap-2 px-6 h-10">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Filtri</span>
          {totalActiveFilters > 0 && (
            <Badge variant="default" className="h-4 min-w-4 px-1 text-[10px] leading-none bg-blue-500 text-white border-0">
              {totalActiveFilters}
            </Badge>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1.5 ml-2 overflow-hidden">
            {filters.states.length > 0 && (
              <FilterChip label={`State: ${filters.states.join(', ')}`} onRemove={() => setFilter('states', [])} />
            )}
            {filters.types.length > 0 && (
              <FilterChip label={`Type: ${filters.types.join(', ')}`} onRemove={() => setFilter('types', [])} />
            )}
            {filters.tags.length > 0 && (
              <FilterChip label={`Tag: ${filters.tags.join(', ')}`} onRemove={() => setFilter('tags', [])} />
            )}
            {filters.valueArea.length > 0 && (
              <FilterChip label={`Area: ${filters.valueArea.join(', ')}`} onRemove={() => setFilter('valueArea', [])} />
            )}
            {filters.parentId != null && (
              <FilterChip label={`Parent: ${filters.parentId}`} onRemove={() => setFilter('parentId', null)} />
            )}
            {filters.itemId != null && (
              <FilterChip label={`ID: ${filters.itemId}`} onRemove={() => setFilter('itemId', null)} />
            )}
            {searchText.trim() && (
              <FilterChip label={`Cerca: "${searchText.trim()}"`} onRemove={() => setSearchText('')} />
            )}
          </div>
        )}

        {/* Saved presets pills */}
        {presets.length > 0 && (
          <div className="flex items-center gap-1.5 ml-2">
            <Bookmark className="h-3 w-3 text-muted-foreground shrink-0" />
            {presets.map(p => (
              <div key={p.id} className="flex items-center gap-0.5 group">
                <button
                  onClick={() => handleApplyPreset(p)}
                  className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-400/20 text-[11px] text-violet-300 hover:bg-violet-500/20 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {p.name}
                </button>
                <button
                  onClick={() => handleDeletePreset(p.id)}
                  className="opacity-0 group-hover:opacity-100 text-violet-400 hover:text-violet-200 transition-all cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-mono">
            {itemCount} items
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSaveDialogOpen(true)}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          )}
          {(hasActiveFilters || hasTemporalFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset All
            </Button>
          )}
        </div>
      </div>

      {/* Always visible filter controls */}
      <div className="grid grid-cols-7 gap-2 px-6 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Cerca titolo, ID, tag..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={cn(
              'flex h-8 w-full rounded-md border px-2.5 pl-7 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-0',
              searchText.trim()
                ? 'border-blue-400/50 bg-blue-500/10 text-blue-300'
                : 'border-input bg-background'
            )}
          />
          {searchText && (
            <button
              onClick={() => setSearchText('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <MultiSelect
          label="State"
          options={availableFilters.states}
          selected={filters.states}
          onChange={(v) => setFilter('states', v)}
        />
        <MultiSelect
          label="Type"
          options={availableFilters.types}
          selected={filters.types}
          onChange={(v) => setFilter('types', v)}
        />
        <MultiSelect
          label="Tags"
          options={availableFilters.tags}
          selected={filters.tags}
          onChange={(v) => setFilter('tags', v)}
        />
        <MultiSelect
          label="Value Area"
          options={availableFilters.valueAreas}
          selected={filters.valueArea}
          onChange={(v) => setFilter('valueArea', v)}
        />
        <input
          type="number"
          placeholder="Parent ID..."
          value={filters.parentId ?? ''}
          onChange={(e) => setFilter('parentId', e.target.value ? parseInt(e.target.value) : null)}
          className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-0"
        />
        <input
          type="number"
          placeholder="Item ID..."
          value={filters.itemId ?? ''}
          onChange={(e) => setFilter('itemId', e.target.value ? parseInt(e.target.value) : null)}
          className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-0"
        />
      </div>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent onClose={() => setSaveDialogOpen(false)} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Salva Preset Filtri</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome del preset..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSaveDialogOpen(false)}>
                Annulla
              </Button>
              <Button size="sm" onClick={handleSavePreset} disabled={!presetName.trim()}>
                Salva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
