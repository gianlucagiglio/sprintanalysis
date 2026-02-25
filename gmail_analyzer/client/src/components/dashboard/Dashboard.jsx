import { useNavigate } from 'react-router-dom';
import { Mail, Users, Eye, HardDrive, ScanSearch } from 'lucide-react';
import useEmailStore from '../../stores/emailStore';
import Card, { CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import TopSendersChart from './TopSendersChart';
import CategoryBreakdown from './CategoryBreakdown';
import FrequencyTimeline from './FrequencyTimeline';
import UnreadRatioChart from './UnreadRatioChart';
import { formatNumber, formatBytes } from '../../lib/formatters';

export default function Dashboard() {
  const { emails, clusters } = useEmailStore();
  const navigate = useNavigate();

  if (emails.length === 0 && clusters.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
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

  const totalEmails = emails.length > 0
    ? emails.length
    : clusters.reduce((sum, c) => sum + c.count, 0);
  const totalUnread = emails.length > 0
    ? emails.filter((e) => e.labelIds?.includes('UNREAD')).length
    : clusters.reduce((sum, c) => sum + c.unread, 0);
  const totalSize = emails.length > 0
    ? emails.reduce((sum, e) => sum + (e.sizeEstimate || 0), 0)
    : clusters.reduce((sum, c) => sum + c.totalSize, 0);
  const uniqueSenders = clusters.length;

  const stats = [
    { label: 'Email totali', value: formatNumber(totalEmails), icon: Mail },
    { label: 'Mittenti unici', value: formatNumber(uniqueSenders), icon: Users },
    { label: 'Non lette', value: formatNumber(totalUnread), icon: Eye },
    { label: 'Spazio stimato', value: formatBytes(totalSize), icon: HardDrive },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Icon size={18} className="text-accent" />
              </div>
              <div>
                <p className="font-mono text-xl font-bold">{value}</p>
                <p className="text-xs text-text-muted">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Top 20 Mittenti</CardTitle></CardHeader>
            <TopSendersChart clusters={clusters} />
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Categorie</CardTitle></CardHeader>
          <CategoryBreakdown emails={emails} clusters={clusters} />
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Email nel tempo</CardTitle></CardHeader>
          <FrequencyTimeline emails={emails} />
        </Card>
        <Card>
          <CardHeader><CardTitle>Volume vs Non lette</CardTitle></CardHeader>
          <UnreadRatioChart clusters={clusters} />
        </Card>
      </div>
    </div>
  );
}
