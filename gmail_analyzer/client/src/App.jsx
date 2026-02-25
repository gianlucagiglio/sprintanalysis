import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';
import LoginPage from './components/auth/LoginPage';
import AuthCallback from './components/auth/AuthCallback';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import ScanPage from './components/scan/ScanPage';
import Dashboard from './components/dashboard/Dashboard';
import SenderList from './components/senders/SenderList';
import DeleteConfirm from './components/actions/DeleteConfirm';
import MarkReadConfirm from './components/actions/MarkReadConfirm';
import FilterCreator from './components/actions/FilterCreator';
import UnsubscribeHelper from './components/actions/UnsubscribeHelper';
import ToastContainer from './components/ui/Toast';

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/senders" element={<SenderList />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global modals */}
      <DeleteConfirm />
      <MarkReadConfirm />
      <FilterCreator />
      <UnsubscribeHelper />
      <ToastContainer />
    </BrowserRouter>
  );
}
