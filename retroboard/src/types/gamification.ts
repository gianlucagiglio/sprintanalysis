// ============================================
// GAMIFICATION TYPES
// ============================================

export type ActionType =
  | 'participate'           // +10
  | 'comment'              // +5
  | 'vote'                 // +2
  | 'action_create'        // +8
  | 'action_complete'      // +15
  | 'mood_vote'            // +3
  | 'quiz_correct'         // +10
  | 'quiz_win'             // +30
  | 'streak_bonus'         // variabile
  | 'early_bird'           // bonus

export type BadgeCategory = 'participation' | 'contribution' | 'team' | 'special'

export type UserPoints = {
  id: string
  user_id: string
  team_id: string | null
  points: number
  level: number
  created_at: string
  updated_at: string
}

export type PointTransaction = {
  id: string
  user_id: string
  session_id: string | null
  action_id: string | null
  action_type: ActionType
  points: number
  description: string | null
  metadata: Record<string, any> | null
  created_at: string
}

export type BadgeDefinition = {
  code: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  criteria: {
    type: string
    threshold: number
    days?: number
  }
  sort_order: number
  is_secret: boolean
  created_at: string
}

export type UserBadge = {
  id: string
  user_id: string
  badge_code: string
  unlocked_at: string
  seen: boolean
}

export type UserBadgeWithDefinition = UserBadge & {
  badge: BadgeDefinition
}

export type UserStats = {
  user_id: string
  team_id: string | null
  retrospectives_count: number
  comments_count: number
  votes_given: number
  actions_completed: number
  sessions_organized: number
}

// Points configuration
export const POINTS_CONFIG: Record<ActionType, number> = {
  participate: 10,
  comment: 5,
  vote: 2,
  action_create: 8,
  action_complete: 15,
  mood_vote: 3,
  quiz_correct: 10,
  quiz_win: 30,
  streak_bonus: 0, // calcolato dinamicamente
  early_bird: 0,   // bonus percentuale
}

// Level thresholds
export const LEVEL_THRESHOLDS = [
  { level: 1, minPoints: 0, maxPoints: 99 },
  { level: 2, minPoints: 100, maxPoints: 399 },
  { level: 3, minPoints: 400, maxPoints: 899 },
  { level: 4, minPoints: 900, maxPoints: 1599 },
  { level: 5, minPoints: 1600, maxPoints: 2499 },
  { level: 6, minPoints: 2500, maxPoints: 3599 },
  { level: 7, minPoints: 3600, maxPoints: 4899 },
  { level: 8, minPoints: 4900, maxPoints: 6399 },
  { level: 9, minPoints: 6400, maxPoints: 8099 },
  { level: 10, minPoints: 8100, maxPoints: 9999 },
]

export function calculateLevel(points: number): number {
  return Math.max(1, Math.floor(Math.sqrt(points / 100)) + 1)
}

export function getNextLevelPoints(currentPoints: number): number {
  const currentLevel = calculateLevel(currentPoints)
  // Formula inversa: points = (level - 1)^2 * 100
  const nextLevelPoints = Math.pow(currentLevel, 2) * 100
  return nextLevelPoints
}

export function getLevelProgress(points: number): number {
  const currentLevel = calculateLevel(points)
  const currentLevelMinPoints = Math.pow(currentLevel - 1, 2) * 100
  const nextLevelPoints = Math.pow(currentLevel, 2) * 100
  const pointsInLevel = points - currentLevelMinPoints
  const pointsNeeded = nextLevelPoints - currentLevelMinPoints
  return Math.min(100, Math.round((pointsInLevel / pointsNeeded) * 100))
}
