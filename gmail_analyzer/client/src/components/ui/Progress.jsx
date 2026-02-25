import { cn } from './cn';

export default function Progress({ value = 0, className }) {
  return (
    <div className={cn('h-2 w-full rounded-full bg-surface-hover overflow-hidden', className)}>
      <div
        className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
