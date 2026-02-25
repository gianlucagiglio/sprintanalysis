import { cn } from './cn';
import { CATEGORIES } from '../../lib/categorizer';

export default function Badge({ category, className }) {
  const cat = CATEGORIES[category];
  if (!cat) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        cat.bg,
        cat.text,
        className
      )}
    >
      {cat.label}
    </span>
  );
}
