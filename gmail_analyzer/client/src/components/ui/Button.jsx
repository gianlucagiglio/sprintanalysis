import { cn } from './cn';

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  danger: 'bg-danger text-white hover:bg-danger-hover',
  ghost: 'bg-transparent text-text-muted hover:bg-surface-hover hover:text-text',
  outline: 'border border-border text-text-muted hover:bg-surface-hover hover:text-text',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
