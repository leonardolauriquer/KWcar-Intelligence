
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PersonQuery from './pages/PersonQuery';
import VehicleQuery from './pages/VehicleQuery';
import VehicleCompare from './pages/VehicleCompare';
import Utilities from './pages/Utilities';
import Scanner from './pages/Scanner';
import Login from './pages/Login';
import ContactSales from './pages/ContactSales';
import Services from './pages/Services';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Componente para proteger rotas usando o Contexto
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

// Wrapper interno para usar hooks dentro do Provider
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <Login />
      } />

      <Route path="/contact-sales" element={<ContactSales />} />
      
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/services" element={<Services />} />
              <Route path="/person" element={<PersonQuery />} />
              <Route path="/vehicle" element={<VehicleQuery />} />
              <Route path="/compare" element={<VehicleCompare />} />
              <Route path="/utilities" element={<Utilities />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
