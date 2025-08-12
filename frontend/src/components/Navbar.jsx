import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const linkCls = (path) => `px-3 py-2 rounded-md text-sm font-medium transition ${
    location.pathname === path
      ? 'bg-white/20 text-white shadow'
      : 'text-white/90 hover:bg-white/10 hover:text-white'
  }`;

  return (
    <nav className="sticky top-0 z-20 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Emblem */}
            <div className="w-9 h-9 rounded-full bg-white/15 grid place-items-center shadow-inner">
              <span className="text-xl">🪔</span>
            </div>
            {/* Wordmark */}
            <div className="leading-tight">
              <div className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 text-lg tracking-wide">
                MANDAL
              </div>
              <div className="text-[11px] uppercase tracking-widest text-white/80">
                Ganapati Committee Admin
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={linkCls('/')}>Dashboard</Link>
            <Link to="/donors" className={linkCls('/donors')}>Donors</Link>
            <Link to="/expenses" className={linkCls('/expenses')}>Expenses</Link>
            <button
              onClick={logout}
              className="ml-2 px-3 py-2 text-sm rounded-md bg-white/10 text-white hover:bg-white/20"
            >
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle navigation"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white/90 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-3">
            <div className="pt-2 flex flex-col gap-2">
              <Link onClick={() => setMobileOpen(false)} to="/" className="px-3 py-2 rounded-md text-sm bg-white/10 text-white hover:bg-white/20">Dashboard</Link>
              <Link onClick={() => setMobileOpen(false)} to="/donors" className="px-3 py-2 rounded-md text-sm bg-white/10 text-white hover:bg-white/20">Donors</Link>
              <Link onClick={() => setMobileOpen(false)} to="/expenses" className="px-3 py-2 rounded-md text-sm bg-white/10 text-white hover:bg-white/20">Expenses</Link>
              <button
                onClick={() => { setMobileOpen(false); logout(); }}
                className="px-3 py-2 text-left text-sm rounded-md bg-white/10 text-white hover:bg-white/20"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
