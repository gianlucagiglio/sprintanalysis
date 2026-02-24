import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileSpreadsheet, Database, AlertCircle, BarChart3, TrendingUp, Users, Download } from 'lucide-react'
import { downloadTemplate } from '@/lib/template-generator'
import { downloadDemo4Sprint } from '@/lib/demo-4sprint'

export default function FileUpload() {
  const { loadFromExcel, loadSampleData, loading, error, hasData } = useData()
  const [dragActive, setDragActive] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx or .xls)')
      return
    }
    try {
      await loadFromExcel(file)
      navigate('/dashboard')
    } catch (e) {
      // error is set in context
    }
  }, [loadFromExcel, navigate])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleSample = useCallback(() => {
    loadSampleData()
    navigate('/dashboard')
  }, [loadSampleData, navigate])

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-xl space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25 mx-auto">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">FlowMetrics</h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-md mx-auto">
              Upload your Sprint Excel file to analyze effort distribution,
              classification coverage, and team velocity.
            </p>
          </div>
          {/* Feature pills */}
          <div className="flex items-center justify-center gap-2 pt-1">
            {[
              { icon: BarChart3, label: 'Effort Analysis' },
              { icon: TrendingUp, label: 'Velocity Tracking' },
              { icon: Users, label: 'Team Costs' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                <f.icon className="h-3 w-3" />
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Upload area */}
        <Card>
          <CardContent className="p-8">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
                ${dragActive
                  ? 'border-blue-400 bg-blue-50/50 scale-[1.01]'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }
                ${loading ? 'pointer-events-none opacity-50' : ''}
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {loading ? (
                <div className="space-y-3">
                  <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm text-muted-foreground">Parsing file...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto">
                    <Upload className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Drop your Excel file here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Supports .xlsx and .xls files —{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); downloadTemplate() }}
                      className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      download template
                    </button>
                    {' · '}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); downloadDemo4Sprint() }}
                      className="inline-flex items-center gap-1 text-violet-500 hover:text-violet-600 hover:underline cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      demo 4-sprint
                    </button>
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-destructive text-sm bg-red-50 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] text-muted-foreground uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Sample data */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl border-dashed hover:border-solid hover:bg-slate-50"
          onClick={handleSample}
        >
          <Database className="h-4 w-4 mr-2 text-violet-500" />
          Load Sample Data (Demo)
        </Button>

        {hasData && (
          <Button
            variant="secondary"
            className="w-full rounded-xl"
            onClick={() => navigate('/dashboard')}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Go to Dashboard (data already loaded)
          </Button>
        )}
      </div>
    </div>
  )
}
