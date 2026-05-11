import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const TARGET_EMAIL = 'gianluca.giglio@gmail.com'

interface Section {
  id: string
  name: string
  sort_order: number
}

interface Comment {
  id: string
  text: string
  user_id: string
  section_id: string
  group_id: string | null
  profiles: { name: string }
}

interface Action {
  id: string
  text: string
  status: 'todo' | 'in_progress' | 'done'
  deadline: string | null
  assigned_to_multi: string[]
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Parse request body safely
    let sessionId: string | undefined
    try {
      const body = await req.json()
      sessionId = body?.sessionId
    } catch (e) {
      console.error('Failed to parse JSON body:', e)
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    if (!sessionId) {
      console.error('Missing sessionId in request')
      return new Response(JSON.stringify({ error: 'sessionId required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    console.log('Processing session:', sessionId)

    // Initialize Supabase client with service role key
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)

    // Fetch session data
    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (!session) {
      console.error('Session not found:', sessionId)
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    console.log('Session found:', session.title)

    // Fetch sections
    const { data: sections } = await supabase
      .from('sections')
      .select('*')
      .eq('session_id', sessionId)
      .order('sort_order')

    // Fetch comments with user names (FIX: use .in() not .eq())
    const sectionIds = sections?.map((s) => s.id) || []
    const { data: comments } = sectionIds.length > 0
      ? await supabase
          .from('comments')
          .select('*, profiles(name)')
          .in('section_id', sectionIds)
      : { data: [] }

    // Fetch actions
    const { data: actions } = await supabase
      .from('actions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at')

    // Fetch mood votes
    const { data: moodVotes } = await supabase
      .from('mood_votes')
      .select('*, profiles(name)')
      .eq('session_id', sessionId)

    // Fetch quiz answers with user names
    const { data: quizAnswers } = await supabase
      .from('quiz_answers')
      .select('*, profiles(name), quiz_questions(question)')
      .in('question_id', `(SELECT id FROM quiz_questions WHERE session_id = '${sessionId}')`)

    // Fetch participants
    const { data: participants } = await supabase
      .from('session_participants')
      .select('*, profiles(name)')
      .eq('session_id', sessionId)

    // Fetch user names for actions
    const userIds = new Set<string>()
    actions?.forEach((a) => a.assigned_to_multi?.forEach((id: string) => userIds.add(id)))

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', Array.from(userIds))

    const userMap = new Map(profiles?.map((p) => [p.id, p.name]) || [])

    // Generate HTML email
    const html = generateEmailHTML(
      session,
      sections || [],
      comments || [],
      actions || [],
      userMap,
      moodVotes || [],
      quizAnswers || [],
      participants || []
    )

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'RetroBoard <onboarding@resend.dev>',
        to: [TARGET_EMAIL],
        subject: `📊 Recap Retrospettiva: ${session.title}`,
        html,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Resend error:', result)
      return new Response(JSON.stringify({ error: 'Failed to send email', details: result }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    console.log('Email sent successfully:', result.id)
    return new Response(JSON.stringify({ success: true, emailId: result.id }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})

function generateEmailHTML(
  session: any,
  sections: Section[],
  comments: Comment[],
  actions: Action[],
  userMap: Map<string, string>,
  moodVotes: any[],
  quizAnswers: any[],
  participants: any[]
): string {
  // Group comments by section
  const commentsBySection = new Map<string, Comment[]>()
  comments.forEach((c) => {
    if (!commentsBySection.has(c.section_id)) {
      commentsBySection.set(c.section_id, [])
    }
    commentsBySection.get(c.section_id)!.push(c)
  })

  // Calculate mood stats
  const moodCounts = moodVotes.reduce((acc: any, vote) => {
    const mood = vote.mood === 'custom' ? vote.custom_label : vote.mood
    acc[mood] = (acc[mood] || 0) + 1
    return acc
  }, {})
  const moodEmojis: any = {
    glad: '😊',
    sad: '😢',
    mad: '😠',
  }

  // Calculate quiz winner
  const quizScores = quizAnswers.reduce((acc: any, answer) => {
    if (!acc[answer.user_id]) {
      acc[answer.user_id] = { name: answer.profiles?.name || 'Unknown', points: 0 }
    }
    acc[answer.user_id].points += answer.points || 0
    return acc
  }, {})
  const quizLeaderboard = Object.values(quizScores)
    .sort((a: any, b: any) => b.points - a.points)
    .slice(0, 3)

  // Count pending actions
  const pendingActions = actions.filter((a) => a.status !== 'done').length

  const statusLabels = {
    todo: '📝 Da fare',
    in_progress: '⏳ In corso',
    done: '✅ Completato',
  }

  const statusColors = {
    todo: '#64748b',
    in_progress: '#f59e0b',
    done: '#10b981',
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; background: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0 0 8px 0; font-size: 28px; }
    .header p { margin: 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 32px 24px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
    .comment-card { background: #f8fafc; border-left: 3px solid #6366f1; padding: 12px 16px; margin-bottom: 12px; border-radius: 6px; }
    .comment-text { margin: 0 0 8px 0; color: #334155; }
    .comment-author { font-size: 12px; color: #64748b; font-weight: 500; }
    .actions-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .actions-table th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }
    .actions-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: white; }
    .footer { background: #f8fafc; padding: 24px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0; }
    .empty { color: #94a3b8; font-style: italic; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔄 ${session.title}</h1>
      <p>Recap della retrospettiva conclusa il ${new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>

    <div class="content">
      ${moodVotes.length > 0 ? `
        <div class="section">
          <h2 class="section-title">🎭 Mood Check</h2>
          <div style="display: flex; gap: 16px; flex-wrap: wrap;">
            ${Object.entries(moodCounts).map(([mood, count]: any) => `
              <div style="background: #f8fafc; padding: 16px 24px; border-radius: 12px; text-align: center; flex: 1; min-width: 120px;">
                <div style="font-size: 32px; margin-bottom: 8px;">${moodEmojis[mood] || '💭'}</div>
                <div style="font-size: 24px; font-weight: 700; color: #6366f1;">${count}</div>
                <div style="font-size: 12px; color: #64748b; text-transform: capitalize;">${mood}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${quizLeaderboard.length > 0 ? `
        <div class="section">
          <h2 class="section-title">🏆 Quiz - Classifica</h2>
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 24px; border-radius: 12px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="font-size: 48px;">🥇</div>
              <div>
                <div style="font-size: 20px; font-weight: 700; color: #92400e;">${quizLeaderboard[0].name}</div>
                <div style="font-size: 24px; font-weight: 700; color: #b45309;">${quizLeaderboard[0].points} punti</div>
              </div>
            </div>
          </div>
          ${quizLeaderboard.slice(1).map((player: any, idx: number) => `
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 24px;">${idx === 0 ? '🥈' : '🥉'}</div>
              <div style="flex: 1;">
                <div style="font-weight: 600; color: #334155;">${player.name}</div>
                <div style="font-size: 14px; color: #64748b;">${player.points} punti</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="section">
        <h2 class="section-title">📊 Statistiche Partecipazione</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #6366f1;">${participants.length}</div>
            <div style="font-size: 13px; color: #64748b;">Partecipanti</div>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #6366f1;">${comments.length}</div>
            <div style="font-size: 13px; color: #64748b;">Commenti totali</div>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; text-align: center;">
            <div style="font-size: 32px; font-weight: 700; color: #6366f1;">${actions.length}</div>
            <div style="font-size: 13px; color: #64748b;">Azioni create</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">📋 Riepilogo Sezioni</h2>
        ${sections.map((section) => {
          const sectionComments = commentsBySection.get(section.id) || []
          return `
            <div style="margin-bottom: 24px;">
              <h3 style="color: #6366f1; font-size: 18px; margin: 0 0 12px 0;">${section.name}</h3>
              ${sectionComments.length > 0
                ? sectionComments.map((c) => `
                  <div class="comment-card">
                    <p class="comment-text">${c.text}</p>
                    <div class="comment-author">— ${c.profiles?.name || 'Anonimo'}</div>
                  </div>
                `).join('')
                : '<p class="empty">Nessun commento in questa sezione</p>'
              }
            </div>
          `
        }).join('')}
      </div>

      <div class="section">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 class="section-title" style="margin: 0;">🎯 Action Items</h2>
          ${pendingActions > 0 ? `
            <a href="https://retroboard-4gu3.onrender.com/actions"
               style="background: #6366f1; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
              📋 Vedi ${pendingActions} azioni pendenti
            </a>
          ` : ''}
        </div>
        ${actions && actions.length > 0 ? `
          <table class="actions-table">
            <thead>
              <tr>
                <th style="width: 50%;">Azione</th>
                <th style="width: 20%;">Stato</th>
                <th style="width: 15%;">Deadline</th>
                <th style="width: 15%;">Assegnato a</th>
              </tr>
            </thead>
            <tbody>
              ${actions.map((action) => `
                <tr>
                  <td>${action.text}</td>
                  <td>
                    <span class="status-badge" style="background-color: ${statusColors[action.status]};">
                      ${statusLabels[action.status]}
                    </span>
                  </td>
                  <td>${action.deadline ? new Date(action.deadline).toLocaleDateString('it-IT') : '—'}</td>
                  <td>${action.assigned_to_multi?.map((id: string) => userMap.get(id) || '?').join(', ') || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p class="empty">Nessuna azione definita</p>'}
      </div>
    </div>

    <div class="footer">
      <p>🔄 <strong>RetroBoard</strong> | Powered by Supabase</p>
      <p style="margin-top: 8px; font-size: 12px;">Questa email è stata generata automaticamente alla chiusura della retrospettiva.</p>
    </div>
  </div>
</body>
</html>
  `
}
