import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SortAsc, SortDesc, ScanSearch, Filter } from 'lucide-react';
import useEmailStore from '../../stores/emailStore';
import useUiStore from '../../stores/uiStore';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import BulkActions from '../actions/BulkActions';
import SenderCard from './SenderCard';
import { CATEGORIES } from '../../lib/categorizer';

export default function SenderList() {
  const { clusters, filters, setFilters } = useEmailStore();
  const { selectedSenders, selectAll, deselectAll } = useUiStore();
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let result = [...clusters];

    if (filters.category) {
      result = result.filter((c) => c.category === filters.category);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q)
      );
    }

    const dir = filters.sortDir === 'asc' ? 1 : -1;
    switch (filters.sortBy) {
      case 'count':
        result.sort((a, b) => (a.count - b.count) * dir);
        break;
      case 'unread':
        result.sort((a, b) => (a.unread - b.unread) * dir);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name) * dir);
        break;
    }

    return result;
  }, [clusters, filters]);

  if (clusters.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Mittenti</h1>
        <Card className="text-center py-16">
          <ScanSearch size={48} className="text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Nessun dato disponibile</h2>
          <p className="text-text-muted text-sm mb-6">
            Esegui prima una scansione della tua inbox.
          </p>
          <Button onClick={() => navigate('/scan')}>
            <ScanSearch size={16} />
            Vai a Scan
          </Button>
        </Card>
      </div>
    );
  }

  const allFilteredEmails = filtered.map((c) => c.email);
  const allSelected = allFilteredEmails.length > 0 &&
    allFilteredEmails.every((e) => selectedSenders.has(e));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mittenti</h1>
        <span className="text-sm text-text-muted">
          {filtered.length} mittenti
        </span>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Cerca mittente..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-surface border border-border text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilters({ category: null })}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer ${
              !filters.category
                ? 'bg-accent/10 border-accent text-accent'
                : 'border-border text-text-muted hover:border-text-muted'
            }`}
          >
            Tutte
          </button>
          {Object.entries(CATEGORIES).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setFilters({ category: filters.category === key ? null : key })}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer ${
                filters.category === key
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'border-border text-text-muted hover:border-text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ sortBy: e.target.value })}
          className="px-3 py-2 text-xs rounded-lg bg-surface border border-border text-text-muted cursor-pointer"
        >
          <option value="count">Quantità</option>
          <option value="unread">Non lette</option>
          <option value="name">Nome</option>
        </select>
        <button
          onClick={() => setFilters({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })}
          className="p-2 rounded-lg border border-border hover:bg-surface-hover text-text-muted cursor-pointer"
        >
          {filters.sortDir === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
        </button>
      </div>

      {/* Select all / Bulk actions */}
      {selectedSenders.size > 0 && (
        <BulkActions senders={filtered.filter((c) => selectedSenders.has(c.email))} />
      )}

      {/* Select all toggle */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => {
              if (allSelected) deselectAll();
              else selectAll(allFilteredEmails);
            }}
            className="rounded accent-accent"
          />
          Seleziona tutti ({filtered.length})
        </label>
      </div>

      {/* Sender cards */}
      <div className="space-y-2">
        {filtered.map((cluster) => (
          <SenderCard key={cluster.email} cluster={cluster} />
        ))}
      </div>
    </div>
  );
}
