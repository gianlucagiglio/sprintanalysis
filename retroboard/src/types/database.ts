export type Profile = {
  id: string
  name: string
  email: string
  avatar_url: string | null
  is_super_admin: boolean
  created_at: string
}

export type Session = {
  id: string
  title: string
  organizer_id: string
  team_id: string | null
  quiz_theme_id: string | null
  current_step: number
  retro_phase: 'comments' | 'voting' | 'grouping' | 'brainstorming' | 'action_plan'
  retro_revealed: boolean
  quiz_current_index: number
  max_participants: number
  max_votes: number
  phase_timer_duration: number
  phase_timer_started_at: string | null
  created_at: string
}

export type SessionParticipant = {
  id: string
  session_id: string
  user_id: string
  role: 'organizer' | 'participant'
  is_done: boolean
  can_group: boolean
  joined_at: string
}

export type Section = {
  id: string
  session_id: string
  name: string
  requires_interaction: boolean
  sort_order: number
}

export type Comment = {
  id: string
  section_id: string
  user_id: string
  text: string
  group_id: string | null
  is_resolved: boolean
  discussion_status: 'pending' | 'discussing' | 'discussed'
  sentiment: 'positive' | 'negative' | 'neutral' | null
  created_at: string
}

export type Vote = {
  id: string
  comment_id: string
  user_id: string
  value: number
}

export type Action = {
  id: string
  session_id: string
  comment_id: string | null
  text: string
  assigned_to: string | null
  assigned_to_multi: string[]
  deadline: string | null
  status: 'todo' | 'in_progress' | 'done'
  notes: string | null
  resolution: string | null
  created_at: string
}

export type QuizQuestion = {
  id: string
  session_id: string
  question: string
  choices: string[]
  correct_choice: number
  sort_order: number
}

export type QuizAnswer = {
  id: string
  question_id: string
  user_id: string
  choice: number
  time_taken: number
  points: number
}

export type Team = {
  id: string
  name: string
  invite_code: string
  owner_id: string
  created_at: string
}

export type TeamMember = {
  id: string
  team_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

export type MoodVote = {
  id: string
  session_id: string
  user_id: string
  mood: 'glad' | 'sad' | 'mad' | 'custom'
  custom_label: string | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at'>; Update: Partial<Profile> }
      sessions: { Row: Session; Insert: Omit<Session, 'id' | 'created_at' | 'current_step' | 'retro_phase' | 'retro_revealed' | 'max_votes' | 'phase_timer_duration' | 'phase_timer_started_at'>  & { max_votes?: number }; Update: Partial<Session> }
      session_participants: { Row: SessionParticipant; Insert: Omit<SessionParticipant, 'id' | 'joined_at' | 'is_done' | 'can_group'>; Update: Partial<SessionParticipant> }
      sections: { Row: Section; Insert: Omit<Section, 'id'>; Update: Partial<Section> }
      comments: { Row: Comment; Insert: Omit<Comment, 'id' | 'created_at'>; Update: Partial<Comment> }
      votes: { Row: Vote; Insert: Omit<Vote, 'id'>; Update: Partial<Vote> }
      actions: { Row: Action; Insert: Omit<Action, 'id' | 'created_at' | 'status' | 'assigned_to_multi'>; Update: Partial<Action> }
      quiz_questions: { Row: QuizQuestion; Insert: Omit<QuizQuestion, 'id'>; Update: Partial<QuizQuestion> }
      quiz_answers: { Row: QuizAnswer; Insert: Omit<QuizAnswer, 'id' | 'points'>; Update: Partial<QuizAnswer> }
      mood_votes: { Row: MoodVote; Insert: Omit<MoodVote, 'id' | 'created_at'>; Update: Partial<MoodVote> }
      teams: { Row: Team; Insert: Omit<Team, 'id' | 'invite_code' | 'created_at'>; Update: Partial<Team> }
      team_members: { Row: TeamMember; Insert: Omit<TeamMember, 'id' | 'joined_at'>; Update: Partial<TeamMember> }
    }
  }
}
