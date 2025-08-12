import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import ScrollToTopButton from './components/ScrollToTopButton.jsx';

// Route-level code splitting
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Donors = lazy(() => import('./pages/Donors.jsx'));
const Expenses = lazy(() => import('./pages/Expenses.jsx'));

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isAdmin = !!token && role === 'admin';
  return isAdmin ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isAdmin = !!token && role === 'admin';
  return (
    <BrowserRouter>
      <PageShell showNavbar={isAdmin} isAdmin={isAdmin} />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

function PageShell({ showNavbar, isAdmin }) {
  const location = useLocation();
  const [overlay, setOverlay] = useState(true);

  // Page load/refresh overlay effect
  useEffect(() => {
    const t = setTimeout(() => setOverlay(false), 380);
    return () => clearTimeout(t);
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 relative">
      {showNavbar && <Navbar />}

      {/* Top progress shimmer on initial load */}
      {overlay && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-0.5 z-40"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.38, ease: 'easeInOut' }}
          style={{ background: 'linear-gradient(90deg,#6366f1,#3b82f6,#22d3ee)' }}
        />
      )}

      {/* Fade overlay */}
      <AnimatePresence>{overlay && (
        <motion.div
          className="fixed inset-0 bg-white z-30"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}</AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<div className="py-16 text-center text-gray-600 animate-fade-in-up">Loading…</div>}>
          <AnimatePresence mode="wait" initial={true}>
            <Routes location={location} key={location.pathname}>
              <Route
                path="/login"
                element={isAdmin ? (
                  <Navigate to="/" replace />
                ) : (
                  <PageWrapper variants={pageVariants}><LoginPage /></PageWrapper>
                )}
              />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <PageWrapper variants={pageVariants}><Dashboard /></PageWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/donors"
                element={
                  <PrivateRoute>
                    <PageWrapper variants={pageVariants}><Donors /></PageWrapper>
                  </PrivateRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <PrivateRoute>
                    <PageWrapper variants={pageVariants}><Expenses /></PageWrapper>
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to={isAdmin ? '/' : '/login'} replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </div>

      <ScrollToTopButton />
    </div>
  );
}

function PageWrapper({ children, variants }) {
  return (
    <motion.div
      className="animate-page-reveal"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
