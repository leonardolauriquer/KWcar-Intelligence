
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PersonQuery from './pages/PersonQuery';
import VehicleQuery from './pages/VehicleQuery';
import VehicleCompare from './pages/VehicleCompare'; // Import
import Utilities from './pages/Utilities';
import Scanner from './pages/Scanner';
import Login from './pages/Login';
import ContactSales from './pages/ContactSales';
import Services from './pages/Services';
import Settings from './pages/Settings';

// Componente para proteger rotas
const ProtectedRoute = ({ children, isAuthenticated }: { children?: React.ReactNode, isAuthenticated: boolean }) => {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  // Estado simples de autenticação (persiste no session storage para demo)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('kw_auth') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('kw_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('kw_auth');
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
        } />

        <Route path="/contact-sales" element={<ContactSales />} />
        
        <Route path="/*" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Layout onLogout={handleLogout}>
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
    </HashRouter>
  );
};

export default App;
