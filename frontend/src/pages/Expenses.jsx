import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';

export default function Expenses() {
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ id: null, description: '', amount: '' });

  const isEdit = form.id != null;

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/expenses');
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    const amt = Number(form.amount);
    if (!amt || amt <= 0) {
      toast.error('Amount must be > 0');
      return false;
    }
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/api/expenses/${form.id}`, {
          description: form.description,
          amount: Number(form.amount),
        });
        toast.success('Expense updated');
      } else {
        await api.post('/api/expenses', {
          description: form.description,
          amount: Number(form.amount),
        });
        toast.success('Expense added');
      }
      setForm({ id: null, description: '', amount: '' });
      await load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const editRow = (e) => {
    setForm({ id: e.id, description: e.description || '', amount: e.amount || '' });
  };

  const deleteRow = async (id) => {
    if (!confirm('Delete this expense?')) return;
    try {
      setLoading(true);
      await api.delete(`/api/expenses/${id}`);
      toast.success('Expense deleted');
      await load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  const total = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
      </div>

      {/* Add/Edit */}
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <input
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Description*"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          name="amount"
          value={form.amount}
          onChange={onChange}
          placeholder="Amount*"
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div>
          <button disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md w-full shadow-sm disabled:opacity-60">
            {isEdit ? 'Update' : 'Add Expense'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow-sm border p-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">All Expenses</h2>
          <div className="text-sm text-gray-600">Total: ₹{total.toFixed(2)}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="p-2 hidden sm:table-cell">Date</th>
                <th className="p-2">Description</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-t hover:bg-gray-50/60">
                  <td className="p-2 hidden sm:table-cell">{e.date ? new Date(e.date).toLocaleDateString() : '-'}</td>
                  <td className="p-2">{e.description}</td>
                  <td className="p-2">₹{Number(e.amount).toFixed(2)}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => editRow(e)} className="px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 rounded">Edit</button>
                      <button onClick={() => deleteRow(e.id)} className="px-2 py-1 text-xs bg-rose-100 hover:bg-rose-200 rounded">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="text-center py-3">Loading...</div>}
          {!loading && expenses.length === 0 && <div className="text-center py-3 text-gray-500">No expenses found</div>}
        </div>
      </div>
    </div>
  );
}
