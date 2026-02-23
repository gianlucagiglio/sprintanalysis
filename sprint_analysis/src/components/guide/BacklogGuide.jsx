import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen, GitBranch, Tags, Bug, ClipboardList,
  Target, Layers, CheckCircle2, AlertTriangle, Info,
} from 'lucide-react'

function InfoCallout({ children }) {
  return (
    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 flex gap-3 text-sm">
      <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
      <div className="text-blue-300">{children}</div>
    </div>
  )
}

function WarningCallout({ children }) {
  return (
    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 flex gap-3 text-sm">
      <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="text-amber-300">{children}</div>
    </div>
  )
}

function Code({ children }) {
  return <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm">{children}</code>
}

export default function BacklogGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-400" />
          Backlog Guide
        </h2>
        <p className="text-muted-foreground mt-1">
          Regole e convenzioni per organizzare il backlog e massimizzare la qualit&agrave; dell'analisi.
        </p>
      </div>

      {/* 1 - Gerarchia degli Item */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-blue-400" />
            Gerarchia degli Item
          </CardTitle>
          <CardDescription>Come si strutturano gli item nel backlog</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 font-mono text-sm space-y-1">
            <p className="text-muted-foreground">Epic</p>
            <p className="pl-4 text-muted-foreground">&rarr; Feature</p>
            <p className="pl-8 text-muted-foreground">&rarr; User Story | Bug | Task | Tech Story</p>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <p><strong>Ereditariet&agrave; della classificazione:</strong> la classificazione (<Code>strategic</Code>, <Code>ktlo</Code>, <Code>small change</Code>) pu&ograve; essere assegnata sia all'<strong>Epic</strong> che alla <strong>Feature</strong>. La catena di risoluzione &egrave;:</p>
            <ol className="list-decimal list-inside pl-2 space-y-1 text-muted-foreground">
              <li><strong>Epic</strong> &mdash; se l'Epic ha un tag di classificazione, vince e propaga a tutte le Feature e child sottostanti</li>
              <li><strong>Feature</strong> &mdash; fallback: se l'Epic non ha classificazione, si usa quella della Feature</li>
              <li><strong>Unclassified</strong> &mdash; se n&eacute; Epic n&eacute; Feature hanno il tag, l'item risulta non classificato</li>
            </ol>
            <p><strong>Value Area:</strong> va assegnata a livello <strong>Epic</strong>. I figli la ereditano risalendo la parent chain.</p>
          </div>

          <InfoCallout>
            Ogni item child deve avere un campo <Code>parent</Code> valido che punta alla Feature o Epic genitore. Item senza parent risultano <strong>orfani</strong> e non verranno aggregati correttamente nelle analisi.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* 2 - Tag e Classificazione */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Tags className="h-4 w-4 text-blue-400" />
            Tag e Classificazione
          </CardTitle>
          <CardDescription>Come usare i tag per classificare le Feature</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p>I tag sono stringhe separate da <Code>;</Code> nel campo Tags dell'item.</p>
            <p>Esempio: <Code>strategic; Backend; Payments</Code></p>
          </div>

          <Separator className="my-4" />

          <p className="text-sm font-medium mb-2">Tag di classificazione riconosciuti:</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Classificazione</TableHead>
                <TableHead>Descrizione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Code>strategic</Code></TableCell>
                <TableCell><span className="text-blue-400 font-medium">Strategic</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Iniziative che portano valore di business nuovo</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>ktlo</Code></TableCell>
                <TableCell><span className="text-amber-400 font-medium">KTLO</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Keep The Lights On &mdash; manutenzione e debito tecnico</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>small change</Code></TableCell>
                <TableCell><span className="text-emerald-400 font-medium">Small Change</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Modifiche minori, fix rapidi, tweaks</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="text-sm space-y-2 mt-2">
            <p><strong>Match:</strong> il primo tag di classificazione trovato vince (case-insensitive).</p>
            <p><strong>Catena di risoluzione:</strong> il sistema cerca il tag prima sull'<strong>Epic</strong>, poi sulla <strong>Feature</strong>. Se l'Epic ha un tag di classificazione, questo sovrascrive qualsiasi tag sulla Feature. I child (User Story, Bug, Task) ereditano sempre dal livello pi&ugrave; alto disponibile.</p>
          </div>

          <InfoCallout>
            <strong>Best practice:</strong> assegna la classificazione a livello <strong>Epic</strong> per garantire coerenza su tutte le Feature sottostanti. Usa il tag sulla Feature solo quando Feature diverse sotto lo stesso Epic hanno classificazioni differenti.
          </InfoCallout>

          <WarningCallout>
            Feature senza tag di classificazione <strong>e</strong> il cui Epic non ha classificazione risulteranno <strong>Unclassified</strong>. Questo abbassa la coverage e rende le analisi meno accurate. Verifica nella pagina <Link to="/unclassified" className="text-amber-400 underline underline-offset-2 hover:text-amber-300">Unclassified</Link>.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* 3 - Severity, Priority e metriche Bug */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bug className="h-4 w-4 text-blue-400" />
            Severity, Priority e Metriche Bug
          </CardTitle>
          <CardDescription>Campi dedicati per classificare e misurare l'impatto dei bug</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">I Bug hanno 4 campi dedicati per descrivere impatto e urgenza. <Code>Severity</Code> e <Code>Priority</Code> sono colonne proprie (non pi&ugrave; tag).</p>

          <Separator className="my-4" />

          <p className="text-sm font-medium mb-2">Severity &mdash; quanto &egrave; grave il problema:</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Valore</TableHead>
                <TableHead>Livello</TableHead>
                <TableHead>Significato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Code>1 - Critical</Code></TableCell>
                <TableCell><span className="text-red-400 font-semibold">Critical</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Blocca produzione, perdita dati o sicurezza compromessa</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>2 - High</Code></TableCell>
                <TableCell><span className="text-orange-400 font-semibold">High</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Funzionalit&agrave; core non utilizzabile, nessun workaround</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>3 - Medium</Code></TableCell>
                <TableCell><span className="text-amber-400 font-semibold">Medium</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Impatto moderato, esiste un workaround</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>4 - Low</Code></TableCell>
                <TableCell><span className="text-slate-400 font-semibold">Low</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Cosmetico o impatto minimo</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <p className="text-sm font-medium mb-2">Priority &mdash; quanto &egrave; urgente risolverlo:</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Valore</TableHead>
                <TableHead>Significato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Code>1</Code></TableCell>
                <TableCell className="text-sm text-muted-foreground">Risolvere immediatamente (hotfix)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>2</Code></TableCell>
                <TableCell className="text-sm text-muted-foreground">Da risolvere nello sprint corrente</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>3</Code></TableCell>
                <TableCell className="text-sm text-muted-foreground">Pianificabile nel prossimo sprint</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>4</Code></TableCell>
                <TableCell className="text-sm text-muted-foreground">Backlog, risolvibile quando c'&egrave; tempo</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <p className="text-sm font-medium mb-2">Frequence e Prevalence &mdash; metriche di impatto:</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campo</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead>Esempio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Code>Frequence</Code></TableCell>
                <TableCell className="text-sm text-muted-foreground">Quante volte si verifica il bug (frequenza di occorrenza)</TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">Alto / Medio / Basso</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Prevalence</Code></TableCell>
                <TableCell className="text-sm text-muted-foreground">Quanti utenti/sistemi sono impattati (diffusione)</TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">Alto / Medio / Basso</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <InfoCallout>
            <strong>Severity &ne; Priority.</strong> Un bug pu&ograve; essere Critical (severity alta) ma Priority 3 se esiste un workaround temporaneo. Usa Severity per descrivere l'impatto tecnico, Priority per l'urgenza di business.
          </InfoCallout>

          <WarningCallout>
            <strong>Frequence</strong> e <strong>Prevalence</strong> combinati con Severity aiutano a calcolare l'impact score nell'<Link to="/incidents" className="text-amber-400 underline underline-offset-2 hover:text-amber-300">Incident Dashboard</Link>. Bug senza questi campi avranno un impact score basato solo su Severity e Effort.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* 4 - Campi Obbligatori */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-blue-400" />
            Campi Obbligatori
          </CardTitle>
          <CardDescription>Livello di importanza di ogni campo per l'analisi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campo</TableHead>
                <TableHead>Livello</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Code>ID</Code></TableCell>
                <TableCell><span className="text-red-400 font-medium">Obbligatorio</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Identificativo univoco dell'item</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Work Item Type</Code></TableCell>
                <TableCell><span className="text-red-400 font-medium">Obbligatorio</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Determina la categorizzazione (Epic, Feature, Bug, ecc.)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Title</Code></TableCell>
                <TableCell><span className="text-red-400 font-medium">Obbligatorio</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Nome descrittivo dell'item</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>State</Code></TableCell>
                <TableCell><span className="text-red-400 font-medium">Obbligatorio</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Necessario per calcolare done vs in-progress</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Effort</Code></TableCell>
                <TableCell><span className="text-red-400 font-medium">Obbligatorio</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Story Points &mdash; base per velocity, breakdown e costi</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Iteration Path</Code></TableCell>
                <TableCell><span className="text-red-400 font-medium">Obbligatorio</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Associa l'item allo sprint</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Tags</Code></TableCell>
                <TableCell><span className="text-red-400 font-medium">Obbligatorio</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Classificazione (strategic, ktlo, small change) e metadata</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Parent</Code></TableCell>
                <TableCell><span className="text-red-400 font-medium">Obbligatorio</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Collega child alla Feature/Epic (ID del parent)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Created Date</Code></TableCell>
                <TableCell><span className="text-red-400 font-medium">Obbligatorio</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Data di creazione, usata per calcolare lead time</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Changed Date</Code></TableCell>
                <TableCell><span className="text-amber-400 font-medium">Raccomandato</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Ultima modifica, utile per rilevare item stale</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Closed Date</Code></TableCell>
                <TableCell><span className="text-amber-400 font-medium">Raccomandato</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Data di chiusura, necessaria per Cycle Time e MTTR</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Value Area</Code></TableCell>
                <TableCell><span className="text-amber-400 font-medium">Raccomandato</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Raggruppamento per area di valore (su Epic)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Business Value</Code></TableCell>
                <TableCell><span className="text-amber-400 font-medium">Raccomandato</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Valore di business numerico, usato per prioritizzazione</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Product Area</Code></TableCell>
                <TableCell><span className="text-amber-400 font-medium">Raccomandato</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Area di prodotto (pi&ugrave; specifica di Area Path)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Severity</Code></TableCell>
                <TableCell><span className="text-amber-400 font-medium">Raccomandato</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Gravit&agrave; del bug (1-Critical &rarr; 4-Low). Solo per Bug</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Priority</Code></TableCell>
                <TableCell><span className="text-amber-400 font-medium">Raccomandato</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Urgenza di risoluzione (1 &rarr; 4). Solo per Bug</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Frequence</Code></TableCell>
                <TableCell><span className="text-slate-400 font-medium">Opzionale</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Frequenza di occorrenza del bug</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Prevalence</Code></TableCell>
                <TableCell><span className="text-slate-400 font-medium">Opzionale</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Diffusione del bug tra utenti/sistemi</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Code>Area Path</Code></TableCell>
                <TableCell><span className="text-slate-400 font-medium">Opzionale</span></TableCell>
                <TableCell className="text-sm text-muted-foreground">Filtro gerarchico per team/area organizzativa</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <WarningCallout>
            <strong>Created Date + Closed Date</strong> sono necessari per calcolare Cycle Time e MTTR. Senza <Code>Closed Date</Code> le metriche di flusso nella dashboard <Link to="/cycletime" className="text-amber-400 underline underline-offset-2 hover:text-amber-300">Cycle Time</Link> saranno incomplete.
          </WarningCallout>

          <InfoCallout>
            <strong>Severity e Priority</strong> sono campi dedicati (colonne proprie), non vanno pi&ugrave; nel campo Tags. I tag restano per la classificazione (<Code>strategic</Code>, <Code>ktlo</Code>, <Code>small change</Code>) e i metadata descrittivi.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* 5 - Value Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-400" />
            Value Area
          </CardTitle>
          <CardDescription>Come assegnare e utilizzare la Value Area</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-2">
            <p>La <strong>Value Area</strong> va assegnata a livello <strong>Epic</strong>.</p>
            <p>Le dashboard <Link to="/incidents" className="text-blue-400 underline underline-offset-2 hover:text-blue-300">Incidents</Link> e <Link to="/epics" className="text-blue-400 underline underline-offset-2 hover:text-blue-300">Epic Explorer</Link> risalgono la parent chain per trovare la Value Area dell'Epic antenato.</p>
          </div>

          <WarningCallout>
            Epic senza Value Area: tutti i bug e item figli finiranno raggruppati sotto <strong>"Unknown"</strong> nelle analisi per area di valore.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* 6 - Tag Metadata Consigliati */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            Tag Metadata Consigliati
          </CardTitle>
          <CardDescription>Vocabolario standard per tag aggiuntivi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">Oltre ai tag di classificazione, puoi aggiungere tag descrittivi per area tecnica e dominio business. Severity e Priority dei Bug hanno ora campi dedicati e non vanno pi&ugrave; nei tag.</p>

          <Separator className="my-4" />

          <p className="text-sm font-medium mb-2">Area Tecnica:</p>
          <div className="flex flex-wrap gap-2">
            {['Backend', 'Frontend', 'Native', 'Platform', 'Data', 'DevOps'].map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono">
                {tag}
              </span>
            ))}
          </div>

          <Separator className="my-4" />

          <p className="text-sm font-medium mb-2">Dominio Business:</p>
          <div className="flex flex-wrap gap-2">
            {['Payments', 'Security', 'CRM', 'Analytics', 'UX', 'Compliance'].map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                {tag}
              </span>
            ))}
          </div>

          <WarningCallout>
            Evita varianti dello stesso tag (es. <Code>Back-End</Code> vs <Code>Backend</Code>). Il filtro &egrave; <strong>case-sensitive</strong>, quindi usa sempre la forma esatta del vocabolario sopra.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* 7 - Checklist Qualit&agrave; Dati */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-400" />
            Checklist Qualit&agrave; Dati
          </CardTitle>
          <CardDescription>Verifiche da fare prima di analizzare i dati</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground mb-2">Prima di procedere con l'analisi, verifica i seguenti punti:</p>

          {[
            { text: 'Tutte le Feature hanno un tag di classificazione', link: '/unclassified', linkText: 'Verifica Unclassified' },
            { text: 'Tutti i Bug hanno Severity e Priority compilati', link: '/incidents', linkText: 'Verifica Incidents' },
            { text: 'Gli Epic hanno la Value Area assegnata', link: '/epics', linkText: 'Verifica Epic Explorer' },
            { text: 'Gli item child hanno un Parent valido (nessun orfano)', link: null, linkText: null },
            { text: 'Created Date e Closed Date compilati per le metriche di flusso', link: '/cycletime', linkText: 'Verifica Cycle Time' },
            { text: 'Effort (Story Points) assegnati a tutti gli item esecutivi', link: '/effort', linkText: 'Verifica Effort Table' },
            { text: 'Tag consistenti (nessuna variante o duplicato)', link: null, linkText: null },
            { text: 'Iteration Path corretto per ogni item dello sprint', link: '/timeline', linkText: 'Verifica Timeline' },
            { text: 'Product Area compilata per analisi per dominio', link: null, linkText: null },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="w-5 h-5 rounded border border-white/20 shrink-0 mt-0.5 flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                {i + 1}
              </div>
              <div>
                <span>{item.text}</span>
                {item.link && (
                  <>
                    {' '}&mdash;{' '}
                    <Link to={item.link} className="text-blue-400 underline underline-offset-2 hover:text-blue-300 text-xs">
                      {item.linkText}
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}

          <InfoCallout>
            Una copertura di classificazione superiore al <strong>90%</strong> &egrave; considerata buona. Sotto il <strong>70%</strong> le analisi di breakdown potrebbero essere fuorvianti.
          </InfoCallout>
        </CardContent>
      </Card>
    </div>
  )
}
