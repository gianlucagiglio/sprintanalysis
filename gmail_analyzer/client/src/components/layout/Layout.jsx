import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import useUiStore from '../../stores/uiStore';
import { cn } from '../ui/cn';

export default function Layout() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <main
        className={cn(
          'min-h-screen transition-all duration-200',
          sidebarOpen ? 'ml-56' : 'ml-16'
        )}
      >
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
