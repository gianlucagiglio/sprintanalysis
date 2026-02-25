import { cn } from './cn';

export default function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-surface-hover',
        className
      )}
    />
  );
}
