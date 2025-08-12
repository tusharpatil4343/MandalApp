import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api';

const initialFilters = { name: '', minAmount: '', maxAmount: '', dateFrom: '', dateTo: '' };

const fadeUp = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };
const containerStagger = { hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const rowVariant = { hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } };

export default function Donors() {
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [form, setForm] = useState({ id: null, name: '', contact: '', donation_amount: '' });
  const isEdit = useMemo(() => form.id != null, [form.id]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/donors', { params: filters });
      setDonors(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch donors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const onFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const applyFilters = (e) => {
    e.preventDefault();
    load();
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setTimeout(load, 0);
  };

  const validateForm = () => {
    if (!form.name?.trim()) {
      toast.error('Name is required');
      return false;
    }
    const amount = Number(form.donation_amount);
    if (!amount || amount <= 0) {
      toast.error('Donation amount must be > 0');
      return false;
    }
    return true;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/api/donors/${form.id}`, {
          name: form.name,
          contact: form.contact,
          donation_amount: Number(form.donation_amount),
        });
        toast.success('Donor updated');
      } else {
        await api.post('/api/donors', {
          name: form.name,
          contact: form.contact,
          donation_amount: Number(form.donation_amount),
        });
        toast.success('Donor added');
      }
      setForm({ id: null, name: '', contact: '', donation_amount: '' });
      await load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save donor');
    } finally {
      setLoading(false);
    }
  };

  const editRow = (d) => {
    setForm({ id: d.id, name: d.name || '', contact: d.contact || '', donation_amount: d.donation_amount || '' });
  };

  const deleteRow = async (id) => {
    if (!confirm('Delete this donor?')) return;
    try {
      setLoading(true);
      await api.delete(`/api/donors/${id}`);
      toast.success('Donor deleted');
      await load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete donor');
    } finally {
      setLoading(false);
    }
  };

  const totalDonationAmount = useMemo(() =>
    donors.reduce((sum, d) => sum + Number(d.donation_amount || d.amount || 0), 0),
  [donors]);

  const totalDonors = useMemo(() => donors.length, [donors]);

  return (
    <motion.div className="space-y-8" initial="hidden" animate="visible" variants={containerStagger}>
      <motion.div className="flex items-center justify-between" variants={fadeUp}>
        
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-sm p-5 text-white">
          <div className="text-sm/6 opacity-90 flex items-center gap-2">💚 Total Donations</div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight">₹{totalDonationAmount.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-sm p-5 text-white">
          <div className="text-sm/6 opacity-90 flex items-center gap-2">👥 Total Donors</div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight">{totalDonors}</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.form variants={fadeUp} onSubmit={applyFilters} className="bg-white rounded-2xl shadow-sm border p-5 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input name="name" value={filters.name} onChange={onFilterChange} placeholder="Name" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input name="minAmount" value={filters.minAmount} onChange={onFilterChange} placeholder="Min Amount" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input name="maxAmount" value={filters.maxAmount} onChange={onFilterChange} placeholder="Max Amount" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="date" name="dateFrom" value={filters.dateFrom} onChange={onFilterChange} className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="date" name="dateTo" value={filters.dateTo} onChange={onFilterChange} className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm">Apply</button>
          <button type="button" onClick={resetFilters} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md">Reset</button>
        </div>
      </motion.form>

      {/* Add/Edit Form */}
      <motion.form variants={fadeUp} onSubmit={submitForm} className="bg-white rounded-2xl shadow-sm border p-5 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input name="name" value={form.name} onChange={onFormChange} placeholder="Donor name*" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <input name="contact" value={form.contact} onChange={onFormChange} placeholder="Contact" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <input name="donation_amount" value={form.donation_amount} onChange={onFormChange} placeholder="Amount*" className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        <div>
          <button disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md w-full shadow-sm disabled:opacity-60">
            {isEdit ? 'Update' : 'Add Donor'}
          </button>
        </div>
      </motion.form>

      {/* Table */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-sm border p-5 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="p-2 w-16">Sr. No</th>
              <th className="p-2">Name</th>
              <th className="p-2">Contact</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Date</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <motion.tbody variants={containerStagger} initial="hidden" animate="visible">
            {donors.map((d, idx) => (
              <motion.tr variants={rowVariant} key={d.id} className="border-t hover:bg-gray-50/60">
                <td className="p-2 text-gray-500">{idx + 1}</td>
                <td className="p-2">{d.name}</td>
                <td className="p-2">{d.contact || '-'}</td>
                <td className="p-2">₹{Number(d.donation_amount).toFixed(2)}</td>
                <td className="p-2">{d.date ? new Date(d.date).toLocaleDateString() : '-'}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => editRow(d)} className="px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 rounded">Edit</button>
                  <button onClick={() => deleteRow(d.id)} className="px-2 py-1 text-xs bg-rose-100 hover:bg-rose-200 rounded">Delete</button>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
        {loading && <div className="text-center py-3">Loading...</div>}
        {!loading && donors.length === 0 && <div className="text-center py-3 text-gray-500">No donors found</div>}
      </motion.div>
    </motion.div>
  );
}
