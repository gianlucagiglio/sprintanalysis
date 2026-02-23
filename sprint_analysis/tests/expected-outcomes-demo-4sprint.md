# Expected Outcomes — Demo 4-Sprint Validation

File sorgente: `demo-4sprint-validation.xlsx`
Generato da: `src/lib/demo-4sprint.js` → `downloadDemo4Sprint()`

---

## Dataset Summary

| Metrica | Valore |
|---------|--------|
| Items totali | 33 |
| Epics | 4 |
| Features | 7 |
| User Stories | 17 |
| Bugs | 4 |
| Tasks | 1 |
| Sprints | 4 (S140–S143, Q2 2025) |
| Effort totale | 127 SP |
| Incidents | 3 |
| Anomalie classificazione | 3 |

---

## 1. Classificazione Attesa

### Regole applicate
1. Epic tag → classificazione Epic
2. Epic classificata (non Unclassified/Other) → Feature eredita da Epic
3. Feature classificata → figli ereditano
4. Epic Unclassified → eredita da Feature con effort maggiore

### Risultati per item

| ID | Type | Classification | Motivo |
|----|------|---------------|--------|
| 1000 | Epic | Strategic | tag "strategic" |
| 1001 | Epic | KTLO | tag "ktlo" |
| 1002 | Epic | Small Change | tag "small_change" |
| 1003 | Epic | **Strategic** | ereditato da Feature 2005 (effort=1 > Feature 2006 effort=0) |
| 2000 | Feature | Strategic | Epic 1000 wins |
| 2001 | Feature | Strategic | Epic 1000 wins |
| 2002 | Feature | KTLO | Epic 1001 wins |
| 2003 | Feature | KTLO | Epic 1001 wins |
| 2004 | Feature | Small Change | Epic 1002 wins |
| 2005 | Feature | Strategic | Epic 1003 era Unclassified → tag proprio "strategic" |
| 2006 | Feature | **KTLO** | Epic 1003 era Unclassified → tag proprio "ktlo" (ANOMALIA) |
| 3000–3001 | User Story | Strategic | da Feature 2000 |
| 3002 | User Story | KTLO | da Feature 2002 |
| 3003 | Bug | Small Change | da Feature 2004 |
| 3004–3005 | User Story | Strategic | da Feature 2001 |
| 3006–3007 | US/Bug | KTLO | da Feature 2002 |
| 3008 | User Story | Strategic | da Feature 2005 |
| 3009 | User Story | KTLO | da Feature 2003 |
| 3010 | User Story | Strategic | da Feature 2000 |
| 3011 | User Story | Strategic | da Feature 2005 |
| 3012 | User Story | Small Change | da Feature 2004 |
| 3013 | Bug | KTLO | da Feature 2003 |
| 3014 | User Story | **KTLO** | da Feature 2006 (ANOMALIA sotto Epic 1003 Strategic) |
| 3015 | User Story | Strategic | da Feature 2001 |
| 3016 | User Story | Strategic | da Feature 2005 |
| 3017 | User Story | **KTLO** | da Feature 2006 (ANOMALIA sotto Epic 1003 Strategic) |
| 3018 | User Story | KTLO | da Feature 2003 |
| 3019 | Bug | Small Change | da Feature 2004 |
| 3020 | Bug | Strategic | da Feature 2000 |
| 3021 | Task | KTLO | da Feature 2002 |

### Classification Summary

| Classification | Count | Effort (SP) |
|---------------|-------|-------------|
| Strategic | 15 | 73 |
| KTLO | 13 | 42 |
| Small Change | 5 | 12 |
| Other | 0 | 0 |
| Unclassified | 0 | 0 |

### Coverage
- Classified: 33/33 = **100%**

---

## 2. Executive Dashboard

### KPI Cards
| KPI | Valore |
|-----|--------|
| Total Items | 33 |
| Total Story Points | 127 |
| Classifications | 3 (Strategic, KTLO, Small Change) |
| Classified | 33 (100%) |
| Unclassified | 0 |

### Effort by Professional Family

| Family | SP | % |
|--------|-----|---|
| BE | 48 | 37.8% |
| FE | 33 | 26.0% |
| QA | 22 | 17.3% |
| Platform Eng | 9 | 7.1% |
| Native | 7 | 5.5% |
| Design | 7 | 5.5% |
| Analysis | 0 | 0% |
| Automation | 0 | 0% |

> NOTA: La somma famiglie (126 SP) < Total Effort (127 SP) perche Feature 2005 ha 1 SP generico non assegnato a nessuna famiglia.

### Top Epics by Effort

| # | Epic | Classification | Effort | Children |
|---|------|---------------|--------|----------|
| 1 | Payments Redesign (1000) | Strategic | 52 SP | 9 |
| 2 | Infrastructure Upgrade (1001) | KTLO | 35 SP | 9 |
| 3 | Analytics Platform (1003) | Strategic | 28 SP | 7 |
| 4 | Mobile Improvements (1002) | Small Change | 12 SP | 4 |

### Type Distribution
- Epic: 4, Feature: 7, User Story: 17, Bug: 4, Task: 1

---

## 3. Sprint Timeline

### Effort per Sprint per Classification

| Sprint | Strategic | KTLO | Small Change | Total |
|--------|-----------|------|-------------|-------|
| Q2 S140 | 23 | 7 | 4 | 34 |
| Q2 S141 | 17 | 15 | 0 | 32 |
| Q2 S142 | 18 | 10 | 5 | 33 |
| Q2 S143 | 14 | 10 | 3 | 27 |
| **TOTAL** | **72** | **42** | **12** | **126** |

> NOTA: Timeline include solo work items con sprintInfo (22 items, 126 SP). Feature 2005 (1 SP) non ha sprint.

### Effort per Sprint per Family

| Sprint | BE | FE | Design | QA | Native | Plat.Eng |
|--------|----|----|--------|----|--------|----------|
| S140 | 13 | 9 | 2 | 7 | 3 | 0 |
| S141 | 9 | 10 | 5 | 5 | 0 | 3 |
| S142 | 13 | 10 | 0 | 6 | 2 | 2 |
| S143 | 13 | 4 | 0 | 4 | 2 | 4 |

### Strategic % Trend
- S140: 23/34 = 67.6%
- S141: 17/32 = 53.1%
- S142: 18/33 = 54.5%
- S143: 14/27 = 51.9%

---

## 4. Velocity Dashboard

### KPI Cards
| KPI | Valore |
|-----|--------|
| Avg Velocity | 31.5 SP/sprint |
| Sprints Tracked | 4 |
| Total Story Points | 126 (solo work items con sprint) |

### Velocity per Sprint
- S140: 34 SP
- S141: 32 SP
- S142: 33 SP
- S143: 27 SP
- Average line: 31.5

### Burndown
| Sprint | Completed | Remaining | Total Scope |
|--------|-----------|-----------|-------------|
| S140 | 27 | 7 | 34 |
| S141 | 54 (27+27) | 5 | 66 (34+32) |
| S142 | 78 (54+24) | 9 | 99 (66+33) |
| S143 | 105 (78+27) | 0 | 126 (99+27) |

> Remaining = carry-over effort (items non chiusi nel sprint)

---

## 5. Epic Explorer

### KPI Cards
| KPI | Valore |
|-----|--------|
| Epics | 4 |
| Features | 7 |
| Total SP | 127 |
| Classified | 100% |
| Anomalie | **3** |

### Epic 1000 — Payments Redesign (Strategic)
- Features: 2 (Payment Gateway, Checkout Flow)
- Descendants: 7 work items
- Total effort: 52 SP
- Classification bar: 100% Strategic
- Anomalie: 0
- Family distribution: BE 47%, FE 45%, QA...

### Epic 1001 — Infrastructure Upgrade (KTLO)
- Features: 2 (DB Migration, Monitoring Setup)
- Descendants: 7 work items
- Total effort: 35 SP
- Classification bar: 100% KTLO
- Anomalie: 0

### Epic 1002 — Mobile Improvements (Small Change)
- Features: 1 (Push Notifications)
- Descendants: 3 work items
- Total effort: 12 SP
- Classification bar: 100% Small Change
- Anomalie: 0

### Epic 1003 — Analytics Platform (Strategic, ereditato)
- Features: 2 (Dashboard MVP, Report Export)
- Descendants: 5 work items
- Total effort: 28 SP (include 1 SP Feature 2005)
- Classification bar: 100% Strategic (per regola business, Epic wins)
- **Anomalie: 3**
  - Feature 2006 "Report Export" (KTLO)
  - 3014 "PDF Export" (KTLO)
  - 3017 "CSV Export" (KTLO)

### Feature State Summaries
| Feature | Children | Closed | Active | New |
|---------|----------|--------|--------|-----|
| 2000 Payment Gateway | 3 (3000,3001,3010,3020) | 4 | 0 | 0 |
| 2001 Checkout Flow | 3 (3004,3005,3015) | 1 | 1 | 1 |
| 2002 DB Migration | 3 (3002,3006,3007,3021) | 4 | 0 | 0 |
| 2003 Monitoring Setup | 3 (3009,3013,3018) | 2 | 1 | 0 |
| 2004 Push Notifications | 3 (3003,3012,3019) | 3 | 0 | 0 |
| 2005 Dashboard MVP | 3 (3008,3011,3016) | 3 | 0 | 0 |
| 2006 Report Export | 2 (3014,3017) | 1 | 1 | 0 |

---

## 6. Carry-Over Tracking

### Per Sprint

| Sprint | Total Items | Carry-Over | Closed | CO % | CO Effort | Closed Effort |
|--------|-------------|-----------|--------|------|-----------|--------------|
| S140 | 5 | 1 | 4 | 20.0% | 7.0 SP | 27.0 SP |
| S141 | 5 | 1 | 4 | 20.0% | 5.0 SP | 27.0 SP |
| S142 | 6 | 2 | 4 | 33.3% | 9.0 SP | 24.0 SP |
| S143 | 6 | 0 | 6 | 0.0% | 0.0 SP | 27.0 SP |

### KPI Summary
| KPI | Valore |
|-----|--------|
| Total Carry-over | 4 items |
| Avg Carry-over % | 18.3% |
| Repeat Offenders | 4 |
| Carry-over Effort | 21.0 SP |

### Carry-over Items (Repeat Offenders)
| ID | Title | Type | State | Effort | Sprint(s) |
|----|-------|------|-------|--------|-----------|
| 3004 | Cart Summary Page | User Story | Active | 7 SP | Q2 S140 |
| 3009 | Grafana Dashboards | User Story | Active | 5 SP | Q2 S141 |
| 3014 | PDF Export | User Story | Active | 5 SP | Q2 S142 |
| 3015 | Payment Confirmation | User Story | New | 4 SP | Q2 S142 |

---

## 7. Cycle Time & Flow Metrics

### KPI Summary
| KPI | Valore |
|-----|--------|
| Avg Cycle Time | 5.9 days |
| Median Cycle Time | 6.5 days |
| Avg Lead Time | 5.9 days |
| Throughput | 18 (closed items) |
| WIP | 14 (active items: 4 Epics + 7 Features + 3 work items) |

### Cycle Times per Item (days)

| ID | Cycle Time |
|----|-----------|
| 3000 | 7 |
| 3001 | 8 |
| 3002 | 5 |
| 3003 | 2 |
| 3004 | null (no finish) |
| 3005 | 7 |
| 3006 | 9 |
| 3007 | 3 |
| 3008 | 8 |
| 3009 | null |
| 3010 | 9 |
| 3011 | 7 |
| 3012 | 5 |
| 3013 | 3 |
| 3014 | null |
| 3015 | null (no start/finish) |
| 3016 | 8 |
| 3017 | 6 |
| 3018 | 8 |
| 3019 | 2 |
| 3020 | 5 |
| 3021 | 4 |

Sorted: [2, 2, 3, 3, 4, 5, 5, 5, 6, 7, 7, 7, 8, 8, 8, 8, 9, 9] (18 values)

### Cycle Time Trend per Sprint

| Sprint | Avg CT | Median CT | Count |
|--------|--------|-----------|-------|
| S140 | 5.5 | 6.0 | 4 |
| S141 | 6.8 | 7.5 | 4 |
| S142 | 6.0 | 6.0 | 4 |
| S143 | 5.5 | 5.5 | 6 |
| Global Avg | 5.9 | | |

### Throughput per Sprint
- S140: 4, S141: 4, S142: 4, S143: 6

### WIP per Sprint (Active items)
- S140: 1, S141: 1, S142: 1, S143: 0

### Cycle Time Distribution (2-day buckets)
| Range | Count |
|-------|-------|
| 0-1d | 0 |
| 2-3d | 4 |
| 4-5d | 4 |
| 6-7d | 4 |
| 8-9d | 6 |

---

## 8. Incident Analysis

### Incidents Detected (tag "incident" o "emergency")
| ID | Title | Severity Field | Parsed | Sprint | State | Effort | Cycle Time |
|----|-------|---------------|--------|--------|-------|--------|-----------|
| 3007 | Migration Timeout | "2 – High" | P2 | S141 | Closed | 5 SP | 3 days |
| 3013 | Alert Storm | "1 – Critical" | P1 | S142 | Closed | 5 SP | 3 days |
| 3020 | Payment Race Condition | "3 – Medium" | P3 | S143 | Closed | 7 SP | 5 days |

### KPI Summary
| KPI | Valore |
|-----|--------|
| Total Incidents | 3 |
| Active Incidents | 0 |
| MTTR | 3.7 days |
| Median MTTR | 3 days |
| Resolution Rate | 100% |
| Incident Effort | 17 SP |
| Effort Impact % | 13.5% |
| Avg Impact Score | 63 |

### Impact Scores (formula: effort + resolution + severity + classification, max 100)
| ID | Effort (0-30) | Resolution (0-25) | Severity (0-25) | Classification (0-20) | Total |
|----|--------------|-------------------|-----------------|----------------------|-------|
| 3007 | 21.4 (5/7*30) | 3.8 (3/20*25) | 18 (P2) | 15 (KTLO) | **58** |
| 3013 | 21.4 (5/7*30) | 3.8 (3/20*25) | 25 (P1) | 15 (KTLO) | **65** |
| 3020 | 30.0 (7/7*30) | 6.3 (5/20*25) | 10 (P3) | 20 (Strategic) | **66** |

### Severity Distribution
| Severity | Count | Effort |
|----------|-------|--------|
| P1 - Critical | 1 | 5 SP |
| P2 - High | 1 | 5 SP |
| P3 - Medium | 1 | 7 SP |
| P4 - Low | 0 | 0 SP |

### Incidents by Classification
| Classification | Count | Effort |
|---------------|-------|--------|
| KTLO | 2 | 10 SP |
| Strategic | 1 | 7 SP |

### Incidents by Family
| Family | Effort |
|--------|--------|
| BE | 12 SP |
| QA | 3 SP |
| Platform Eng | 2 SP |

### Incident Trend per Sprint
| Sprint | Count | % Items | Effort | Effort % |
|--------|-------|---------|--------|----------|
| S140 | 0 | 0% | 0 | 0% |
| S141 | 1 | 20.0% | 5 | 15.6% |
| S142 | 1 | 16.7% | 5 | 15.2% |
| S143 | 1 | 16.7% | 7 | 25.9% |

### MTTR Trend
| Sprint | MTTR | Count |
|--------|------|-------|
| S140 | null | 0 |
| S141 | 3.0 | 1 |
| S142 | 3.0 | 1 |
| S143 | 5.0 | 1 |
| Global Avg | 3.7 | |

---

## 9. Sprint Health

### Parametri Intermedi
- Velocities: [34, 32, 33, 27]
- Avg Velocity: 31.5
- Std Velocity: 2.69

### Health Scores per Sprint

| Sprint | Velocity (0-25) | Carry-Over (0-25) | Classification (0-25) | Balance (0-25) | **Total** |
|--------|----------------|-------------------|----------------------|----------------|-----------|
| S140 | ~13.4 | 15.0 | 25.0 | ~17.1 | **~71** |
| S141 | ~22.7 | 15.0 | 25.0 | ~18.3 | **~81** |
| S142 | ~18.0 | 8.4 | 25.0 | ~16.6 | **~68** |
| S143 | ~4.1 | 25.0 | 25.0 | ~16.8 | **~71** |

- Average Health: ~73
- S141 Healthy (>=75), S140/S142/S143 At Risk (50-74)

> I valori con ~ sono approssimati per floating point. Verificare con tolleranza ±1.

### Dettaglio Balance Score (Shannon Entropy)
| Sprint | Famiglie attive | Entropy | Normalized | Balance Score |
|--------|----------------|---------|------------|--------------|
| S140 | BE,FE,Design,QA,Native (5) | 2.06 | 0.686 | 17.1 |
| S141 | BE,FE,Design,QA,PlatEng (5) | 2.20 | 0.732 | 18.3 |
| S142 | BE,FE,QA,Native,PlatEng (5) | 1.99 | 0.663 | 16.6 |
| S143 | BE,FE,QA,Native,PlatEng (5) | 2.01 | 0.670 | 16.8 |

---

## 10. Anomaly Detection

Con 4 sprint e dati bilanciati, nessun metric dovrebbe superare la soglia 2.0σ.

### Risultati Attesi
| KPI | Valore |
|-----|--------|
| Anomalous Sprints | 0 |
| Total Flags | 0 |
| Most Anomalous | null |
| Threshold | 2.0σ |

### Z-Scores per Metrica Principale

| Metric | S140 | S141 | S142 | S143 | Anomaly? |
|--------|------|------|------|------|----------|
| Total Effort | 0.93 | 0.19 | 0.56 | -1.67 | No |
| Item Count | -1.00 | -1.00 | 1.00 | 1.00 | No |
| Closed Count | -0.58 | -0.58 | -0.58 | 1.73 | No |
| Strategic Effort | 1.54 | -0.31 | 0.00 | -1.23 | No |
| KTLO Effort | -1.22 | 1.57 | -0.17 | -0.17 | No |
| Small Change Effort | 0.53 | -1.60 | 1.07 | 0.00 | No |

> Nessun |z-score| > 2.0 → zero anomalie statistiche.

---

## 11. Effort Breakdown Tables

### By Classification

| Sprint | Quarter | Strategic | KTLO | Small Change | Other | Unclassified | Total |
|--------|---------|-----------|------|-------------|-------|-------------|-------|
| S140 | Q2 | 23 | 7 | 4 | 0 | 0 | 34 |
| S141 | Q2 | 17 | 15 | 0 | 0 | 0 | 32 |
| S142 | Q2 | 18 | 10 | 5 | 0 | 0 | 33 |
| S143 | Q2 | 14 | 10 | 3 | 0 | 0 | 27 |
| **TOTAL** | | **72** | **42** | **12** | **0** | **0** | **126** |

### By Professional Family

| Sprint | Quarter | BE | FE | Design | Analysis | QA | Automation | Native | Plat.Eng | Total |
|--------|---------|----|----|--------|----------|----|-----------:|--------|----------|-------|
| S140 | Q2 | 13 | 9 | 2 | 0 | 7 | 0 | 3 | 0 | 34 |
| S141 | Q2 | 9 | 10 | 5 | 0 | 5 | 0 | 0 | 3 | 32 |
| S142 | Q2 | 13 | 10 | 0 | 0 | 6 | 0 | 2 | 2 | 33 |
| S143 | Q2 | 13 | 4 | 0 | 0 | 4 | 0 | 2 | 4 | 27 |
| **TOTAL** | | **48** | **33** | **7** | **0** | **22** | **0** | **7** | **9** | **126** |

---

## 12. Unclassified Report

| KPI | Valore |
|-----|--------|
| Unclassified Features | 0 |
| Unclassified Items | 0 |
| Coverage | 100% |

Nessun item da classificare.

---

## 13. Sprint Comparison (esempio: S140 vs S143)

| Metric | S140 | S143 | Delta |
|--------|------|------|-------|
| Total Effort | 34 | 27 | -20.6% |
| Total Items | 5 | 6 | +20.0% |
| Closed Items | 4 | 6 | +50.0% |
| Completion Rate | 80.0% | 100.0% | +25.0% |

---

## Note per la Verifica

1. **Caricare il file** `demo-4sprint-validation.xlsx` dalla pagina di upload
2. **Navigare ogni dashboard** e confrontare i valori con questo documento
3. **Tolleranza**: ±1 sui punteggi Health (floating point), valori esatti per tutto il resto
4. **Anomalie Epic Explorer**: verificare che Epic 1003 mostri il banner amber con 3 conflitti
5. **Carry-over**: 3004 (S140), 3009 (S141), 3014+3015 (S142) sono gli unici non-Closed
6. **Incidents**: solo 3007, 3013, 3020 hanno tag "incident" o "emergency"
7. **Classification bar Epic 1003**: deve essere 100% Strategic (regola business), anche se Feature 2006 e figli sono KTLO nel dato sorgente
