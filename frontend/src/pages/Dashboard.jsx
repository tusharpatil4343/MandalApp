import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalDonations: 0, estimateBudget: 0, remainingBudget: 0 });
  const [remainingFromApi, setRemainingFromApi] = useState(null);
  const [donors, setDonors] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [sumRes, donorsRes, expensesRes] = await Promise.all([
          api.get('/api/dashboard/summary'),
          api.get('/api/dashboard/donors'),
          api.get('/api/expenses'), // we'll use normal expenses to compute summaries/charts
        ]);
        setSummary(sumRes.data.data);
        setDonors(donorsRes.data.data || []);
        setExpenses(expensesRes.data.data || []);

        // Try optional remaining endpoint, but don't fail dashboard if missing
        try {
          const remainingRes = await api.get('/api/dashboard/remaining');
          setRemainingFromApi(remainingRes.data?.data?.remaining ?? null);
        } catch (_) {
          setRemainingFromApi(null);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalSpent = useMemo(
    () => expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0),
    [expenses]
  );
  const remaining = useMemo(
    () => Math.max(0, Number(summary.totalDonations || 0) - totalSpent),
    [summary.totalDonations, totalSpent]
  );
  const spentPct = useMemo(() => {
    const total = Number(summary.totalDonations || 0);
    return total > 0 ? Math.min(100, Math.round((totalSpent / total) * 100)) : 0;
  }, [summary.totalDonations, totalSpent]);

  const donationsByDonor = useMemo(() =>
    donors.map((d) => ({ name: d.name, amount: Number(d.donation_amount || d.amount || 0) })),
  [donors]);

  // Total donations computed from donors list (requested to show as Remaining Amount)
  const totalFromDonors = useMemo(
    () => donors.reduce((acc, d) => acc + Number(d.donation_amount || d.amount || 0), 0),
    [donors]
  );

  const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };
  const containerStagger = { hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-pulse text-gray-600">Loading dashboard…</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/30 to-blue-400/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/30 blur-3xl" />
      </div>

      <motion.div className="space-y-8" initial="hidden" animate="visible" variants={containerStagger}>
        {/* Hero */}
        <motion.div className="flex items-center justify-between" variants={fadeUp}>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        </motion.div>

        {/* KPI cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-5" variants={containerStagger}>
          <motion.div variants={fadeUp} className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-sm p-5 text-white">
            <div className="text-sm/6 opacity-90 flex items-center gap-2">💰 Total Donations</div>
            <div className="mt-2 text-3xl font-extrabold tracking-tight">₹{Number(summary.totalDonations || 0).toFixed(2)}</div>
            <div className="mt-3 text-xs/5 opacity-90">As received to date</div>
          </motion.div>
          <motion.div variants={fadeUp} className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border p-5">
            <div className="text-sm text-gray-500 flex items-center gap-2">🎯 Ganapati Budget</div>
            <div className="mt-2 text-3xl font-bold">₹{Number(summary.estimateBudget || 0).toFixed(2)}</div>
            <div className="mt-3 text-xs text-gray-500">Initial estimated budget</div>
          </motion.div>
          <motion.div variants={fadeUp} className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border p-5">
            <div className="text-sm text-gray-500 flex items-center gap-2">📉 Total Spent</div>
            <div className="mt-2 text-3xl font-bold">₹{Number(totalSpent).toFixed(2)}</div>
            <div className="mt-3 text-xs text-gray-500">Across all expenses</div>
          </motion.div>
          <motion.div variants={fadeUp} className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-sm p-5 text-white">
            <div className="text-sm/6 opacity-90 flex items-center gap-2">✅ Remaining</div>
            <div className="mt-2 text-3xl font-extrabold tracking-tight">₹{Number(remaining).toFixed(2)}</div>
            <div className="mt-3 text-xs/5 opacity-90">Calculated from donations - spent</div>
          </motion.div>
        </motion.div>

        {/* Budget progress & trend */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={containerStagger}>
          <motion.div variants={fadeUp} className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border p-5 lg:col-span-2">
            <h2 className="font-semibold mb-3">Budget Usage</h2>
            <div className="flex items-end justify-between mb-2">
              <div className="text-sm text-gray-600">Spent</div>
              <div className="text-sm font-medium">{spentPct}%</div>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-rose-500 via-orange-500 to-yellow-400 rounded-full"
                style={{ width: `${spentPct}%` }}
              />
            </div>
            <div className="mt-3 text-xs text-gray-500">
              ₹{Number(totalSpent).toFixed(2)} of ₹{Number(summary.totalDonations || 0).toFixed(2)} used
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border p-5">
            <h2 className="font-semibold mb-3">Donations Trend</h2>
            {/* Simple inline SVG trend using donor amounts */}
            <div className="h-24">
              {donationsByDonor.length ? (
                <svg viewBox="0 0 100 40" className="w-full h-full">
                  {(() => {
                    const values = donationsByDonor.map(d => d.amount);
                    const max = Math.max(...values, 1);
                    const step = 100 / Math.max(values.length - 1, 1);
                    const pts = values.map((v, i) => {
                      const x = i * step;
                      const y = 40 - (v / max) * 35 - 2; // padding
                      return `${x},${y}`;
                    }).join(' ');
                    return (
                      <>
                        <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth="2" />
                        {values.map((v, i) => {
                          const x = i * step;
                          const y = 40 - (v / max) * 35 - 2;
                          return <circle key={i} cx={x} cy={y} r="1.5" fill="#3b82f6" />;
                        })}
                      </>
                    );
                  })()}
                </svg>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No donations yet
                </div>
              )}
            </div>
            <div className="mt-3 text-xs text-gray-500">Based on donor contributions</div>
          </motion.div>
        </motion.div>

        {/* Top donors & recent donors */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={containerStagger}>
          <motion.div variants={fadeUp} className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border p-5">
            <h2 className="font-semibold mb-3">Top Donors</h2>
            <ul className="divide-y">
              {[...donationsByDonor]
                .sort((a,b) => b.amount - a.amount)
                .slice(0, 6)
                .map((d, idx) => (
                  <li key={idx} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 grid place-items-center text-xs font-bold">
                        {d.name?.[0]?.toUpperCase() || 'D'}
                      </div>
                      <div>
                        <div className="font-medium">{d.name}</div>
                        <div className="text-xs text-gray-500">Supporter</div>
                      </div>
                    </div>
                    <div className="font-semibold">₹{d.amount.toFixed(2)}</div>
                  </li>
                ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border p-5">
            <h2 className="font-semibold mb-3">Recent Donors</h2>
            <ul className="divide-y">
              {donors.slice(0, 6).map((d) => (
                <li key={d.id || d.name} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center text-xs font-bold">
                      {d.name?.[0]?.toUpperCase() || 'D'}
                    </div>
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-gray-500">{d.contact || '—'}</div>
                    </div>
                  </div>
                  <div className="font-semibold">₹{Number(d.donation_amount || d.amount || 0).toFixed(2)}</div>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border p-5">
          <h2 className="font-semibold mb-3">Recent Expenses</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="p-2">Date</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 10).map((e) => (
                  <tr key={e.id} className="border-t hover:bg-gray-50/60">
                    <td className="p-2">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="p-2">{e.description}</td>
                    <td className="p-2">₹{Number(e.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
