import { FileText } from 'lucide-react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <FileText className="w-6 h-6 text-accent" />
          <h1 className="text-lg font-semibold">Payslip Analyzer</h1>
          <span className="text-text-muted text-sm ml-auto">Analizzatore Busta Paga</span>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
