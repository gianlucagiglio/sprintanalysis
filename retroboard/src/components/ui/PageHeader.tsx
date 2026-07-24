import { ReactNode } from 'react'
import { ArrowLeft, LucideIcon } from 'lucide-react'
import { Badge, BadgeVariant } from './Badge'
import { Button } from './Button'
import { motion } from 'framer-motion'

type HeaderVariant = 'hero' | 'standard' | 'navigation' | 'centered'
type GradientColor = 'primary' | 'success' | 'warning' | 'trophy' | 'emerald' | 'amber'

interface PageHeaderProps {
  // Core
  variant?: HeaderVariant
  title: string
  description?: string

  // Visual
  icon?: LucideIcon
  iconSize?: number
  gradient?: GradientColor

  // Metadata
  badge?: {
    label: string
    variant?: BadgeVariant
  }

  // Actions
  actions?: ReactNode
  onBack?: () => void

  // Custom
  children?: ReactNode
  className?: string
}

const gradientClasses: Record<GradientColor, string> = {
  primary: 'from-indigo-500 via-purple-500 to-pink-500',
  success: 'from-emerald-500 via-teal-500 to-cyan-500',
  warning: 'from-amber-500 via-orange-500 to-red-500',
  trophy: 'from-amber-400 via-yellow-400 to-amber-500',
  emerald: 'from-emerald-400 via-green-400 to-teal-400',
  amber: 'from-amber-400 via-orange-400 to-red-400',
}

const gradientTextClasses: Record<GradientColor, string> = {
  primary: 'from-indigo-600 via-purple-600 to-pink-600',
  success: 'from-emerald-600 via-teal-600 to-cyan-600',
  warning: 'from-amber-600 via-orange-600 to-red-600',
  trophy: 'from-amber-500 via-yellow-500 to-amber-600',
  emerald: 'from-emerald-500 via-green-500 to-teal-500',
  amber: 'from-amber-500 via-orange-500 to-red-500',
}

export function PageHeader({
  variant = 'standard',
  title,
  description,
  icon: Icon,
  iconSize = 24,
  gradient = 'primary',
  badge,
  actions,
  onBack,
  children,
  className = '',
}: PageHeaderProps) {
  // Hero Header - Feature pages
  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradientClasses[gradient]} p-8 md:p-12 shadow-xl ${className}`}
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Left: Content */}
            <div className="flex-1 space-y-4">
              {/* Badge + Title Row */}
              <div className="flex flex-wrap items-center gap-3">
                {badge && (
                  <Badge
                    variant={badge.variant || 'default'}
                    className="!bg-white/20 !backdrop-blur-md !border-white/40 !text-white !font-bold !shadow-lg"
                  >
                    {badge.label}
                  </Badge>
                )}
                <h1 className="text-3xl font-display font-bold text-white md:text-4xl tracking-tight">
                  {title}
                </h1>
              </div>

              {/* Description */}
              {description && (
                <p className="text-base text-white/90 font-medium max-w-2xl leading-relaxed md:text-lg">
                  {description}
                </p>
              )}

              {/* Custom children */}
              {children && <div className="pt-2">{children}</div>}
            </div>

            {/* Right: Decorative Icon */}
            {Icon && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="hidden md:block"
              >
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 blur-2xl opacity-40 bg-white rounded-full" />
                  {/* Icon container */}
                  <div className="relative w-32 h-32 rounded-3xl bg-white/20 backdrop-blur-md border-4 border-white/40 flex items-center justify-center shadow-2xl">
                    <Icon size={64} className="text-white" strokeWidth={1.5} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Navigation Header - With back button
  if (variant === 'navigation') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`space-y-4 ${className}`}
      >
        {/* Back button + Badge */}
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="!p-2"
            >
              <ArrowLeft size={18} />
            </Button>
          )}
          {badge && (
            <Badge variant={badge.variant || 'primary'}>
              {badge.label}
            </Badge>
          )}
        </div>

        {/* Title + Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClasses[gradient]} flex items-center justify-center shadow-lg`}>
                <Icon size={iconSize} className="text-white" />
              </div>
            )}
            <div>
              <h1 className={`text-2xl font-display font-bold bg-gradient-to-r ${gradientTextClasses[gradient]} bg-clip-text text-transparent md:text-3xl`}>
                {title}
              </h1>
              {description && (
                <p className="text-sm text-retro-text-secondary mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>

        {children && <div className="pt-2">{children}</div>}
      </motion.div>
    )
  }

  // Centered Header - Forms, wizards, voting
  if (variant === 'centered') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-center space-y-3 ${className}`}
      >
        {badge && (
          <div className="flex justify-center">
            <Badge variant={badge.variant || 'primary'}>
              {badge.label}
            </Badge>
          </div>
        )}

        <h2 className={`text-2xl font-display font-bold bg-gradient-to-r ${gradientTextClasses[gradient]} bg-clip-text text-transparent md:text-3xl`}>
          {title}
        </h2>

        {description && (
          <p className="text-sm text-retro-text-secondary max-w-xl mx-auto">
            {description}
          </p>
        )}

        {children && <div className="pt-4">{children}</div>}
      </motion.div>
    )
  }

  // Standard Header - Default for most pages
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col gap-4 md:flex-row md:items-center md:justify-between ${className}`}
    >
      {/* Left: Icon + Title + Description */}
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClasses[gradient]} flex items-center justify-center shadow-lg shrink-0`}>
            <Icon size={iconSize} className="text-white" />
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className={`text-2xl font-display font-bold bg-gradient-to-r ${gradientTextClasses[gradient]} bg-clip-text text-transparent md:text-3xl`}>
              {title}
            </h1>
            {badge && (
              <Badge variant={badge.variant || 'primary'}>
                {badge.label}
              </Badge>
            )}
          </div>

          {description && (
            <p className="text-sm text-retro-text-secondary max-w-2xl">
              {description}
            </p>
          )}

          {children && <div className="pt-2">{children}</div>}
        </div>
      </div>

      {/* Right: Actions */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </motion.div>
  )
}
