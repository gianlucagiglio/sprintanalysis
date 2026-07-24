import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useBadges } from '@/hooks/useBadges'
import { Sparkles, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface BadgeShowcaseProps {
  compact?: boolean
  limit?: number
}

export function BadgeShowcase({ compact = false, limit }: BadgeShowcaseProps) {
  const { userBadges, lockedBadges, loading } = useBadges()
  const [hoveredBadgeId, setHoveredBadgeId] = useState<string | null>(null)

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
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mb-4">
          <AnimatePresence>
            {displayedBadges.map((userBadge, i) => {
              const isHovered = hoveredBadgeId === userBadge.id

              return (
                <motion.div
                  key={userBadge.id}
                  initial={{ opacity: 0, scale: 0.3, rotateY: -180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{
                    delay: i * 0.05,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{
                    scale: 1.15,
                    rotateZ: [0, -5, 5, -5, 0],
                    transition: { rotateZ: { duration: 0.5 } }
                  }}
                  className="group relative"
                  onMouseEnter={() => setHoveredBadgeId(userBadge.id)}
                  onMouseLeave={() => setHoveredBadgeId(null)}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />

                  {/* Badge container with shimmer */}
                  <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[3px] shadow-lg group-hover:shadow-2xl transition-shadow overflow-hidden">
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: isHovered ? '100%' : '-100%' }}
                      transition={{ duration: 0.6 }}
                    />

                    {/* Inner card */}
                    <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-white via-indigo-50 to-purple-50 flex items-center justify-center text-4xl cursor-pointer backdrop-blur-sm">
                      {userBadge.badge.icon}
                    </div>

                    {/* Sparkle particles on hover */}
                    {isHovered && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(8)].map((_, idx) => (
                          <motion.div
                            key={idx}
                            className="absolute"
                            initial={{
                              opacity: 0,
                              x: '50%',
                              y: '50%',
                              scale: 0
                            }}
                            animate={{
                              opacity: [0, 1, 0],
                              x: `${50 + (Math.random() - 0.5) * 100}%`,
                              y: `${50 + (Math.random() - 0.5) * 100}%`,
                              scale: [0, 1, 0],
                              rotate: Math.random() * 360
                            }}
                            transition={{
                              duration: 0.8,
                              delay: idx * 0.05,
                              ease: "easeOut"
                            }}
                          >
                            <Sparkles size={12} className="text-amber-400" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tooltip */}
                  <motion.div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-20 font-semibold"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {userBadge.badge.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-purple-600 rotate-45" />
                  </motion.div>
                </motion.div>
              )
            })}
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
            <p className="text-xs font-semibold text-retro-text-secondary mb-3 flex items-center gap-1.5">
              <Lock size={14} className="text-slate-400" />
              Badge Bloccati
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
              {displayedLocked.map((badge, i) => (
                <motion.div
                  key={badge.code}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="group relative"
                >
                  {/* Locked badge container */}
                  <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 p-[2px] shadow-md group-hover:shadow-lg transition-all overflow-hidden">
                    {/* Inner card with grayscale */}
                    <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-3xl cursor-help">
                      <div className="relative grayscale opacity-30 group-hover:opacity-50 transition-opacity">
                        {badge.is_secret ? '❓' : badge.icon}
                      </div>

                      {/* Lock icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-slate-400/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Lock size={16} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tooltip */}
                  {!badge.is_secret && (
                    <motion.div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 max-w-[200px] text-center font-medium leading-tight"
                      initial={{ y: 5 }}
                      whileHover={{ y: 0 }}
                    >
                      <div className="font-semibold mb-1">{badge.name}</div>
                      <div className="text-slate-300">{badge.description}</div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 rotate-45" />
                    </motion.div>
                  )}

                  {badge.is_secret && (
                    <motion.div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap font-semibold"
                      initial={{ y: 5 }}
                      whileHover={{ y: 0 }}
                    >
                      🤫 Badge Segreto
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-slate-800 rotate-45" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
