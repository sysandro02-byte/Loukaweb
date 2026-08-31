import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminsPage } from './pages/AdminsPage';
import { ActivityPage } from './pages/ActivityPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MediaPage } from './pages/MediaPage';
import { MessagesPage } from './pages/MessagesPage';
import { PagesPage } from './pages/PagesPage';
import { ServicesPage } from './pages/ServicesPage';
import { VisitorsPage } from './pages/VisitorsPage';
import { AdminHeavenSettings } from './pages/AdminHeavenSettings';
import { AiControlPage } from './pages/AiControlPage';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-600">Chargement...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="pages" element={<PagesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="visitors" element={<VisitorsPage />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="ai-control" element={<AiControlPage />} />
          <Route path="heaven" element={<AdminHeavenSettings />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="activity" element={<ActivityPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
