import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen, Upload, GitBranch, Filter, LayoutDashboard, TrendingUp,
  Gauge, Table2, FolderTree, BarChart3, UserCog, AlertCircle, Layers,
  Clock, RefreshCw, HeartPulse, AlertTriangle, Columns2, ShieldAlert,
  ClipboardList, Info, ChevronDown, ChevronRight, Hash,
} from 'lucide-react'

function InfoCallout({ children }) {
  return (
    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 flex gap-3 text-sm">
      <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
      <div className="text-blue-300">{children}</div>
    </div>
  )
}

function Code({ children }) {
  return <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm">{children}</code>
}

function FormulaBlock({ children }) {
  return (
    <div className="rounded-lg bg-muted/50 border border-border p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed">
      {children}
    </div>
  )
}

function Section({ id, icon: Icon, title, description, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card id={id}>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          {open
            ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          }
          <Icon className="h-5 w-5 text-blue-400 shrink-0" />
          <div className="flex-1">
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      {open && <CardContent className="space-y-4 pt-0">{children}</CardContent>}
    </Card>
  )
}

const TOC = [
  { id: 'upload', label: 'Upload & Parsing' },
  { id: 'pipeline', label: 'Pipeline di Elaborazione' },
  { id: 'classification', label: 'Sistema di Classificazione' },
  { id: 'filters', label: 'Sistema di Filtri' },
  { id: 'executive', label: 'Executive Dashboard' },
  { id: 'timeline', label: 'Sprint Timeline' },
  { id: 'velocity', label: 'Velocity Dashboard' },
  { id: 'effort', label: 'Effort Breakdown' },
  { id: 'epics', label: 'Epic Explorer' },
  { id: 'professional', label: 'Professional Family Analysis' },
  { id: 'team', label: 'Team Composition & Costs' },
  { id: 'unclassified', label: 'Unclassified Report' },
  { id: 'dimensions', label: 'Dimension Analysis' },
  { id: 'cycletime', label: 'Cycle Time Dashboard' },
  { id: 'carryover', label: 'Carry-Over Dashboard' },
  { id: 'health', label: 'Sprint Health Dashboard' },
  { id: 'anomaly', label: 'Anomaly Dashboard' },
  { id: 'comparison', label: 'Sprint Comparison' },
  { id: 'incidents', label: 'Incident Dashboard' },
  { id: 'formulas', label: 'Riepilogo Formule' },
]

export default function HowItWorks() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-400" />
          Come Funziona
        </h2>
        <p className="text-muted-foreground mt-1">
          Guida completa alla logica di ogni sezione: dati, formule, interpretazione dei risultati.
        </p>
      </div>

      {/* Table of Contents */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-blue-400" />
            Indice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
            {TOC.map((item, i) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-left text-xs px-2 py-1.5 rounded hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <span className="font-mono text-[10px] text-muted-foreground w-4">{i + 1}</span>
                {item.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 1. Upload & Parsing */}
      <Section id="upload" icon={Upload} title="1. Upload & Parsing dei Dati" description="Come i dati Excel vengono letti e trasformati in dati strutturati">
        <p className="text-sm">Carica un file Excel esportato dal backlog (es. Azure DevOps). Il parser legge le intestazioni e mappa le colonne ai campi interni.</p>

        <p className="text-sm font-medium">Colonne riconosciute:</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colonna Excel</TableHead>
              <TableHead>Campo interno</TableHead>
              <TableHead>Tipo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ['ID', 'id', 'Numero'],
              ['Work Item Type', 'type', 'Epic, Feature, Bug, Task...'],
              ['Title', 'title', 'Stringa'],
              ['State', 'state', 'New, Active, Closed...'],
              ['Tags', 'tags', 'Separati da ;'],
              ['Iteration Path', 'iterationPath', 'Main\\2025-Q1\\136'],
              ['Parent', 'parent', 'Titolo del parent (risolto a ID)'],
              ['Effort (BE/FE/...)', 'effortBE, effortFE...', 'Story Points per famiglia'],
              ['Effort', 'effort', 'Fallback generico'],
              ['Created/Changed/Closed Date', 'createdDate...', 'Date'],
              ['Start/Finish Date', 'startDate, finishDate', 'Date'],
              ['Value Area', 'valueArea', 'Stringa'],
              ['Severity', 'severity', '1 - Critical...4 - Low'],
              ['Priority', 'priority', '1-4'],
            ].map(([col, field, tipo]) => (
              <TableRow key={col}>
                <TableCell><Code>{col}</Code></TableCell>
                <TableCell className="font-mono text-xs">{field}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{tipo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className="text-sm font-medium">Calcolo dell'Effort Totale:</p>
        <FormulaBlock>
{`totalEffort = effortAnalysis + effortBE + effortFE + effortDesign
            + effortQA + effortAutomation + effortNative + effortPlatformEng

Se la somma = 0, si usa il campo "effort" generico come fallback.`}
        </FormulaBlock>

        <InfoCallout>
          I dati vengono salvati in <Code>localStorage</Code> con versioning automatico: quando il parser cambia versione, la cache viene invalidata.
        </InfoCallout>
      </Section>

      {/* 2. Pipeline */}
      <Section id="pipeline" icon={GitBranch} title="2. Pipeline di Elaborazione" description="Il flusso completo di processing dei dati grezzi">
        <FormulaBlock>
{`Excel grezzo
  |
  v
1. classifyItems()     --> Assegna classificazione a ogni item
  |
  v
2. calculateEffort()   --> Calcola totalEffort per ogni item
  |
  v
3. extractSprintInfo() --> Estrae sprint/quarter dall'Iteration Path
  |
  v
4. getEffortByFamily() --> Mappa effort per famiglia professionale
  |
  v
5. Risoluzione Value Area --> Risale la parent chain per "Same as parent"
  |
  v
6. buildHierarchy()    --> Costruisce albero Epic > Feature > Children
  |
  v
7. Aggregazione        --> Calcola summary, timeline, top epics, ecc.`}
        </FormulaBlock>

        <p className="text-sm font-medium">Parsing dell'Iteration Path:</p>
        <FormulaBlock>
{`Formato: Main\\YYYY-Qn\\NNN
Esempio: Main\\2025-Q1\\136

Risultato:
  year     = 2025
  quarter  = Q1
  sprint   = 136
  label    = S136
  fullLabel = Q1 S136`}
        </FormulaBlock>

        <p className="text-sm font-medium">Output della pipeline:</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            ['items', 'Tutti gli item processati'],
            ['hierarchy', 'Albero Epic > Feature > Children'],
            ['classificationSummary', 'Conteggio e effort per classificazione'],
            ['totalItems / totalEffort', 'Metriche aggregate'],
            ['coveragePercent', 'Copertura della classificazione'],
            ['effortByFamily', 'Effort per famiglia professionale'],
            ['sprintTimeline', 'Dati per-sprint'],
            ['topEpics', 'Top 10 Epic per effort'],
            ['unclassifiedFeatures', 'Feature senza classificazione'],
            ['typeDistribution', 'Distribuzione per tipo di work item'],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2 items-start">
              <Code>{k}</Code>
              <span className="text-muted-foreground text-xs">{v}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* 3. Classificazione */}
      <Section id="classification" icon={Hash} title="3. Sistema di Classificazione" description="Come ogni work item riceve una categoria di lavoro">
        <p className="text-sm font-medium">Categorie:</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Classificazione</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Significato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><span className="text-blue-400 font-medium">Strategic</span></TableCell>
              <TableCell><Code>strategic</Code></TableCell>
              <TableCell className="text-sm text-muted-foreground">Valore di business nuovo</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><span className="text-amber-400 font-medium">KTLO</span></TableCell>
              <TableCell><Code>ktlo</Code></TableCell>
              <TableCell className="text-sm text-muted-foreground">Manutenzione, debito tecnico</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><span className="text-emerald-400 font-medium">Small Change</span></TableCell>
              <TableCell><Code>small change</Code> / <Code>small</Code></TableCell>
              <TableCell className="text-sm text-muted-foreground">Modifiche minori, fix rapidi</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><span className="text-slate-400 font-medium">Other</span></TableCell>
              <TableCell>Qualsiasi altro tag</TableCell>
              <TableCell className="text-sm text-muted-foreground">Con tag ma non classificabile</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><span className="text-red-400 font-medium">Unclassified</span></TableCell>
              <TableCell>Nessun tag</TableCell>
              <TableCell className="text-sm text-muted-foreground">Nessuna classificazione</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <p className="text-sm font-medium">Catena di risoluzione (dall'alto al basso):</p>
        <FormulaBlock>
{`1. L'Epic ha un tag di classificazione?
   SI --> Tutti i figli ereditano dall'Epic
   NO --> vai al punto 2

2. La Feature ha un tag di classificazione?
   SI --> I children ereditano dalla Feature
   NO --> vai al punto 3

3. L'item ha un tag proprio?
   SI --> Usa la sua classificazione
   NO --> Risulta "Unclassified"

4. BONUS: Epic senza classificazione propria
   --> Eredita dalla classificazione piu comune delle sue Feature
   --> Peso: per effort (se disponibile), altrimenti per conteggio`}
        </FormulaBlock>

        <InfoCallout>
          Il match dei tag e <strong>case-insensitive</strong>. I tag sono separati da <Code>;</Code>. Il primo tag di classificazione trovato vince.
        </InfoCallout>
      </Section>

      {/* 4. Filtri */}
      <Section id="filters" icon={Filter} title="4. Sistema di Filtri" description="Filtri temporali e dimensionali con ri-aggregazione automatica">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium mb-2">Filtri Temporali</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>Quarter:</strong> seleziona un quarter o "all"</li>
              <li><strong>Sprint Range:</strong> slider min-max</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Filtri Dimensionali (logica AND)</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li><strong>Tags:</strong> filtra per tag</li>
              <li><strong>Value Area:</strong> area di valore</li>
              <li><strong>States:</strong> stato (New, Active, Closed)</li>
              <li><strong>Types:</strong> tipo di work item</li>
              <li><strong>Parent/Item ID:</strong> item specifico</li>
            </ul>
          </div>
        </div>
        <InfoCallout>
          I filtri vengono sincronizzati nei parametri URL, permettendo di condividere link con filtri pre-applicati.
        </InfoCallout>
      </Section>

      {/* 5. Executive Dashboard */}
      <Section id="executive" icon={LayoutDashboard} title="5. Executive Dashboard" description="Vista d'insieme del progetto: distribuzione effort e classificazioni">
        <p className="text-sm font-medium">KPI:</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>KPI</TableHead>
              <TableHead>Formula</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ['Total Items', 'count(items)'],
              ['Total Story Points', 'sum(totalEffort)'],
              ['Coverage %', 'classifiedCount / totalItems * 100'],
              ['Unclassified', 'count(items senza classificazione)'],
            ].map(([kpi, formula]) => (
              <TableRow key={kpi}>
                <TableCell className="font-medium">{kpi}</TableCell>
                <TableCell><Code>{formula}</Code></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className="text-sm font-medium">Grafici:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Pie Chart:</strong> distribuzione per classificazione (count)</li>
          <li><strong>Bar Chart:</strong> effort per classificazione (SP)</li>
          <li><strong>Bar Chart:</strong> SP per famiglia professionale</li>
          <li><strong>Bar Chart:</strong> Top 10 Epic per effort (somma discendenti)</li>
        </ul>
      </Section>

      {/* 6. Timeline */}
      <Section id="timeline" icon={TrendingUp} title="6. Sprint Timeline" description="Evoluzione dell'effort nel tempo, sprint dopo sprint">
        <p className="text-sm font-medium">Grafici:</p>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li><strong>Stacked Area Chart:</strong> effort per classificazione sprint dopo sprint. Le aree sono impilate (Strategic + KTLO + Small Change + Other + Unclassified).</li>
          <li><strong>Strategic % Trend:</strong> percentuale di lavoro Strategic nel tempo.</li>
        </ul>

        <FormulaBlock>strategicPct = Strategic_SP / total_SP * 100</FormulaBlock>

        <InfoCallout>
          Si puo filtrare per singola famiglia professionale (es. solo BE). Il grafico ricalcola l'effort usando solo il campo specifico della famiglia selezionata.
        </InfoCallout>
      </Section>

      {/* 7. Velocity */}
      <Section id="velocity" icon={Gauge} title="7. Velocity Dashboard" description="Velocita del team, costi, burndown e produttivita individuale">
        <p className="text-sm font-medium">KPI principali:</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>KPI</TableHead>
              <TableHead>Formula</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ['Avg Velocity', 'sum(sprintEffort) / count(sprints)'],
              ['Avg SP/Person', 'avgVelocity / avgTeamSize'],
              ['Cost per SP', 'totalCost / totalSP'],
            ].map(([kpi, formula]) => (
              <TableRow key={kpi}>
                <TableCell className="font-medium">{kpi}</TableCell>
                <TableCell><Code>{formula}</Code></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className="text-sm font-medium">Calcolo dei costi:</p>
        <FormulaBlock>
{`sprintCost = teamSize * sprintDays * costPerDay
totalCost  = somma(sprintCost per ogni sprint con dati)
avgCostPerSP = totalCost / totalSP

costByClassification[cls] = {
  sp:   somma effort della classificazione
  cost: totalCost * (sp / totalSP)
  pct:  sp / totalSP * 100
}`}
        </FormulaBlock>

        <p className="text-sm font-medium">Velocity per Famiglia Professionale:</p>
        <FormulaBlock>
{`totalSP          = somma effort della famiglia su tutti gli sprint
activeSprintCount = sprint in cui la famiglia ha effort > 0
avgPerSprint     = totalSP / activeSprintCount
spPerPerson      = avgPerSprint / avgTeamMembers
costPerSP        = (avgMembers * sprintDays * costPerDay * activeSprints) / totalSP`}
        </FormulaBlock>

        <p className="text-sm font-medium">Grafici:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Stacked Bar:</strong> velocity per sprint (per classificazione)</li>
          <li><strong>Line:</strong> cost per SP trend</li>
          <li><strong>Area:</strong> burndown (cumulativo vs rimanente)</li>
          <li><strong>Line:</strong> SP per persona trend</li>
          <li><strong>Tabella:</strong> velocity e costi per famiglia</li>
        </ul>
      </Section>

      {/* 8. Effort Breakdown */}
      <Section id="effort" icon={Table2} title="8. Effort Breakdown" description="Tabella dettagliata dell'effort per sprint con drill-down">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium mb-2">Vista By Classification</p>
            <p className="text-xs text-muted-foreground">Sprint | Quarter | Strategic | KTLO | Small Ch. | Other | Unclass. | Total</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Vista By Professional Family</p>
            <p className="text-xs text-muted-foreground">Sprint | Quarter | BE | FE | Design | Analysis | QA | Auto | Native | PE | Total</p>
          </div>
        </div>

        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Riga TOTAL:</strong> somma di ogni colonna su tutti gli sprint</li>
          <li><strong>Drill-down:</strong> click su una riga per vedere tutti gli item dello sprint</li>
          <li><strong>Export CSV:</strong> esporta la tabella in formato CSV</li>
          <li><strong>Sorting:</strong> click sulle intestazioni per ordinare per qualsiasi colonna</li>
        </ul>
      </Section>

      {/* 9. Epic Explorer */}
      <Section id="epics" icon={FolderTree} title="9. Epic Explorer" description="Navigatore gerarchico ad albero del backlog">
        <FormulaBlock>
{`Epic Card
  |-- Classification badge
  |-- Totale features e SP
  |-- Breakdown effort per famiglia (BE: 45 SP, FE: 32 SP, ...)
  |
  |-- Feature 1
  |     |-- Classification badge
  |     |-- Effort totale dei children
  |     |-- Breakdown per famiglia
  |     |-- Child 1 (ID, Type, Title, effort pills)
  |     |-- Child 2 ...
  |
  |-- Feature 2 ...`}
        </FormulaBlock>

        <p className="text-sm font-medium">Calcoli:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Effort per Epic:</strong> somma dell'effort di tutti i discendenti</li>
          <li><strong>Effort per Feature:</strong> somma dell'effort dei children diretti</li>
          <li><strong>Family breakdown:</strong> somma gli effortByFamily dei discendenti a ogni livello</li>
        </ul>
      </Section>

      {/* 10. Professional */}
      <Section id="professional" icon={BarChart3} title="10. Professional Family Analysis" description="Analisi approfondita per singola famiglia professionale">
        <p className="text-sm">Per ogni famiglia (BE, FE, Design, Analysis, QA, Automation, Native, Platform Eng) si visualizza:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Pie Chart:</strong> effort della famiglia diviso per classificazione</li>
          <li><strong>Line Chart:</strong> effort della famiglia nel tempo (per sprint)</li>
          <li><strong>Top 10:</strong> i 10 item con piu effort per quella famiglia</li>
        </ul>

        <p className="text-sm font-medium">Campi effort per famiglia:</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            ['BE', 'effortBE'], ['FE', 'effortFE'], ['Design', 'effortDesign'], ['Analysis', 'effortAnalysis'],
            ['QA', 'effortQA'], ['Automation', 'effortAutomation'], ['Native', 'effortNative'], ['Platform Eng', 'effortPlatformEng'],
          ].map(([label, field]) => (
            <div key={field} className="text-xs">
              <span className="font-medium">{label}</span> <span className="text-muted-foreground">= <Code>{field}</Code></span>
            </div>
          ))}
        </div>
      </Section>

      {/* 11. Team */}
      <Section id="team" icon={UserCog} title="11. Team Composition & Costs" description="Definizione del team e parametri di costo usati dalle dashboard">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parametro</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Uso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Cost per Day</TableCell>
              <TableCell className="font-mono">350 EUR</TableCell>
              <TableCell className="text-sm text-muted-foreground">Costo medio giornaliero per persona</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Sprint Days</TableCell>
              <TableCell className="font-mono">10</TableCell>
              <TableCell className="text-sm text-muted-foreground">Giorni lavorativi per sprint</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <p className="text-sm font-medium">Formule di costo:</p>
        <FormulaBlock>
{`teamSize    = somma membri di tutte le famiglie
sprintCost  = teamSize * sprintDays * costPerDay
monthlyCost = sprintCost * 2    (~2 sprint/mese)
yearlyCost  = sprintCost * 26   (~26 sprint/anno)`}
        </FormulaBlock>

        <InfoCallout>
          Si possono definire <strong>piu periodi</strong> con composizioni diverse. Il sistema trova automaticamente il periodo valido per ogni sprint in base al range configurato.
        </InfoCallout>
      </Section>

      {/* 12. Unclassified */}
      <Section id="unclassified" icon={AlertCircle} title="12. Unclassified Report" description="Feature senza classificazione, ordinate per impatto">
        <p className="text-sm">Lista tutte le Feature che non hanno una classificazione valida, ordinate per effort decrescente.</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Unclassified Features:</strong> numero di Feature senza tag</li>
          <li><strong>Coverage %:</strong> percentuale di item classificati</li>
          <li><strong>Unclassified Effort:</strong> SP totali non classificati</li>
        </ul>
        <p className="text-sm">Per ogni Feature: ID, Title, Epic Parent, numero di children, effort totale. Export CSV disponibile per facilitare la classificazione nel backlog tool.</p>
      </Section>

      {/* 13. Dimensions */}
      <Section id="dimensions" icon={Layers} title="13. Dimension Analysis" description="Analisi multi-dimensionale per Tag, Value Area, State, Type, Parent">
        <p className="text-sm font-medium">Dimensioni disponibili:</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dimensione</TableHead>
              <TableHead>Cosa estrae</TableHead>
              <TableHead>Esempio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ['Tag', 'Singoli tag (split per ;)', 'Backend, Payments'],
              ['Value Area', 'Campo Value Area', 'Core, Extensions'],
              ['State', 'Stato dell\'item', 'Active, Closed'],
              ['Type', 'Tipo work item', 'Bug, Task'],
              ['Parent', 'ID del parent', '12345'],
            ].map(([dim, cosa, esempio]) => (
              <TableRow key={dim}>
                <TableCell className="font-medium">{dim}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{cosa}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{esempio}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className="text-sm">Per ogni dimensione: Pie Chart (top 12), Bar Chart (top 10), tabella con conteggio, effort, % e breakdown per famiglia.</p>

        <p className="text-sm font-medium">Cross-Analysis:</p>
        <p className="text-sm text-muted-foreground">
          Matrice a due dimensioni selezionabili. Le celle mostrano l'effort all'incrocio, colorate con intensita proporzionale: <Code>intensity = valore / max_valore</Code>
        </p>

        <InfoCallout>
          Se un item ha piu valori per una dimensione (es. piu tag), viene contato in <strong>tutti</strong> i gruppi corrispondenti.
        </InfoCallout>
      </Section>

      {/* 14. Cycle Time */}
      <Section id="cycletime" icon={Clock} title="14. Cycle Time Dashboard" description="Metriche di flusso: quanto tempo per completare, throughput e WIP">
        <p className="text-sm font-medium">Metriche:</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metrica</TableHead>
              <TableHead>Formula</TableHead>
              <TableHead>Significato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ['Cycle Time (medio)', 'mean(finishDate - startDate)', 'Tempo medio di completamento (giorni)'],
              ['Cycle Time (mediano)', 'median(finishDate - startDate)', 'Valore centrale, meno outlier'],
              ['Throughput', 'count(Closed items) per sprint', 'Item chiusi per sprint'],
              ['WIP', 'count(Active items) per sprint', 'Work In Progress'],
            ].map(([m, f, s]) => (
              <TableRow key={m}>
                <TableCell className="font-medium text-xs">{m}</TableCell>
                <TableCell><Code>{f}</Code></TableCell>
                <TableCell className="text-xs text-muted-foreground">{s}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className="text-sm font-medium">Grafici:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Histogram:</strong> distribuzione cycle time (bucket da 2 giorni)</li>
          <li><strong>Line:</strong> trend media + mediana per sprint con linea di riferimento globale</li>
          <li><strong>Bar:</strong> throughput per sprint</li>
          <li><strong>Bar:</strong> WIP per sprint</li>
        </ul>
      </Section>

      {/* 15. Carry-Over */}
      <Section id="carryover" icon={RefreshCw} title="15. Carry-Over Dashboard" description="Item non completati nello sprint assegnato">
        <p className="text-sm font-medium">Definizione:</p>
        <p className="text-sm text-muted-foreground">Un item e in carry-over se e assegnato a uno sprint ma il suo stato e <strong>Active</strong> o <strong>New</strong> (non Closed).</p>

        <FormulaBlock>
{`carryOverCount   = count(items Active o New nello sprint)
closedCount      = count(items Closed nello sprint)
carryOverPercent = carryOverCount / totalCount * 100
carryOverEffort  = sum(effort degli item in carry-over)`}
        </FormulaBlock>

        <p className="text-sm font-medium">Repeat Offenders:</p>
        <p className="text-sm text-muted-foreground">Item che compaiono come carry-over in piu di uno sprint. Indicatori di item bloccati o sottostimati.</p>
      </Section>

      {/* 16. Health */}
      <Section id="health" icon={HeartPulse} title="16. Sprint Health Dashboard" description="Punteggio 0-100 basato su 4 fattori da 0-25 ciascuno">
        <p className="text-sm font-medium">Fattore 1: Velocity Trend (0-25)</p>
        <FormulaBlock>
{`deviation = |effort_sprint - avgVelocity| / stdVelocity
velocityScore = max(0, 25 - deviation * 12.5)

Sprint nella media = 25/25
Devia di 1 dev.std = 12.5/25
Devia di 2+ dev.std = 0/25`}
        </FormulaBlock>

        <p className="text-sm font-medium">Fattore 2: Carry-Over (0-25)</p>
        <FormulaBlock>
{`carryOverPercent = (Active + New) / total * 100
carryOverScore = max(0, 25 - carryOverPercent * 0.5)

0% carry-over = 25/25
50%+ carry-over = 0/25`}
        </FormulaBlock>

        <p className="text-sm font-medium">Fattore 3: Classification Coverage (0-25)</p>
        <FormulaBlock>
{`classificationScore = (classified / total * 100) * 0.25

100% classificati = 25/25
80% classificati = 20/25`}
        </FormulaBlock>

        <p className="text-sm font-medium">Fattore 4: Effort Balance - Entropia di Shannon (0-25)</p>
        <FormulaBlock>
{`Per ogni famiglia con effort > 0:
  p = effort_famiglia / effort_totale
  entropy -= p * log2(p)

normalizedEntropy = entropy / log2(8 famiglie)
balanceScore = normalizedEntropy * 25

Effort equamente distribuito = 25/25
Tutto su una sola famiglia = 0/25`}
        </FormulaBlock>

        <p className="text-sm font-medium">Punteggio totale:</p>
        <FormulaBlock>healthScore = min(100, max(0, velocityScore + carryOverScore + classificationScore + balanceScore))</FormulaBlock>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Punteggio</TableHead>
              <TableHead>Livello</TableHead>
              <TableHead>Colore</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono">&ge; 75</TableCell>
              <TableCell><span className="text-green-400 font-medium">Healthy</span></TableCell>
              <TableCell><div className="w-4 h-4 rounded-full bg-green-500" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono">&ge; 50</TableCell>
              <TableCell><span className="text-amber-400 font-medium">At Risk</span></TableCell>
              <TableCell><div className="w-4 h-4 rounded-full bg-amber-500" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono">&lt; 50</TableCell>
              <TableCell><span className="text-red-400 font-medium">Critical</span></TableCell>
              <TableCell><div className="w-4 h-4 rounded-full bg-red-500" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Section>

      {/* 17. Anomaly */}
      <Section id="anomaly" icon={AlertTriangle} title="17. Anomaly Dashboard" description="Identificazione sprint anomali con Z-Score">
        <p className="text-sm font-medium">Z-Score: cos'e</p>
        <FormulaBlock>
{`zScore = (valore - media) / deviazione_standard

zScore = 0   --> valore nella media
zScore = +2  --> 2 dev.std sopra (anomalia alta)
zScore = -2  --> 2 dev.std sotto (anomalia bassa)

Soglia di anomalia: |zScore| > 2.0`}
        </FormulaBlock>

        <p className="text-sm font-medium">Metriche analizzate (15+):</p>
        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
          <div>
            <p className="text-xs font-medium text-foreground mb-1">Base</p>
            <ul className="space-y-0.5 text-xs">
              <li>Effort totale</li>
              <li>Numero item</li>
              <li>Item chiusi</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground mb-1">Per Classificazione</p>
            <ul className="space-y-0.5 text-xs">
              <li>Effort Strategic</li>
              <li>Effort KTLO</li>
              <li>Effort Small Change</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground mb-1">Per Famiglia</p>
            <ul className="space-y-0.5 text-xs">
              <li>BE, FE, Design</li>
              <li>Analysis, QA</li>
              <li>Automation, Native, PE</li>
            </ul>
          </div>
        </div>

        <p className="text-sm font-medium">Heatmap:</p>
        <p className="text-sm text-muted-foreground">Matrice sprint x metriche. Rosso = valore insolitamente alto. Blu = valore insolitamente basso. Intensita proporzionale al |zScore|.</p>
      </Section>

      {/* 18. Comparison */}
      <Section id="comparison" icon={Columns2} title="18. Sprint Comparison" description="Confronto side-by-side tra due sprint, range o quarter">
        <p className="text-sm font-medium">Metriche confrontate:</p>
        <FormulaBlock>
{`totalEffort    = somma effort
totalItems     = conteggio item
closedCount    = conteggio Closed
completionRate = closedCount / totalItems * 100
avgVelocity    = totalEffort / numero_sprint`}
        </FormulaBlock>

        <p className="text-sm font-medium">Calcolo Delta:</p>
        <FormulaBlock>
{`diff    = B - A
percent = (diff / A) * 100

Se A = 0 e B > 0 --> +100%
Se A = 0 e B = 0 --> 0%`}
        </FormulaBlock>

        <p className="text-sm text-muted-foreground">
          Visualizza metriche affiancate con indicatori delta, pie chart classificazione per A e B, e grouped bar chart per effort per famiglia.
        </p>
      </Section>

      {/* 19. Incidents */}
      <Section id="incidents" icon={ShieldAlert} title="19. Incident Dashboard" description="Analisi dei Bug: severity, MTTR, impact score, correlazioni">
        <p className="text-sm font-medium">Assegnazione Severity (P1-P4):</p>
        <FormulaBlock>
{`1. Campo Severity dedicato ("1 - Critical" --> P1)
2. Tag legacy (P1, P2, P3, P4)
3. Fallback basato sull'effort:
   > 20 SP --> P1
   > 13 SP --> P2
   > 7 SP  --> P3
   altro   --> P4`}
        </FormulaBlock>

        <p className="text-sm font-medium">Impact Score (0-100):</p>
        <FormulaBlock>
{`Factor 1: Effort (0-30)
  = (effort_bug / max_effort_tutti_bug) * 30

Factor 2: Resolution (0-25)
  Closed: min(cycleTime / 20, 1) * 25
  Active: 25 (penalita massima)

Factor 3: Severity (0-25)
  P1=25, P2=18, P3=10, P4=5

Factor 4: Classification (0-20)
  Strategic=20, KTLO=15, Other=8, Small Change=4

impactScore = min(100, somma dei 4 fattori)`}
        </FormulaBlock>

        <p className="text-sm font-medium">KPI principali:</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>KPI</TableHead>
              <TableHead>Formula</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ['MTTR (Mean)', 'mean(cycleTime dei bug chiusi)'],
              ['MTTR (Median)', 'median(cycleTime dei bug chiusi)'],
              ['Resolution Rate', 'closedBugs / totalBugs * 100'],
              ['Bug Effort %', 'bugEffort / totalEffort * 100'],
              ['Avg Impact Score', 'mean(impactScore)'],
            ].map(([k, f]) => (
              <TableRow key={k}>
                <TableCell className="font-medium text-xs">{k}</TableCell>
                <TableCell><Code>{f}</Code></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className="text-sm font-medium">Grafici:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>Incident Trend:</strong> conteggio bug e % per sprint</li>
          <li><strong>MTTR Trend:</strong> tempo medio risoluzione con linea di riferimento</li>
          <li><strong>Severity Distribution:</strong> conteggio e effort per P1-P4</li>
          <li><strong>By Classification/Family/Value Area:</strong> raggruppamenti</li>
          <li><strong>Correlation:</strong> effort feature vs conteggio bug per sprint</li>
        </ul>
      </Section>

      {/* 20. Formule */}
      <Section id="formulas" icon={Hash} title="20. Riepilogo Formule Chiave" description="Tutte le formule in un unico posto" defaultOpen>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Formula</TableHead>
              <TableHead>Calcolo</TableHead>
              <TableHead>Sezione</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              ['Total Effort', 'sum(effortBE + ... + effortPlatformEng) o effort', 'Ovunque'],
              ['Coverage %', 'classified / total * 100', 'Executive'],
              ['Avg Velocity', 'totalSP / sprintCount', 'Velocity'],
              ['Cost per SP', 'totalCost / totalSP', 'Velocity'],
              ['Sprint Cost', 'teamSize * sprintDays * costPerDay', 'Team'],
              ['Cycle Time', 'finishDate - startDate (giorni)', 'Cycle Time'],
              ['Carry-over %', '(Active + New) / total * 100', 'Carry-over'],
              ['Z-Score', '(valore - media) / devStd', 'Anomaly'],
              ['Shannon Entropy', 'sum(-p * log2(p)) / log2(N)', 'Health'],
              ['Health Score', 'velocity + carryOver + classification + balance', 'Health'],
              ['Impact Score', 'effort + resolution + severity + classification', 'Incidents'],
              ['MTTR', 'mean(cycleTime bug chiusi)', 'Incidents'],
              ['Strategic %', 'effort_Strategic / effort_totale * 100', 'Timeline'],
              ['Delta %', '(B - A) / A * 100', 'Comparison'],
            ].map(([f, c, s]) => (
              <TableRow key={f}>
                <TableCell className="font-medium text-xs">{f}</TableCell>
                <TableCell><Code>{c}</Code></TableCell>
                <TableCell className="text-xs text-muted-foreground">{s}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Separator className="my-4" />

        <p className="text-sm font-medium">Famiglie Professionali (8):</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            ['BE', 'Backend'], ['FE', 'Frontend'], ['Design', 'Design'], ['Analysis', 'Analysis'],
            ['QA', 'QA'], ['Automation', 'Automation'], ['Native', 'Native'], ['PE', 'Platform Eng'],
          ].map(([abbr, name]) => (
            <div key={abbr} className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-sm font-bold">{abbr}</p>
              <p className="text-[10px] text-muted-foreground">{name}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
