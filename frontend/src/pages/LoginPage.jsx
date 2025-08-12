import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Username and password are required');
      return;
    }
    try {
      setLoading(true);
      // NOTE: No real backend auth yet. Store a dummy token (no artificial delay).

      // Only allow admin login (mocked)
      const isAdmin = form.username === 'admin' && form.password === '281102';
      if (!isAdmin) {
        toast.error('Invalid admin credentials');
        return;
      }

      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('role', 'admin');
      toast.success('Logged in');

      // Redirect admin to dashboard (home)
      navigate('/');
    } catch (err) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <form onSubmit={onSubmit} className="bg-white shadow rounded-lg p-6 w-full max-w-sm space-y-4">
        {/* Branding */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-white overflow-hidden shadow">
            <img
              src="/WhatsApp Image 2025-08-09 at 07.47.09_3b5b5982.jpg"
              alt="Mandal Logo"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 tracking-wide">
            MANDAL
          </div>
        </div>
        <h1 className="text-xl font-semibold text-center">Admin Login</h1>
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={onChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter username"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password"
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
