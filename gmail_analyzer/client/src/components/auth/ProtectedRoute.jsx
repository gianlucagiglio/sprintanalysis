import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
