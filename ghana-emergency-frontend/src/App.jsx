import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';

// Dashboard Components
import SystemAdminDashboard from './components/dashboards/SystemAdminDashboard';
import HospitalAdminDashboard from './components/dashboards/HospitalAdminDashboard';
import PoliceAdminDashboard from './components/dashboards/PoliceAdminDashboard';
import FireAdminDashboard from './components/dashboards/FireAdminDashboard';
import AnalyticsDashboard from './components/dashboards/AnalyticsDashboard';

// Incident Components
import CreateIncident from './components/incidents/CreateIncident';
import IncidentList from './components/incidents/IncidentList';

// Extra Components
import UserProfile from './components/profile/UserProfile';
import AuditLogPage from './components/dashboards/AuditLogPage';

// Shared
import ProtectedRoute from './components/shared/ProtectedRoute';
import NotificationOverlay from './components/shared/NotificationOverlay';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DispatchHistoryProvider } from './contexts/DispatchHistoryContext';

// ─── NavigateSetter ───────────────────────────────────────────────────────────
// This tiny component lives inside BrowserRouter so it has access to
// useNavigate(). It registers the navigate function into AuthContext once on
// mount so that logout() can use React Router navigation instead of a hard
// window.location reload.
const NavigateSetter = () => {
  const navigate = useNavigate();
  const { setNavigate } = useAuth();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate, setNavigate]);
  return null;
};

// ─── App Routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <>
      <NavigateSetter />
      <NotificationOverlay />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'POLICE_ADMIN', 'FIRE_ADMIN']}>
            <SystemAdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/hospital" element={
          <ProtectedRoute allowedRoles={['HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}>
            <HospitalAdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/police" element={
          <ProtectedRoute allowedRoles={['POLICE_ADMIN', 'SYSTEM_ADMIN']}>
            <PoliceAdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/fire" element={
          <ProtectedRoute allowedRoles={['FIRE_ADMIN', 'SYSTEM_ADMIN']}>
            <FireAdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'POLICE_ADMIN', 'FIRE_ADMIN']}>
            <UserProfile />
          </ProtectedRoute>
        } />

        <Route path="/audit-logs" element={
          <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
            <AuditLogPage />
          </ProtectedRoute>
        } />

        <Route path="/incidents" element={
          <ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'POLICE_ADMIN', 'FIRE_ADMIN']}>
            <div className="p-8 lg:p-12 min-h-screen bg-slate-50 dark:bg-background-dark">
              <header className="flex justify-between items-center mb-12">
                <div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Incident Control</h1>
                  <p className="text-slate-500 font-medium italic">Operational Oversight & Fleet Management</p>
                </div>
                <Link to="/" className="flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all group">
                  <span className="material-symbols-outlined rotate-180">arrow_forward</span>
                  Back to Dashboard
                </Link>
              </header>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                <div className="xl:col-span-1"><CreateIncident /></div>
                <div className="xl:col-span-2"><IncidentList /></div>
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/unauthorized" element={
          <div className="flex flex-col items-center justify-center h-screen space-y-4">
            <h1 className="text-4xl font-black text-accent-red italic tracking-tighter uppercase underline decoration-2 underline-offset-8">Access Denied</h1>
            <p className="text-slate-500 font-medium italic">You do not have the necessary clearance level for this node.</p>
            <Link to="/" className="px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-sm">
              Return to Command
            </Link>
          </div>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
// Provider order matters:
//   AuthProvider must be outermost (other providers may read auth state)
//   DispatchHistoryProvider wraps routes that need dispatch context
function App() {
  return (
    <AuthProvider>
      <DispatchHistoryProvider>
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display selection:bg-primary/20">
          <AppRoutes />
        </div>
      </DispatchHistoryProvider>
    </AuthProvider>
  );
}

export default App;