import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import type { Comment, Vote, Section } from '@/types/database'

interface LiveVotingChartProps {
  comments: Comment[]
  votes: Vote[]
  sections: Section[]
  revealed: boolean
  voterNames?: Map<string, string[]>
}

const sectionColors = {
  0: '#10B981', // emerald - positivo
  1: '#F43F5E', // rose - negativo
  2: '#0EA5E9', // sky - neutro
}

export function LiveVotingChart({ comments, votes, sections, revealed, voterNames }: LiveVotingChartProps) {
  // Calculate vote counts per comment
  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote.comment_id] = (acc[vote.comment_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Build data with only comments that have votes
  const commentData = comments
    .filter((comment) => voteCounts[comment.id] > 0)
    .map((comment) => {
      const section = sections.find((s) => s.id === comment.section_id)
      const sectionIndex = section ? section.sort_order : 2
      const truncatedText = comment.text.length > 40 ? comment.text.slice(0, 40) + '...' : comment.text

      return {
        id: comment.id,
        text: truncatedText,
        fullText: comment.text,
        votes: voteCounts[comment.id],
        color: sectionColors[sectionIndex as keyof typeof sectionColors] || sectionColors[2],
        sectionName: section?.name || 'Altro',
        voters: voterNames?.get(comment.id) || [],
      }
    })
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 10) // Top 10 only

  if (commentData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/80 flex items-center justify-center">
          <BarChart3 size={32} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-retro-text mb-2">Risultati Votazione</h3>
        <p className="text-sm text-retro-text-secondary">Nessun commento ha ancora ricevuto voti</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload
    return (
      <div className="bg-white border-2 border-slate-200 rounded-xl shadow-2xl p-4 max-w-sm">
        <p className="font-semibold text-retro-text mb-1">{data.fullText}</p>
        <p className="text-sm text-retro-text-secondary mb-2">
          {data.sectionName} • {data.votes} {data.votes === 1 ? 'voto' : 'voti'}
        </p>
        {revealed && data.voters.length > 0 && (
          <div className="text-xs text-retro-text-tertiary mt-2 pt-2 border-t border-slate-200">
            <p className="font-medium mb-1">Votato da:</p>
            <p>{data.voters.join(', ')}</p>
          </div>
        )}
        {!revealed && (
          <p className="text-xs text-retro-text-tertiary mt-2 pt-2 border-t border-slate-200">
            I nomi saranno visibili dopo la rivelazione
          </p>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <BarChart3 size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-retro-text">Risultati in tempo reale</h3>
        </div>
        <p className="text-sm text-retro-text-secondary">
          Top 10 commenti più votati
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={Math.max(commentData.length * 60, 300)}>
        <BarChart
          data={commentData}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            stroke="#CBD5E1"
          />
          <YAxis
            type="category"
            dataKey="text"
            tick={{ fill: '#64748B', fontSize: 11 }}
            width={150}
            stroke="#CBD5E1"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
          <Bar dataKey="votes" radius={[0, 8, 8, 0]}>
            {commentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
