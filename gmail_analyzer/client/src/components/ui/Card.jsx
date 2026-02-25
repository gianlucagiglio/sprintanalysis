import { cn } from './cn';

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-sm font-semibold text-text-muted uppercase tracking-wider', className)}>
      {children}
    </h3>
  );
}
