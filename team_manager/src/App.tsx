import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { TimelineView } from '@/pages/TimelineView'
import { TeamView } from '@/pages/TeamView'
import { SprintView } from '@/pages/SprintView'
import { TimeOffView } from '@/pages/TimeOffView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TimelineView />} />
          <Route path="team" element={<TeamView />} />
          <Route path="sprints" element={<SprintView />} />
          <Route path="timeoff" element={<TimeOffView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
