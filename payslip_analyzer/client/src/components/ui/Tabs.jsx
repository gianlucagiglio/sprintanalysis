import { createContext, useContext } from 'react';

const TabsContext = createContext({ value: null, onChange: () => {} });

export function Tabs({ value, onChange, children }) {
  return (
    <TabsContext.Provider value={{ value, onChange }}>
      <div className="flex items-center gap-1 border-b border-border">
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function Tab({ value, label, icon: Icon, disabled, badge }) {
  const { value: activeValue, onChange } = useContext(TabsContext);
  if (disabled) return null;
  const isActive = activeValue === value;

  return (
    <button
      onClick={() => onChange(value)}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer
        ${isActive ? 'text-accent' : 'text-text-muted hover:text-text'}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {badge != null && (
        <span className="bg-accent/20 text-accent text-xs font-mono px-1.5 py-0.5 rounded-full leading-none">
          {badge}
        </span>
      )}
      {isActive && (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full" />
      )}
    </button>
  );
}
