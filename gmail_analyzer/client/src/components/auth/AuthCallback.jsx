import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    const error = params.get('error');
    if (error) {
      navigate('/', { replace: true });
      return;
    }

    checkAuth().then(() => {
      navigate('/scan', { replace: true });
    });
  }, [params, navigate, checkAuth]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex items-center gap-3 text-text-muted">
        <Loader2 size={20} className="animate-spin" />
        <span>Autenticazione in corso...</span>
      </div>
    </div>
  );
}
