import React from 'react';
import { AppProvider, useApp } from './components/AppContext';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import Portfolio from './pages/public/Portfolio';
import PortfolioProject from './pages/public/PortfolioProject';
import Packages from './pages/public/Packages';
import FreeAudit from './pages/public/FreeAudit';
import Contact from './pages/public/Contact';
import Legal from './pages/public/Legal';

// Admin Pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';

function AppContent() {
  const { currentPath, isAdminVerified } = useApp();

  // Simple custom router
  if (currentPath === '/') return <Home />;
  if (currentPath === '/about') return <About />;
  if (currentPath === '/services') return <Services />;
  if (currentPath === '/portfolio') return <Portfolio />;
  if (currentPath.startsWith('/portfolio/')) return <PortfolioProject />;
  if (currentPath === '/packages') return <Packages />;
  if (currentPath === '/free-audit') return <FreeAudit />;
  if (currentPath === '/contact') return <Contact />;
  if (currentPath === '/privacy-policy' || currentPath === '/terms') return <Legal />;

  // Admin section
  if (currentPath === '/admin/login') return <Login />;
  
  if (currentPath.startsWith('/admin')) {
    // Protected admin route
    if (!isAdminVerified) {
      // Force render Login if not logged in
      return <Login />;
    }
    return <Dashboard />;
  }

  // Fallback 404
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-warm-bg text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-brand-soft-red text-brand-primary flex items-center justify-center font-black text-2xl mb-6">!</div>
      <h1 className="text-3xl font-extrabold text-brand-dark mb-2">Page Not Found</h1>
      <p className="text-brand-secondary text-sm mb-6 max-w-sm">The digital path you requested does not exist or has been relocated.</p>
      <button 
        onClick={() => window.location.href = '/'}
        className="px-6 py-2.5 bg-brand-primary text-brand-pure-white text-xs font-bold rounded-full cursor-pointer"
      >
        Go Back Home
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
