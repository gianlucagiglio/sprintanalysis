import { useState, useCallback, useMemo, useEffect } from 'react';
import Layout from './components/layout/Layout';
import PdfUpload from './components/upload/PdfUpload';
import Summary from './components/results/Summary';
import DeductionsBreakdown from './components/results/DeductionsBreakdown';
import PayChart from './components/results/PayChart';
import TimeOffSummary from './components/results/TimeOffSummary';
import Progress from './components/ui/Progress';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
import { Tabs, Tab } from './components/ui/Tabs';
import Dashboard from './components/dashboard/Dashboard';
import CompareMonths from './components/compare/CompareMonths';
import { analyzePdf } from './lib/api';
import {
  RotateCcw, FileText, ChevronDown, ChevronUp, Plus,
  CheckCircle, AlertCircle, Loader2,
  LayoutDashboard, BarChart3,
} from 'lucide-react';

const MESI = {
  gennaio: 0, febbraio: 1, marzo: 2, aprile: 3, maggio: 4, giugno: 5,
  luglio: 6, agosto: 7, settembre: 8, ottobre: 9, novembre: 10, dicembre: 11,
};

function parsePeriodo(periodo) {
  if (!periodo) return null;
  const parts = periodo.trim().toLowerCase().split(/\s+/);
  if (parts.length < 2) return null;
  const mese = MESI[parts[0]];
  const anno = parseInt(parts[1], 10);
  if (mese == null || isNaN(anno)) return null;
  return new Date(anno, mese, 1);
}

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

export default function App() {
  const [payslips, setPayslips] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const completedCount = useMemo(
    () => payslips.filter(ps => ps.data && !ps.loading && !ps.error).length,
    [payslips]
  );

  const handleFilesSelected = useCallback(async (files) => {
    setUploading(true);

    const startIdx = payslips.length;
    const newSlots = files.map((f) => ({
      fileName: f.name,
      data: null,
      error: null,
      loading: true,
    }));

    setPayslips((prev) => [...prev, ...newSlots]);

    // Processa max 2 file alla volta per non sovraccaricare il server
    const CONCURRENCY = 2;
    let nextIdx = 0;

    async function processNext() {
      while (nextIdx < files.length) {
        const i = nextIdx++;
        const file = files[i];
        try {
          const response = await analyzePdf(file);
          setPayslips((prev) => {
            const updated = [...prev];
            updated[startIdx + i] = {
              fileName: file.name,
              data: response.data,
              error: null,
              loading: false,
            };
            return updated;
          });
        } catch (err) {
          const message =
            err.response?.data?.error ||
            err.response?.data?.details ||
            'Errore durante l\'analisi.';
          setPayslips((prev) => {
            const updated = [...prev];
            updated[startIdx + i] = {
              fileName: file.name,
              data: null,
              error: message,
              loading: false,
            };
            return updated;
          });
        }
      }
    }

    const workers = Array.from({ length: Math.min(CONCURRENCY, files.length) }, () => processNext());
    await Promise.all(workers);
    setUploading(false);

    if (files.length === 1) {
      setExpandedIdx(startIdx);
    }
  }, [payslips.length]);

  const handleReset = useCallback(() => {
    setPayslips([]);
    setExpandedIdx(null);
    setActiveTab('dashboard');
  }, []);

  const handleRemove = useCallback((idx) => {
    setPayslips((prev) => prev.filter((_, i) => i !== idx));
    if (expandedIdx === idx) setExpandedIdx(null);
    else if (expandedIdx > idx) setExpandedIdx(expandedIdx - 1);
  }, [expandedIdx]);

  const toggleExpand = useCallback((idx) => {
    setExpandedIdx((prev) => (prev === idx ? null : idx));
  }, []);

  const hasResults = payslips.length > 0;

  const sortedPayslips = useMemo(() => {
    const withIdx = payslips.map((ps, idx) => ({ ps, originalIdx: idx }));
    return withIdx.sort((a, b) => {
      const dateA = parsePeriodo(a.ps.data?.periodo);
      const dateB = parsePeriodo(b.ps.data?.periodo);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB - dateA;
    });
  }, [payslips]);

  // If on analysis tab but not enough payslips, fallback to dashboard
  useEffect(() => {
    if (activeTab === 'analysis' && completedCount < 2) {
      setActiveTab('dashboard');
    }
  }, [activeTab, completedCount]);

  // ── Header actions (Aggiungi + Azzera) ──
  const headerActions = hasResults ? (
    <>
      <label className="cursor-pointer">
        <input
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              handleFilesSelected(Array.from(e.target.files));
              e.target.value = '';
            }
          }}
        />
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors bg-accent hover:bg-accent-hover text-white text-sm cursor-pointer">
          <Plus className="w-4 h-4" />
          Aggiungi
        </span>
      </label>
      <Button onClick={handleReset} variant="ghost" className="!py-1.5 !px-3 !text-sm">
        <span className="flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5" />
          Azzera
        </span>
      </Button>
    </>
  ) : null;

  // ── Tab bar ──
  const tabBar = hasResults ? (
    <Tabs value={activeTab} onChange={setActiveTab}>
      <Tab value="dashboard" label="Dashboard" icon={LayoutDashboard} />
      <Tab value="payslips" label="Buste Paga" icon={FileText} badge={payslips.length} />
      <Tab value="analysis" label="Analisi" icon={BarChart3} disabled={completedCount < 2} />
    </Tabs>
  ) : null;

  return (
    <Layout tabBar={tabBar} headerActions={headerActions}>
      {/* Upload area — full-page when no payslips */}
      {!hasResults && !uploading && (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">
              Analizza le tue buste paga
            </h2>
            <p className="text-text-muted">
              Carica uno o pi&ugrave; PDF e ricevi un'analisi dettagliata
            </p>
          </div>
          <PdfUpload
            onFilesSelected={handleFilesSelected}
            isLoading={uploading}
          />
        </div>
      )}

      {/* Loading iniziale senza risultati */}
      {!hasResults && uploading && (
        <div className="max-w-md mx-auto">
          <Card>
            <div className="text-center">
              <Progress label="Analisi in corso..." />
            </div>
          </Card>
        </div>
      )}

      {/* ═══ TAB: Dashboard ═══ */}
      {hasResults && activeTab === 'dashboard' && (
        <Dashboard payslips={payslips} />
      )}

      {/* ═══ TAB: Buste Paga ═══ */}
      {hasResults && activeTab === 'payslips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {payslips.length} {payslips.length === 1 ? 'busta paga' : 'buste paga'}
            </h2>
          </div>

          {/* Lista accordion */}
          {sortedPayslips.map(({ ps, originalIdx }) => (
            <div key={originalIdx} className="border border-border rounded-xl overflow-hidden">
              <div
                role="button"
                tabIndex={0}
                onClick={() => !ps.loading && ps.data && toggleExpand(originalIdx)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !ps.loading && ps.data && toggleExpand(originalIdx); } }}
                className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors
                  ${ps.data ? 'hover:bg-surface-hover cursor-pointer' : 'cursor-default'}
                  ${expandedIdx === originalIdx ? 'bg-surface' : ''}
                `}
              >
                {ps.loading && <Loader2 className="w-5 h-5 text-accent animate-spin shrink-0" />}
                {ps.data && <CheckCircle className="w-5 h-5 text-success shrink-0" />}
                {ps.error && <AlertCircle className="w-5 h-5 text-danger shrink-0" />}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-medium truncate">
                      {ps.data?.periodo || ps.fileName}
                    </span>
                    {ps.data?.periodo && (
                      <span className="text-text-muted text-xs truncate">{ps.fileName}</span>
                    )}
                  </div>
                  {ps.loading && (
                    <span className="text-text-muted text-sm">Analisi in corso...</span>
                  )}
                  {ps.error && (
                    <span className="text-danger text-sm">{ps.error}</span>
                  )}
                  {ps.data && (
                    <div className="flex items-center gap-4 mt-0.5 text-sm">
                      <span className="text-text-muted">
                        Lordo <strong className="font-mono text-lordo">{formatCurrency(ps.data.competenze?.totale_competenze)}</strong>
                      </span>
                      <span className="text-text-muted">
                        Netto <strong className="font-mono text-netto">{formatCurrency(ps.data.netto)}</strong>
                      </span>
                      {ps.data.dipendente && (
                        <span className="text-text-muted hidden md:inline">{ps.data.dipendente}</span>
                      )}
                    </div>
                  )}
                </div>

                {ps.data && (
                  expandedIdx === originalIdx
                    ? <ChevronUp className="w-5 h-5 text-text-muted shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(originalIdx); }}
                  className="text-text-muted hover:text-danger text-xs px-2 py-1 rounded transition-colors shrink-0"
                >
                  Rimuovi
                </button>
              </div>

              {/* Contenuto espanso */}
              {expandedIdx === originalIdx && ps.data && (
                <div className="border-t border-border px-5 py-6 space-y-6 bg-bg">
                  <Summary data={ps.data} />
                  <DeductionsBreakdown data={ps.data} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PayChart data={ps.data} />
                    <div className="space-y-4">
                      <TimeOffSummary data={ps.data} />

                      {ps.data.tfr && (ps.data.tfr.quota_mese != null || ps.data.tfr.retribuzione_utile != null) && (
                        <Card>
                          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">TFR</h3>
                          <div className="space-y-2">
                            {ps.data.tfr.quota_mese != null && (
                              <div className="flex justify-between">
                                <span className="text-text-muted text-sm">Quota mese</span>
                                <span className="font-mono text-sm font-semibold">{formatCurrency(ps.data.tfr.quota_mese)}</span>
                              </div>
                            )}
                            {ps.data.tfr.retribuzione_utile != null && (
                              <div className="flex justify-between">
                                <span className="text-text-muted text-sm">Retribuzione utile TFR</span>
                                <span className="font-mono text-sm">{formatCurrency(ps.data.tfr.retribuzione_utile)}</span>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}

                      {ps.data.costo_azienda?.voci?.length > 0 && (
                        <Card>
                          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Oneri azienda (C/Ditta)</h3>
                          <div className="space-y-1">
                            {ps.data.costo_azienda.voci.map((v, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-text-muted">{v.descrizione}</span>
                                <span className="font-mono">{formatCurrency(v.importo)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between border-t border-border pt-2 mt-2">
                              <span className="text-text-muted text-sm font-semibold">Totale oneri</span>
                              <span className="font-mono text-sm font-semibold text-warning">{formatCurrency(ps.data.costo_azienda.totale)}</span>
                            </div>
                          </div>
                        </Card>
                      )}

                      {ps.data.progressivi && Object.keys(ps.data.progressivi).length > 0 && (
                        <Card>
                          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Progressivi anno</h3>
                          <div className="space-y-1">
                            {ps.data.progressivi.imponibile_inps != null && (
                              <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Imponibile INPS</span>
                                <span className="font-mono">{formatCurrency(ps.data.progressivi.imponibile_inps)}</span>
                              </div>
                            )}
                            {ps.data.progressivi.imponibile_irpef != null && (
                              <div className="flex justify-between text-sm">
                                <span className="text-text-muted">Imponibile IRPEF</span>
                                <span className="font-mono">{formatCurrency(ps.data.progressivi.imponibile_irpef)}</span>
                              </div>
                            )}
                            {ps.data.progressivi.irpef_pagata != null && (
                              <div className="flex justify-between text-sm">
                                <span className="text-text-muted">IRPEF pagata</span>
                                <span className="font-mono">{formatCurrency(ps.data.progressivi.irpef_pagata)}</span>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}

                      {ps.data.banca && (
                        <Card>
                          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Accredito</h3>
                          <div className="space-y-1 text-sm">
                            {ps.data.banca.nome && <p>{ps.data.banca.nome}</p>}
                            <p className="text-text-muted font-mono">
                              {ps.data.banca.abi && `ABI ${ps.data.banca.abi}`}
                              {ps.data.banca.cab && ` CAB ${ps.data.banca.cab}`}
                            </p>
                          </div>
                        </Card>
                      )}

                      {ps.data.note?.length > 0 && (
                        <Card>
                          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Note</h3>
                          <ul className="space-y-1">
                            {ps.data.note.map((nota, i) => (
                              <li key={i} className="text-sm text-text-muted flex gap-2">
                                <span className="text-accent">-</span>
                                {nota}
                              </li>
                            ))}
                          </ul>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══ TAB: Analisi ═══ */}
      {hasResults && activeTab === 'analysis' && completedCount >= 2 && (
        <CompareMonths payslips={payslips} />
      )}
    </Layout>
  );
}
