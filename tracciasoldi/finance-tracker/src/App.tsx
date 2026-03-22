import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"
import { Landmark, CreditCard, LayoutDashboard } from "lucide-react"
import { BankAccountPage } from "@/pages/BankAccountPage"
import { CreditCardPage } from "@/pages/CreditCardPage"
import { OverviewPage } from "@/pages/OverviewPage"

const navItems = [
  { to: "/", label: "Panoramica", icon: LayoutDashboard },
  { to: "/bank", label: "Conto Corrente", icon: Landmark },
  { to: "/card", label: "Carta di Credito", icon: CreditCard },
]

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">
              TracciaSoldi
            </h1>
            <nav className="flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/bank" element={<BankAccountPage />} />
            <Route path="/card" element={<CreditCardPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
