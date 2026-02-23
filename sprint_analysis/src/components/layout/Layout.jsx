import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import FilterBar from './FilterBar'
import FilterURLSync from './FilterURLSync'
import ErrorBoundary from './ErrorBoundary'

function PageErrorBoundary() {
  const location = useLocation()
  return (
    <ErrorBoundary key={location.pathname}>
      <Outlet />
    </ErrorBoundary>
  )
}

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <FilterURLSync />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <FilterBar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-[1400px] mx-auto">
            <PageErrorBoundary />
          </div>
        </main>
      </div>
    </div>
  )
}
