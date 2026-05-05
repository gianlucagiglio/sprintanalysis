import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { TimelineView } from '@/pages/TimelineView'
import { GanttView } from '@/pages/GanttView'
import { TeamView } from '@/pages/TeamView'
import { SprintView } from '@/pages/SprintView'
import { FeaturesView } from '@/pages/FeaturesView'
import { TimeOffView } from '@/pages/TimeOffView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TimelineView />} />
          <Route path="gantt" element={<GanttView />} />
          <Route path="team" element={<TeamView />} />
          <Route path="sprints" element={<SprintView />} />
          <Route path="features" element={<FeaturesView />} />
          <Route path="timeoff" element={<TimeOffView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
