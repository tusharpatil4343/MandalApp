import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar.jsx';

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
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {isAdmin && <Navbar />}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Suspense fallback={<div className="py-16 text-center text-gray-600">Loading…</div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/donors"
                element={
                  <PrivateRoute>
                    <Donors />
                  </PrivateRoute>
                }
              />
              <Route
                path="/expenses"
                element={
                  <PrivateRoute>
                    <Expenses />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to={isAdmin ? '/' : '/login'} replace />} />
            </Routes>
          </Suspense>
        </div>
      </div>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}
