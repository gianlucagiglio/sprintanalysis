export default function Button({ children, onClick, disabled, variant = 'primary', className = '' }) {
  const base = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-white',
    ghost: 'bg-transparent hover:bg-surface-hover text-text-muted hover:text-text',
    danger: 'bg-danger/10 hover:bg-danger/20 text-danger',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
