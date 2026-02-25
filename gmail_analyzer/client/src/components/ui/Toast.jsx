import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import useUiStore from '../../stores/uiStore';
import { cn } from './cn';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: 'border-green-500/30 bg-green-500/10 text-green-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
};

export default function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg min-w-[300px] animate-slide-up',
              styles[toast.type] || styles.info
            )}
          >
            <Icon size={18} />
            <span className="text-sm flex-1">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
