import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useBadges } from '@/hooks/useBadges'
import { Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BadgeShowcaseProps {
  compact?: boolean
  limit?: number
}

export function BadgeShowcase({ compact = false, limit }: BadgeShowcaseProps) {
  const { userBadges, lockedBadges, loading } = useBadges()

  if (loading) {
    return (
      <Card className="!p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="w-12 h-12 bg-slate-200 rounded-xl" />
            <div className="w-12 h-12 bg-slate-200 rounded-xl" />
            <div className="w-12 h-12 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </Card>
    )
  }

  const displayedBadges = limit ? userBadges.slice(0, limit) : userBadges
  const displayedLocked = limit && lockedBadges.length > 3 ? lockedBadges.slice(0, 3) : lockedBadges

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5">
        {displayedBadges.slice(0, 5).map((userBadge) => (
          <div
            key={userBadge.id}
            className="text-2xl"
            title={userBadge.badge.name}
          >
            {userBadge.badge.icon}
          </div>
        ))}
        {userBadges.length > 5 && (
          <span className="text-xs text-retro-text-secondary font-medium">
            +{userBadges.length - 5}
          </span>
        )}
      </div>
    )
  }

  return (
    <Card className="!p-5 !rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-retro-text flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500" />
          I Tuoi Badge
        </h3>
        <Badge variant="primary">
          {userBadges.length}/{userBadges.length + lockedBadges.length}
        </Badge>
      </div>

      {/* Unlocked Badges */}
      {userBadges.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 mb-4">
          <AnimatePresence>
            {displayedBadges.map((userBadge, i) => (
              <motion.div
                key={userBadge.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative"
              >
                <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 flex items-center justify-center text-3xl cursor-pointer hover:scale-110 transition-transform shadow-md hover:shadow-lg">
                  {userBadge.badge.icon}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {userBadge.badge.name}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-sm text-retro-text-secondary text-center py-6">
          Nessun badge sbloccato ancora. Inizia a partecipare alle retrospettive!
        </p>
      )}

      {/* Locked Badges Preview */}
      {displayedLocked.length > 0 && (
        <>
          <div className="border-t border-retro-border pt-4 mt-2">
            <p className="text-xs font-medium text-retro-text-secondary mb-3">
              🔒 Badge Bloccati
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {displayedLocked.map((badge) => (
                <div
                  key={badge.code}
                  className="group relative"
                  title={badge.is_secret ? 'Badge segreto' : badge.name}
                >
                  <div className="w-full aspect-square rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-2xl opacity-40 cursor-help">
                    {badge.is_secret ? '🔒' : badge.icon}
                  </div>
                  {!badge.is_secret && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 max-w-[150px] text-center">
                      {badge.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
