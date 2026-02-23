import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DataProvider } from '@/context/DataContext'
import { TeamProvider } from '@/context/TeamContext'
import Layout from '@/components/layout/Layout'
import FileUpload from '@/components/upload/FileUpload'
import ExecutiveDashboard from '@/components/dashboard/ExecutiveDashboard'
import SprintTimeline from '@/components/timeline/SprintTimeline'
import VelocityDashboard from '@/components/velocity/VelocityDashboard'
import EffortBreakdown from '@/components/table/EffortBreakdown'
import EpicExplorer from '@/components/epic/EpicExplorer'
import ProfessionalAnalysis from '@/components/professional/ProfessionalAnalysis'
import TeamComposition from '@/components/team/TeamComposition'
import UnclassifiedReport from '@/components/unclassified/UnclassifiedReport'
import DimensionAnalysis from '@/components/dimensions/DimensionAnalysis'
import CycleTimeDashboard from '@/components/cycletime/CycleTimeDashboard'
import CarryOverDashboard from '@/components/carryover/CarryOverDashboard'
import SprintHealthDashboard from '@/components/health/SprintHealthDashboard'
import AnomalyDashboard from '@/components/anomaly/AnomalyDashboard'
import SprintComparison from '@/components/comparison/SprintComparison'
import IncidentDashboard from '@/components/incidents/IncidentDashboard'
import BacklogGuide from '@/components/guide/BacklogGuide'
import HowItWorks from '@/components/guide/HowItWorks'

function App() {
  return (
    <DataProvider>
      <TeamProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<FileUpload />} />
              <Route path="/dashboard" element={<ExecutiveDashboard />} />
              <Route path="/timeline" element={<SprintTimeline />} />
              <Route path="/velocity" element={<VelocityDashboard />} />
              <Route path="/effort" element={<EffortBreakdown />} />
              <Route path="/epics" element={<EpicExplorer />} />
              <Route path="/professional" element={<ProfessionalAnalysis />} />
              <Route path="/team" element={<TeamComposition />} />
              <Route path="/unclassified" element={<UnclassifiedReport />} />
              <Route path="/dimensions" element={<DimensionAnalysis />} />
              <Route path="/cycletime" element={<CycleTimeDashboard />} />
              <Route path="/carryover" element={<CarryOverDashboard />} />
              <Route path="/health" element={<SprintHealthDashboard />} />
              <Route path="/anomalies" element={<AnomalyDashboard />} />
              <Route path="/comparison" element={<SprintComparison />} />
              <Route path="/incidents" element={<IncidentDashboard />} />
              <Route path="/guide" element={<BacklogGuide />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TeamProvider>
    </DataProvider>
  )
}

export default App
