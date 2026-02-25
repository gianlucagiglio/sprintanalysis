const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const numberFormatter = new Intl.NumberFormat('it-IT');

export function formatDate(ts) {
  if (!ts) return '—';
  return dateFormatter.format(new Date(ts));
}

export function formatDateTime(ts) {
  if (!ts) return '—';
  return dateTimeFormatter.format(new Date(ts));
}

export function formatNumber(n) {
  return numberFormatter.format(n);
}

export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function formatPercent(ratio) {
  return `${Math.round(ratio * 100)}%`;
}

export function timeAgo(ts) {
  if (!ts) return '';
  const seconds = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (seconds < 60) return 'ora';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min fa`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h fa`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}g fa`;
  return formatDate(ts);
}
