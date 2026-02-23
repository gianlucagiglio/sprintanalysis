# Sprint Analysis - Come Funziona Ogni Sezione

Questa guida spiega, sezione per sezione, la logica di funzionamento dell'applicazione: quali dati vengono usati, quali formule vengono applicate e come interpretare i risultati.

---

## Indice

1. [Upload & Parsing dei Dati](#1-upload--parsing-dei-dati)
2. [Pipeline di Elaborazione](#2-pipeline-di-elaborazione)
3. [Sistema di Classificazione](#3-sistema-di-classificazione)
4. [Sistema di Filtri](#4-sistema-di-filtri)
5. [Executive Dashboard](#5-executive-dashboard)
6. [Sprint Timeline](#6-sprint-timeline)
7. [Velocity Dashboard](#7-velocity-dashboard)
8. [Effort Breakdown](#8-effort-breakdown)
9. [Epic Explorer](#9-epic-explorer)
10. [Professional Family Analysis](#10-professional-family-analysis)
11. [Team Composition & Costs](#11-team-composition--costs)
12. [Unclassified Report](#12-unclassified-report)
13. [Dimension Analysis](#13-dimension-analysis)
14. [Cycle Time Dashboard](#14-cycle-time-dashboard)
15. [Carry-Over Dashboard](#15-carry-over-dashboard)
16. [Sprint Health Dashboard](#16-sprint-health-dashboard)
17. [Anomaly Dashboard](#17-anomaly-dashboard)
18. [Sprint Comparison](#18-sprint-comparison)
19. [Incident Dashboard](#19-incident-dashboard)
20. [Backlog Guide](#20-backlog-guide)

---

## 1. Upload & Parsing dei Dati

### Cosa fa
Carica un file Excel esportato dal backlog (es. Azure DevOps) e lo trasforma in dati strutturati utilizzabili dalle dashboard.

### Dati in input
File `.xlsx` con colonne che rappresentano i work item del backlog. Le colonne riconosciute sono:

| Colonna Excel | Campo interno | Tipo |
|---|---|---|
| ID | `id` | Numero |
| Work Item Type | `type` | Stringa (Epic, Feature, Bug, Task...) |
| Title | `title` | Stringa |
| State | `state` | Stringa (New, Active, Closed...) |
| Tags | `tags` | Stringa separata da `;` |
| Iteration Path | `iterationPath` | Es. `Main\2025-Q1\136` |
| Parent | `parent` | Titolo del parent (risolto automaticamente a ID) |
| Effort (Analysis) | `effortAnalysis` | Numero (Story Points) |
| Effort (BE) | `effortBE` | Numero |
| Effort (FE) | `effortFE` | Numero |
| Effort (Design) | `effortDesign` | Numero |
| Effort (QA) | `effortQA` | Numero |
| Effort (Automation) | `effortAutomation` | Numero |
| Effort (Native) | `effortNative` | Numero |
| Effort (Platform Eng) | `effortPlatformEng` | Numero |
| Effort | `effort` | Numero (fallback se non ci sono effort per famiglia) |
| Created Date | `createdDate` | Data |
| Changed Date | `changedDate` | Data |
| Closed Date | `closedDate` | Data |
| Start Date | `startDate` | Data |
| Finish Date | `finishDate` | Data |
| Value Area | `valueArea` | Stringa |
| Business Value | `businessValue` | Numero |
| Area Path | `areaPath` | Stringa |
| Severity | `severity` | Stringa (es. "1 - Critical") |
| Priority | `priority` | Numero (1-4) |

### Come funziona
1. Il file viene letto con la libreria **SheetJS (xlsx)**
2. Le intestazioni delle colonne vengono mappate ai campi interni
3. I dati vengono salvati in `localStorage` con chiave `sprint-analysis-data` e un numero di versione per invalidare la cache automaticamente quando il parser cambia
4. Viene avviata la pipeline di elaborazione (sezione successiva)

### Effort totale: come viene calcolato
```
totalEffort = effortAnalysis + effortBE + effortFE + effortDesign
            + effortQA + effortAutomation + effortNative + effortPlatformEng
```
Se la somma delle famiglie professionali = 0, si usa il campo `effort` generico come fallback.

---

## 2. Pipeline di Elaborazione

### Cosa fa
Prende i dati grezzi del parser e produce tutte le strutture aggregate che le dashboard consumano.

### Flusso completo

```
Excel grezzo
    |
    v
1. classifyItems()    --> Assegna classificazione a ogni item
    |
    v
2. calculateEffort()  --> Calcola totalEffort per ogni item
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
6. buildHierarchy()   --> Costruisce albero Epic > Feature > Children
    |
    v
7. Aggregazione        --> Calcola summary, timeline, top epics, ecc.
```

### Sprint Info - Parsing dell'Iteration Path
L'Iteration Path segue il formato: `Main\YYYY-Qn\NNN`

Esempio: `Main\2025-Q1\136` produce:
- `year`: 2025
- `quarter`: Q1
- `sprint`: 136
- `label`: S136
- `fullLabel`: Q1 S136

### Output della pipeline
La funzione `aggregateData()` produce un oggetto con:
- `items` - tutti gli item processati
- `hierarchy` - albero gerarchico (epics, features, byId, orphans)
- `classificationSummary` - conteggio e effort per classificazione
- `totalItems`, `totalEffort` - metriche aggregate
- `classifiedCount`, `coveragePercent` - copertura della classificazione
- `effortByFamily` - effort totale per famiglia professionale
- `sprintTimeline` - dati per-sprint con effort per classificazione e famiglia
- `topEpics` - top 10 epic per effort
- `unclassifiedFeatures` - feature senza classificazione
- `typeDistribution` - distribuzione per tipo di work item

---

## 3. Sistema di Classificazione

### Cosa fa
Assegna a ogni work item una delle 5 categorie che descrivono la natura del lavoro.

### Categorie

| Classificazione | Tag riconosciuto | Significato |
|---|---|---|
| **Strategic** | `strategic` | Iniziative che portano valore di business nuovo |
| **KTLO** | `ktlo` | Keep The Lights On - manutenzione, debito tecnico |
| **Small Change** | `small change` o `small` | Modifiche minori, fix rapidi |
| **Other** | Qualsiasi altro tag | Lavoro con tag ma non classificabile |
| **Unclassified** | Nessun tag | Nessuna classificazione assegnata |

### Catena di risoluzione (priorita dall'alto al basso)

```
1. L'Epic ha un tag di classificazione?
   |-- SI --> Tutti i figli (Feature + children) ereditano dall'Epic
   |-- NO --> Vai al punto 2

2. La Feature ha un tag di classificazione?
   |-- SI --> I children della Feature ereditano dalla Feature
   |-- NO --> Vai al punto 3

3. L'item ha un tag di classificazione proprio?
   |-- SI --> Usa la sua classificazione
   |-- NO --> Risulta "Unclassified"

4. BONUS: Epic senza classificazione propria
   --> Eredita dalla classificazione piu comune delle sue Feature figlie
   --> Peso: per effort se disponibile, altrimenti per conteggio
```

### Logica dettagliata
1. **Epics** vengono classificati per primi, usando i propri tag
2. **Features**: se il parent Epic ha una classificazione valida (non Unclassified/Other), la Feature la eredita; altrimenti usa i propri tag
3. **Children** (User Story, Bug, Task, ecc.): ereditano dalla Feature genitore
4. **Epics orfani**: se un Epic non ha classificazione propria, guarda le sue Feature figlie e prende la classificazione che ha piu effort (o piu conteggio come fallback)

### Match dei tag
- I tag sono separati da `;` nel campo Tags
- Il match e **case-insensitive**
- Il **primo** tag di classificazione trovato vince

---

## 4. Sistema di Filtri

### Cosa fa
Permette di filtrare i dati su due assi: **temporale** e **dimensionale**. Quando un filtro cambia, i dati vengono ri-aggregati.

### Filtri Temporali
- **Quarter**: seleziona un quarter specifico (es. "2025-Q1") o "all"
- **Sprint Range**: slider min-max per restringere il range di sprint

### Filtri Dimensionali
Tutti i filtri dimensionali usano logica **AND** tra loro (devono soddisfare tutti i filtri attivi):
- **Tags**: filtra per tag specifici
- **Value Area**: filtra per area di valore
- **States**: filtra per stato (New, Active, Closed...)
- **Types**: filtra per tipo di work item
- **Parent ID / Item ID**: filtra per parent o item specifico

### Sincronizzazione URL
I filtri vengono salvati nei parametri URL (query string), permettendo di:
- Condividere un link con filtri pre-applicati
- Mantenere i filtri navigando tra le dashboard

---

## 5. Executive Dashboard

### Cosa fa
Fornisce una vista d'insieme ad alto livello del progetto: quanto lavoro c'e, come e distribuito e dove si concentra l'effort.

### KPI mostrati

| KPI | Formula | Significato |
|---|---|---|
| Total Items | `count(items)` | Numero totale di work item |
| Total Story Points | `sum(totalEffort)` | Somma di tutti gli effort |
| Classifications | `count(distinct classifications)` | Categorie di classificazione usate |
| Classified Items | `count(items con classificazione)` | Item con classificazione valida |
| Coverage % | `classifiedCount / totalItems * 100` | Percentuale di copertura |
| Unclassified | `count(items senza classificazione)` | Item ancora da classificare |

### Grafici

1. **Pie Chart - Distribuzione per Classificazione (Count)**: quanti item per categoria
2. **Bar Chart - Effort per Classificazione (SP)**: quanto effort per categoria
3. **Bar Chart - Story Points per Famiglia Professionale**: effort diviso per BE, FE, Design, ecc.
4. **Bar Chart - Top 10 Epic per Effort**: gli epic che assorbono piu effort

### Dati considerati
Tutti gli item filtrati. L'effort per Epic viene calcolato sommando l'effort di tutti i discendenti (Feature + children) risalendo la parent chain.

---

## 6. Sprint Timeline

### Cosa fa
Mostra l'evoluzione dell'effort nel tempo, sprint dopo sprint, evidenziando come il mix di lavoro (Strategic vs KTLO vs Small Change) cambia nel tempo.

### Grafici

1. **Stacked Area Chart - Effort by Classification Over Time**
   - Asse X: sprint (es. "Q1 S133", "Q1 S134"...)
   - Asse Y: Story Points
   - Le aree sono impilate per classificazione
   - Si puo filtrare per singola famiglia professionale (es. solo BE, solo FE)

2. **Line Chart - Strategic Work % Trend**
   - Mostra la percentuale di lavoro Strategic sprint per sprint
   - Formula: `strategicPct = Strategic_SP / total_SP * 100`

### Filtro per famiglia
Quando si seleziona una famiglia (es. "FE"), il grafico mostra solo l'effort di quella famiglia:
- Ricalcola per ogni sprint l'effort usando solo il campo specifico (es. `effortFE`)
- Riaggrega per classificazione usando solo l'effort di quella famiglia

---

## 7. Velocity Dashboard

### Cosa fa
Analizza la velocita del team: quanto lavoro viene completato per sprint, quanto costa, e come l'effort si distribuisce tra classificazioni e famiglie.

### KPI principali

| KPI | Formula | Significato |
|---|---|---|
| Average Velocity | `sum(sprintEffort) / count(sprints)` | SP medi per sprint |
| Sprints Tracked | `count(sprints)` | Numero di sprint nel dataset |
| Total SP | `sum(totalEffort)` | Story Points totali |
| Avg SP/Person | `avgVelocity / avgTeamSize` | Produttivita media individuale |
| Cost per SP | `totalCost / totalSP` | Quanto costa un Story Point |

### Calcolo dei costi (richiede Team Composition configurata)

```
sprintCost = teamSize * sprintDays * costPerDay

totalCost = somma(sprintCost per ogni sprint con dati)

avgCostPerSP = totalCost / totalSP

costByClassification[cls] = {
  sp:   somma effort della classificazione
  cost: totalCost * (sp / totalSP)
  pct:  sp / totalSP * 100
}
```

### Velocity per Famiglia Professionale

Per ogni famiglia (BE, FE, Design, ecc.):
```
totalSP         = somma effort della famiglia su tutti gli sprint
activeSprintCount = sprint in cui la famiglia ha effort > 0
avgPerSprint    = totalSP / activeSprintCount
avgTeamMembers  = media dei membri della famiglia nel periodo
spPerPerson     = avgPerSprint / avgTeamMembers
costPerSP       = (avgMembers * sprintDays * costPerDay * activeSprintCount) / totalSP
```

### Grafici

1. **Stacked Bar Chart - Velocity per Sprint**: effort diviso per classificazione, sprint per sprint
2. **Line Chart - Cost per SP Trend**: andamento del costo per SP nel tempo
3. **Area Chart - Burndown**: `cumDone` (effort cumulativo) vs `remaining` (scope - cumDone)
4. **Line Chart - SP per Person Trend**: produttivita individuale nel tempo
5. **Tabella - Family Velocity & Cost**: metriche dettagliate per ogni famiglia

---

## 8. Effort Breakdown

### Cosa fa
Tabella dettagliata dell'effort per sprint, con due viste: per classificazione e per famiglia professionale. Permette drill-down sui singoli item.

### Vista "By Classification"
Colonne: Sprint | Quarter | Strategic | KTLO | Small Change | Other | Unclassified | Total

I valori sono in **Story Points** per ogni sprint.

### Vista "By Professional Family"
Colonne: Sprint | Quarter | BE | FE | Design | Analysis | QA | Automation | Native | Platform Eng | Total

### Riga TOTAL
Ultima riga con la somma di ogni colonna su tutti gli sprint.

### Drill-down
Cliccando su una riga si apre un dialog con tutti gli item di quello sprint:
- ID, Type, Title, Classification, BE, FE, Design, Analysis, Total Effort

### Export CSV
Permette di esportare la tabella in formato CSV.

---

## 9. Epic Explorer

### Cosa fa
Navigatore gerarchico del backlog: Epic > Feature > Children. Permette di esplorare la struttura ad albero e vedere come l'effort si distribuisce.

### Struttura visualizzata

```
Epic Card
  |-- Classification badge
  |-- Totale features e SP
  |-- Breakdown effort per famiglia (BE: 45 SP, FE: 32 SP, ...)
  |
  |-- Feature 1
  |     |-- Classification badge
  |     |-- Effort totale dei children
  |     |-- Breakdown per famiglia
  |     |-- Child 1 (ID, Type, Title, effort pills per famiglia)
  |     |-- Child 2 ...
  |
  |-- Feature 2 ...
```

### Calcoli

**Effort per Epic**: somma dell'effort di tutti i discendenti (children delle feature + children diretti dell'epic)

**Effort per Feature**: somma dell'effort dei children diretti

**Family breakdown**: per ogni livello, somma gli `effortByFamily` dei discendenti

### Ordinamento
Gli Epic sono ordinati alfabeticamente per titolo.

---

## 10. Professional Family Analysis

### Cosa fa
Analisi approfondita per singola famiglia professionale (BE, FE, Design, Analysis, QA, Automation, Native, Platform Eng). Mostra come l'effort di ogni famiglia si distribuisce tra classificazioni, nel tempo, e su quali item si concentra.

### Per ogni famiglia si visualizza:

1. **Pie Chart - Effort by Classification**
   - Quanti SP della famiglia vanno in Strategic vs KTLO vs Small Change
   - Formula: per ogni classificazione, somma `item[effortField]` dove `effortField` e il campo specifico della famiglia (es. `effortFE`)

2. **Line Chart - Effort Over Time**
   - SP della famiglia per sprint nel tempo

3. **Tabella Top 10 Work Items**
   - I 10 item con piu effort per quella specifica famiglia
   - Ordinati per effort della famiglia decrescente

### Campi effort per famiglia

| Famiglia | Campo |
|---|---|
| BE | `effortBE` |
| FE | `effortFE` |
| Design | `effortDesign` |
| Analysis | `effortAnalysis` |
| QA | `effortQA` |
| Automation | `effortAutomation` |
| Native | `effortNative` |
| Platform Eng | `effortPlatformEng` |

---

## 11. Team Composition & Costs

### Cosa fa
Permette di definire la composizione del team per periodi e i parametri di costo. Questi dati vengono usati dal Velocity Dashboard e da altre sezioni per calcolare metriche di costo.

### Parametri di costo

| Parametro | Default | Significato |
|---|---|---|
| Cost per Day | 350 EUR | Costo medio giornaliero per persona |
| Sprint Days | 10 | Giorni lavorativi per sprint |

### Periodi del team
Si possono definire piu periodi con composizioni diverse:
- **Label**: nome del periodo (es. "Q1 2025")
- **Sprint range**: da quale sprint a quale sprint vale questa configurazione
- **Members**: numero di persone per ogni famiglia professionale

### Formule di costo

```
teamSize    = somma di tutti i membri di tutte le famiglie
sprintCost  = teamSize * sprintDays * costPerDay
monthlyCost = sprintCost * 2   (stima: ~2 sprint al mese)
yearlyCost  = sprintCost * 26  (stima: ~26 sprint all'anno)
```

### Selezione del team per sprint
Quando una dashboard chiede "qual e il team per lo sprint X?", il sistema cerca il periodo in cui `fromSprint <= X <= toSprint`. Se non trova un match, usa il periodo di fallback (senza sprint range).

---

## 12. Unclassified Report

### Cosa fa
Lista tutte le Feature che non hanno una classificazione valida, ordinandole per effort per dare priorita a quelle piu impattanti da classificare.

### KPI mostrati

| KPI | Significato |
|---|---|
| Unclassified Features | Numero di Feature senza tag di classificazione |
| Unclassified Items | Numero totale di item senza classificazione |
| Coverage % | Percentuale di item classificati sul totale |
| Unclassified Effort | SP totali degli item non classificati |

### Tabella
Per ogni Feature non classificata:
- **Feature ID**: identificativo
- **Title**: nome della feature
- **Epic Parent**: nome dell'Epic genitore
- **Children**: numero di child sotto la feature
- **Total Effort**: somma dell'effort dei children
- **Status**: "Da Classificare"

Le Feature sono ordinate per `childEffort` decrescente (le piu impattanti prima).

### Export
Permette di esportare la lista in formato CSV per facilitare la classificazione nel backlog tool.

---

## 13. Dimension Analysis

### Cosa fa
Analisi multi-dimensionale dei dati: permette di esaminare come l'effort si distribuisce lungo diverse dimensioni (Tag, Value Area, State, Type, Parent).

### Dimensioni disponibili

| Dimensione | Cosa estrae | Esempio |
|---|---|---|
| **Tag** | Singoli tag dall'item (split per `;`) | "Backend", "Payments", "strategic" |
| **Value Area** | Campo Value Area | "Core", "Extensions" |
| **State** | Stato dell'item | "Active", "Closed", "New" |
| **Type** | Tipo di work item | "Bug", "Task", "User Story" |
| **Parent** | ID del parent | "12345" |

### Per ogni dimensione si visualizza:

1. **Pie Chart - Distribuzione Effort**: come si ripartisce l'effort tra i valori della dimensione (top 12)
2. **Bar Chart - Top 10 per Effort**: i 10 valori con piu effort
3. **Tabella Breakdown Dettagliato**: per ogni valore della dimensione:
   - Numero di item
   - Effort totale (SP)
   - Percentuale sul totale: `effort_valore / effort_totale * 100`
   - Effort diviso per famiglia professionale

### Algoritmo di raggruppamento
```
Per ogni item:
  valori = extract(item)  // es. split dei tag per ";"
  Per ogni valore:
    groups[valore].items.push(item)
    groups[valore].effort += item.totalEffort
    Per ogni famiglia:
      groups[valore].effortByFamily[famiglia] += item.effortByFamily[famiglia]
```

Se un item ha piu valori (es. piu tag), viene contato in tutti i gruppi corrispondenti.

### Cross-Analysis
Matrice a due dimensioni che incrocia due dimensioni selezionate dall'utente:
- **Righe**: valori della dimensione A
- **Colonne**: valori della dimensione B
- **Celle**: effort totale all'incrocio
- **Colore**: intensita proporzionale al valore (heatmap blu)

Formula intensita: `intensity = valore_cella / valore_massimo_nella_matrice`

---

## 14. Cycle Time Dashboard

### Cosa fa
Misura le metriche di flusso del processo: quanto tempo ci vuole per completare un item (Cycle Time), quanti item vengono chiusi (Throughput), e quanti sono in lavorazione contemporaneamente (WIP).

### Metriche principali

| Metrica | Formula | Significato |
|---|---|---|
| Cycle Time (medio) | `mean(finishDate - startDate)` in giorni | Tempo medio di completamento |
| Cycle Time (mediano) | `median(finishDate - startDate)` in giorni | Valore centrale (meno sensibile a outlier) |
| Lead Time | Uguale al Cycle Time (in questa versione) | Tempo dalla creazione al completamento |
| Throughput | `count(items con state = Closed)` per sprint | Quanti item vengono chiusi per sprint |
| WIP | `count(items con state = Active)` per sprint | Work In Progress |

### Come si calcola il Cycle Time
```
cycleTime = finishDate - startDate (in giorni)

- Se finishDate o startDate sono assenti, l'item viene escluso
- Le date Excel (numeri seriali) vengono convertite automaticamente
```

### Grafici

1. **Histogram - Cycle Time Distribution**
   - Bucket di 2 giorni
   - Mostra quanti item cadono in ogni fascia di durata
   - Es: 0-2 giorni: 15 item, 2-4 giorni: 23 item, ecc.

2. **Line Chart - Cycle Time Trend**
   - Per ogni sprint: media e mediana del cycle time
   - Linea di riferimento: media globale su tutti gli sprint

3. **Bar Chart - Throughput per Sprint**
   - Quanti item Closed per sprint

4. **Bar Chart - WIP per Sprint**
   - Quanti item Active per sprint

---

## 15. Carry-Over Dashboard

### Cosa fa
Traccia gli item che non vengono completati nello sprint a cui sono assegnati (carry-over): item che risultano ancora "Active" o "New" nello sprint.

### Definizione di Carry-Over
Un item e in carry-over se:
- E assegnato a uno sprint (ha un `iterationPath` valido)
- Il suo stato e **Active** o **New** (non Closed)

### Metriche per sprint

| Metrica | Formula |
|---|---|
| Carry-over Count | `count(items con stato Active o New)` |
| Closed Count | `count(items con stato Closed)` |
| Carry-over % | `carryOverCount / totalCount * 100` |
| Carry-over Effort | `sum(effort degli item in carry-over)` |
| Closed Effort | `sum(effort degli item chiusi)` |

### Repeat Offenders
Item che compaiono come carry-over in **piu di uno sprint**. Sono indicatori di item bloccati o sottostimati.

### Summary

| Metrica | Formula |
|---|---|
| Total Carry-over | Somma di tutti i carry-over count su tutti gli sprint |
| Avg Carry-over % | Media della percentuale di carry-over tra gli sprint |
| Total Carry-over Effort | Somma dell'effort di tutti gli item in carry-over |
| Repeat Offenders | Numero di item che sono carry-over in piu di 1 sprint |

---

## 16. Sprint Health Dashboard

### Cosa fa
Calcola un punteggio di "salute" (0-100) per ogni sprint basato su 4 fattori, ognuno con peso 0-25 punti.

### I 4 Fattori

#### Fattore 1: Velocity Trend (0-25 punti)
Misura quanto la velocity dello sprint e vicina alla media. Sprint con effort molto diverso dalla media vengono penalizzati.

```
avgVelocity = media(effort di tutti gli sprint)
stdVelocity = deviazione standard(effort di tutti gli sprint)
deviation   = |effort_sprint - avgVelocity| / stdVelocity

velocityScore = max(0, 25 - deviation * 12.5)
```
- Se lo sprint ha effort = media → 25/25 (perfetto)
- Se devia di 1 dev.std → 12.5/25
- Se devia di 2+ dev.std → 0/25

#### Fattore 2: Carry-Over (0-25 punti)
Penalizza gli sprint con alta percentuale di carry-over.

```
carryOverPercent = (item Active + New) / total_items * 100
carryOverScore   = max(0, 25 - carryOverPercent * 0.5)
```
- 0% carry-over → 25/25
- 25% carry-over → 12.5/25
- 50%+ carry-over → 0/25

#### Fattore 3: Classification Coverage (0-25 punti)
Premia gli sprint in cui tutti gli item sono classificati.

```
coveragePercent    = classified_items / total_items * 100
classificationScore = coveragePercent * 0.25
```
- 100% classificati → 25/25
- 80% classificati → 20/25
- 0% classificati → 0/25

#### Fattore 4: Effort Balance - Entropia di Shannon (0-25 punti)
Misura quanto l'effort e distribuito equamente tra le famiglie professionali. Un team bilanciato = punteggio alto; tutto concentrato su una famiglia = punteggio basso.

```
Per ogni famiglia con effort > 0:
  p = effort_famiglia / effort_totale
  entropy -= p * log2(p)

maxEntropy = log2(8)  // 8 famiglie possibili
normalizedEntropy = entropy / maxEntropy
balanceScore = normalizedEntropy * 25
```

- Effort distribuito equamente su 8 famiglie → 25/25
- Tutto su una sola famiglia → 0/25

### Punteggio Totale
```
healthScore = velocityScore + carryOverScore + classificationScore + balanceScore
            = min(100, max(0, somma dei 4 fattori))
```

### Livelli di salute

| Punteggio | Livello | Colore |
|---|---|---|
| >= 75 | Healthy | Verde |
| >= 50 | At Risk | Giallo |
| < 50 | Critical | Rosso |

---

## 17. Anomaly Dashboard

### Cosa fa
Identifica sprint anomali usando l'analisi statistica Z-Score: sprint in cui le metriche deviano significativamente dalla norma.

### Z-Score: cos'e e come funziona
Lo Z-Score misura quante deviazioni standard un valore dista dalla media:

```
zScore = (valore - media) / deviazione_standard
```

- `zScore = 0` → il valore e nella media
- `zScore = +2` → il valore e 2 dev.std sopra la media (anomalia alta)
- `zScore = -2` → il valore e 2 dev.std sotto la media (anomalia bassa)

### Soglia di anomalia
Un valore e considerato **anomalo** se `|zScore| > 2.0` (configurable).

### Metriche analizzate (15+ metriche)

**Metriche base:**
- Effort totale per sprint
- Numero di item per sprint
- Numero di item chiusi per sprint

**Per classificazione:**
- Effort Strategic
- Effort KTLO
- Effort Small Change

**Per famiglia professionale:**
- Effort BE
- Effort FE
- Effort Design
- Effort Analysis
- Effort QA
- Effort Automation
- Effort Native
- Effort Platform Eng

### Output

1. **Lista anomalie**: ogni anomalia contiene sprint, metrica, valore, media, z-score, direzione (high/low)

2. **Heatmap**: matrice sprint x metriche
   - Colore rosso = z-score positivo alto (valore insolitamente alto)
   - Colore blu = z-score negativo (valore insolitamente basso)
   - Intensita proporzionale al |zScore|

3. **Summary**:
   - Quanti sprint hanno almeno un'anomalia
   - Totale flag di anomalia
   - Sprint piu anomalo (con piu flag)

---

## 18. Sprint Comparison

### Cosa fa
Confronta due sprint (o due gruppi di sprint / quarter) affiancati, mostrando le differenze tra di loro.

### Come selezionare cosa confrontare
Si possono selezionare:
- **Sprint singolo**: uno sprint specifico
- **Range di sprint**: da sprint X a sprint Y
- **Quarter**: tutti gli sprint di un quarter

### Metriche confrontate

Per ogni selezione (A e B) vengono calcolate:

```
totalEffort    = somma effort degli item
totalItems     = conteggio item
closedCount    = conteggio item Closed
activeCount    = conteggio item Active
avgVelocity    = totalEffort / numero_sprint
completionRate = closedCount / totalItems * 100

classificationEffort[cls] = somma effort per classificazione
familyEffort[family]      = somma effort per famiglia
```

### Calcolo Delta (differenza A -> B)

```
Per ogni metrica:
  diff    = B - A
  percent = (diff / A) * 100

Casi speciali:
  - Se A = 0 e B > 0 → percent = +100%
  - Se A = 0 e B = 0 → percent = 0%
```

### Visualizzazione
- Metriche affiancate con indicatore delta (freccia su/giu + percentuale)
- Pie chart classificazione per A e B
- Grouped bar chart per effort per famiglia

---

## 19. Incident Dashboard

### Cosa fa
Analizza i Bug come "incidenti": severity, tempo di risoluzione, impatto sul team, tendenze.

### Quali item vengono considerati
Solo item con `type = "Bug"`.

### Assegnazione Severity (P1-P4)

La severity viene determinata con questa catena di priorita:

```
1. Campo Severity dedicato (es. "1 - Critical" → P1)
2. Tag legacy (P1, P2, P3, P4 nel campo Tags)
3. Fallback basato sull'effort:
   - effort > 20 → P1
   - effort > 13 → P2
   - effort > 7  → P3
   - altrimenti  → P4
```

| Severity | Significato |
|---|---|
| **P1 - Critical** | Blocca produzione, perdita dati o sicurezza compromessa |
| **P2 - High** | Funzionalita core non utilizzabile |
| **P3 - Medium** | Impatto moderato, esiste workaround |
| **P4 - Low** | Cosmetico o impatto minimo |

### Impact Score (0-100)

Ogni bug riceve un punteggio di impatto basato su 4 fattori:

```
Factor 1: Effort Score (0-30 punti)
  effortScore = (effort_bug / max_effort_tra_tutti_i_bug) * 30

Factor 2: Resolution Score (0-25 punti)
  Se Closed:  resolutionScore = min(cycleTime / 20, 1) * 25
  Se Active:  resolutionScore = 25  (penalita massima)

Factor 3: Severity Score (0-25 punti)
  P1 = 25, P2 = 18, P3 = 10, P4 = 5

Factor 4: Classification Score (0-20 punti)
  Strategic = 20, KTLO = 15, Other = 8, Small Change = 4, Unclassified = 0

impactScore = min(100, somma dei 4 fattori)
```

### KPI principali

| KPI | Formula |
|---|---|
| Total Incidents | `count(bugs)` |
| Active Incidents | `count(bugs con state = Active)` |
| Active Effort | `sum(effort dei bug attivi)` |
| Closed Incidents | `count(bugs con state = Closed)` |
| MTTR (Mean) | `mean(cycleTime dei bug chiusi)` in giorni |
| MTTR (Median) | `median(cycleTime dei bug chiusi)` in giorni |
| Resolution Rate | `closedBugs / totalBugs * 100` |
| Bug Effort % | `bugEffort / totalEffort * 100` |
| Avg Impact Score | `mean(impactScore di tutti i bug)` |

### Grafici e analisi

1. **Incident Trend per Sprint**: conteggio bug e % rispetto al totale, effort bug e % sul totale
2. **MTTR Trend**: tempo medio di risoluzione bug per sprint con linea di riferimento globale
3. **Severity Distribution**: conteggio e effort per P1/P2/P3/P4
4. **By Classification**: bug raggruppati per classificazione (Strategic/KTLO/...)
5. **By Family**: effort dei bug diviso per famiglia professionale
6. **By Value Area**: bug raggruppati per area di valore (risale la parent chain fino all'Epic)
7. **Correlation**: scatter plot effort feature vs conteggio bug per sprint (per capire se piu lavoro = piu bug)

---

## 20. Backlog Guide

### Cosa fa
Pagina informativa (non interattiva) che spiega le regole e le convenzioni per organizzare il backlog correttamente, in modo da massimizzare la qualita dell'analisi.

### Contenuto
- Gerarchia degli item (Epic > Feature > Child)
- Regole di ereditarieta della classificazione
- Tag riconosciuti e significato
- Severity e Priority: definizione dei livelli
- Campi obbligatori vs raccomandati vs opzionali
- Value Area: come assegnarla
- Tag metadata consigliati (area tecnica e dominio business)
- Checklist qualita dati (9 punti di verifica con link alle dashboard)

---

## Riepilogo Formule Chiave

| Formula | Calcolo | Dove si usa |
|---|---|---|
| Total Effort | `sum(effortBE + effortFE + ... + effortPlatformEng)` oppure `effort` | Ovunque |
| Coverage % | `classified / total * 100` | Executive, Unclassified |
| Avg Velocity | `totalSP / sprintCount` | Velocity |
| Cost per SP | `totalCost / totalSP` | Velocity |
| Sprint Cost | `teamSize * sprintDays * costPerDay` | Team, Velocity |
| Cycle Time | `finishDate - startDate` (giorni) | Cycle Time, Incidents |
| Carry-over % | `(Active + New) / total * 100` | Carry-over, Health |
| Z-Score | `(valore - media) / devStd` | Anomaly |
| Shannon Entropy | `sum(-p * log2(p)) / log2(N)` | Health Score |
| Health Score | `velocityScore + carryOverScore + classificationScore + balanceScore` | Health |
| Impact Score | `effortScore + resolutionScore + severityScore + classificationScore` | Incidents |
| MTTR | `mean(cycleTime dei bug chiusi)` | Incidents |
| Strategic % | `effort_Strategic / effort_totale * 100` | Timeline |
| Delta % | `(B - A) / A * 100` | Comparison |

---

## Famiglie Professionali

L'applicazione traccia 8 famiglie professionali indipendenti. Ogni item puo avere effort su una o piu famiglie:

| # | Famiglia | Campo effort | Abbreviazione |
|---|---|---|---|
| 1 | Backend | `effortBE` | BE |
| 2 | Frontend | `effortFE` | FE |
| 3 | Design | `effortDesign` | Des |
| 4 | Analysis | `effortAnalysis` | Ana |
| 5 | QA | `effortQA` | QA |
| 6 | Automation | `effortAutomation` | Auto |
| 7 | Native | `effortNative` | Nat |
| 8 | Platform Engineering | `effortPlatformEng` | PE |
