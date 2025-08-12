import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
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
          <div className="flex items-center gap-2">
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
        </div>
      </div>
    </nav>
  );
}
