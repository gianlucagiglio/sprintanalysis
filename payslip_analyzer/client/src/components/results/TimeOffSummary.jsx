import { CalendarDays, Clock, Coffee, Monitor } from 'lucide-react';
import Card from '../ui/Card';

function TimeOffCard({ icon: Icon, label, value, unit = 'ore' }) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-3 p-3 bg-bg rounded-lg">
      <Icon className="w-5 h-5 text-accent shrink-0" />
      <div className="flex-1">
        <span className="text-text-muted text-xs">{label}</span>
        <p className="font-mono text-lg font-semibold">
          {typeof value === 'number' ? value.toFixed(1) : value}
          <span className="text-text-muted text-xs ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}

export default function TimeOffSummary({ data }) {
  const { ore, ferie_permessi } = data;

  const hasOre = ore && (ore.ordinarie != null || ore.telelavoro != null);
  const hasFerie = ferie_permessi?.ferie?.residue != null || ferie_permessi?.ferie?.residue_ap != null;
  const hasPermessi = ferie_permessi?.permessi_par?.residui != null || ferie_permessi?.permessi_par?.residui_ap != null;

  if (!hasOre && !hasFerie && !hasPermessi) return null;

  // Saldo disponibile = Residuo + Residuo AP
  const ferieSaldo = (ferie_permessi?.ferie?.residue ?? 0) + (ferie_permessi?.ferie?.residue_ap ?? 0);
  const permessiSaldo = (ferie_permessi?.permessi_par?.residui ?? 0) + (ferie_permessi?.permessi_par?.residui_ap ?? 0);
  const hasApFerie = ferie_permessi?.ferie?.residue_ap != null;
  const hasApPermessi = ferie_permessi?.permessi_par?.residui_ap != null;

  return (
    <Card>
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
        Ore, Ferie e Permessi
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {hasFerie && (
          <TimeOffCard icon={CalendarDays} label="Ferie disponibili" value={ferieSaldo} />
        )}
        {hasPermessi && (
          <TimeOffCard icon={Clock} label="Permessi PAR disponibili" value={permessiSaldo} />
        )}
      </div>

      {ferie_permessi && (hasFerie || hasPermessi) && (
        <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-sm text-text-muted">
          {hasFerie && ferie_permessi.ferie?.residue != null && (
            <span>Ferie residue anno: <strong className="text-text font-mono">{ferie_permessi.ferie.residue}</strong> ore</span>
          )}
          {hasApFerie && (
            <span>Ferie residue AP: <strong className="text-text font-mono">{ferie_permessi.ferie.residue_ap}</strong> ore</span>
          )}
          {hasPermessi && ferie_permessi.permessi_par?.residui != null && (
            <span>Permessi residui anno: <strong className="text-text font-mono">{ferie_permessi.permessi_par.residui}</strong> ore</span>
          )}
          {hasApPermessi && (
            <span>Permessi residui AP: <strong className="text-text font-mono">{ferie_permessi.permessi_par.residui_ap}</strong> ore</span>
          )}
        </div>
      )}

      {hasOre && (
        <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-sm text-text-muted">
          {ore.ordinarie != null && (
            <span>Ore ordinarie: <strong className="text-text font-mono">{ore.ordinarie}</strong></span>
          )}
          {ore.telelavoro != null && (
            <span>Smart working: <strong className="text-text font-mono">{ore.telelavoro}</strong></span>
          )}
          {ore.straordinario != null && ore.straordinario > 0 && (
            <span>Straordinario: <strong className="text-text font-mono">{ore.straordinario}</strong></span>
          )}
          {ore.rol_par != null && (
            <span>ROL/PAR usati: <strong className="text-text font-mono">{ore.rol_par}</strong></span>
          )}
        </div>
      )}
    </Card>
  );
}
