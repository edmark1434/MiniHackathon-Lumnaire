import { useState, useEffect } from "react";
import { useAuth } from "~/context/AuthContext";
import api from "~/lib/api";
import Modal from "~/components/Modal";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineCurrencyDollar, HiOutlineCash } from "react-icons/hi";

interface Debt {
  id: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  amountPaid: number;
  status: "unpaid" | "partial" | "paid";
  notes: string;
}

const emptyDebt = { customerName: "", totalAmount: "", amountPaid: "0", notes: "", items: "" };

export default function OwnerDebts() {
  const { store } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [delModalOpen, setDelModalOpen] = useState(false);
  const [editDebt, setEditDebt] = useState<Debt | null>(null);
  const [payDebt, setPayDebt] = useState<Debt | null>(null);
  const [delDebt, setDelDebt] = useState<Debt | null>(null);
  const [form, setForm] = useState(emptyDebt);
  const [payAmt, setPayAmt] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (store) fetchDebts(); }, [store]);

  const fetchDebts = async () => {
    try { const r = await api.get(`/stores/${store!.id}/debts`); setDebts(r.data.debts); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditDebt(null); setForm(emptyDebt); setModalOpen(true); };
  const openEdit = (d: Debt) => {
    setEditDebt(d);
    setForm({ customerName: d.customerName, totalAmount: d.totalAmount.toString(), amountPaid: d.amountPaid.toString(), notes: d.notes || "", items: d.items?.map(i => i.name).join(", ") || "" });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const p = { customerName: form.customerName, totalAmount: Number(form.totalAmount), amountPaid: Number(form.amountPaid), notes: form.notes, items: form.items ? form.items.split(",").map(i => ({ name: i.trim(), quantity: 1, price: 0 })) : [] };
      if (editDebt) await api.put(`/stores/${store!.id}/debts/${editDebt.id}`, p);
      else await api.post(`/stores/${store!.id}/debts`, p);
      await fetchDebts(); setModalOpen(false);
    } catch (e: any) { alert(e.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handlePay = async () => {
    if (!payDebt) return;
    try {
      await api.put(`/stores/${store!.id}/debts/${payDebt.id}`, { amountPaid: payDebt.amountPaid + Number(payAmt) });
      await fetchDebts(); setPayModalOpen(false);
    } catch (e: any) { alert(e.response?.data?.message || "Failed"); }
  };

  const handleDel = async () => {
    if (!delDebt) return;
    try { await api.delete(`/stores/${store!.id}/debts/${delDebt.id}`); await fetchDebts(); setDelModalOpen(false); }
    catch (e: any) { alert(e.response?.data?.message || "Failed"); }
  };

  const filtered = debts.filter(d => {
    const ms = !search || d.customerName.toLowerCase().includes(search.toLowerCase());
    const mf = !filterStatus || d.status === filterStatus;
    return ms && mf;
  });

  const totalOut = debts.reduce((s, d) => s + (d.totalAmount - d.amountPaid), 0);
  const totalCol = debts.reduce((s, d) => s + d.amountPaid, 0);
  const sty: Record<string, string> = { unpaid: "bg-red-500/10 text-red-400 border border-red-500/20", partial: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20", paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" };

  if (!store) return <div className="text-center py-20"><p className="text-gray-400">Create a store first from the dashboard.</p></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Debt Tracker</h1>
          <p className="text-gray-400 text-sm mt-1">{debts.length} records · Outstanding: ₱{totalOut.toFixed(2)} · Collected: ₱{totalCol.toFixed(2)}</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
          <HiOutlinePlus className="w-4 h-4" /> Add Debt
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:border-emerald-500 outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-emerald-500 cursor-pointer">
          <option value="">All Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
          <HiOutlineCurrencyDollar className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No debts recorded</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => (
            <div key={d.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-white font-semibold">{d.customerName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${sty[d.status]}`}>{d.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 mt-2 text-sm">
                    <span className="text-gray-400">Total: <span className="text-white font-medium">₱{d.totalAmount.toFixed(2)}</span></span>
                    <span className="text-gray-400">Paid: <span className="text-emerald-400 font-medium">₱{d.amountPaid.toFixed(2)}</span></span>
                    <span className="text-gray-400">Balance: <span className="text-red-400 font-medium">₱{(d.totalAmount - d.amountPaid).toFixed(2)}</span></span>
                  </div>
                  {d.notes && <p className="text-xs text-gray-500 mt-1">{d.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {d.status !== "paid" && (
                    <button onClick={() => { setPayDebt(d); setPayAmt(""); setPayModalOpen(true); }} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-colors">
                      <HiOutlineCash className="w-4 h-4" /> Pay
                    </button>
                  )}
                  <button onClick={() => openEdit(d)} className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                  <button onClick={() => { setDelDebt(d); setDelModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-3"><div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className={`h-full rounded-full ${d.status === "paid" ? "bg-emerald-500" : d.status === "partial" ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${Math.min((d.amountPaid / d.totalAmount) * 100, 100)}%` }} /></div></div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editDebt ? "Edit Debt" : "Add Debt"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Customer Name *</label><input type="text" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 outline-none" placeholder="e.g., Juan Dela Cruz" /></div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Items (comma-separated)</label><input type="text" value={form.items} onChange={e => setForm({...form, items: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 outline-none" placeholder="Rice, Sardines, Coffee" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Total (₱) *</label><input type="number" step="0.01" min="0" value={form.totalAmount} onChange={e => setForm({...form, totalAmount: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Paid (₱)</label><input type="number" step="0.01" min="0" value={form.amountPaid} onChange={e => setForm({...form, amountPaid: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500 outline-none" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 outline-none resize-none" /></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-gray-700 hover:border-gray-600">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">{saving ? "Saving..." : editDebt ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} title="Record Payment" size="sm">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-gray-800 border border-gray-700">
            <p className="text-sm text-gray-400">Customer: <span className="text-white font-medium">{payDebt?.customerName}</span></p>
            <p className="text-sm text-gray-400 mt-1">Balance: <span className="text-red-400 font-medium">₱{((payDebt?.totalAmount||0)-(payDebt?.amountPaid||0)).toFixed(2)}</span></p>
          </div>
          <div><label className="block text-sm font-medium text-gray-300 mb-1">Amount (₱)</label><input type="number" step="0.01" min="0.01" value={payAmt} onChange={e => setPayAmt(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500 outline-none" /></div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setPayModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-gray-700">Cancel</button>
            <button onClick={handlePay} disabled={!payAmt || Number(payAmt) <= 0} className="px-6 py-2.5 rounded-xl text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">Record Payment</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={delModalOpen} onClose={() => setDelModalOpen(false)} title="Delete Debt" size="sm">
        <div className="text-center py-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4"><HiOutlineTrash className="w-7 h-7 text-red-400" /></div>
          <p className="text-gray-300">Delete debt for <strong className="text-white">{delDebt?.customerName}</strong>?</p>
        </div>
        <div className="flex justify-center gap-3 pt-4">
          <button onClick={() => setDelModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm text-gray-400 border border-gray-700">Cancel</button>
          <button onClick={handleDel} className="px-6 py-2.5 rounded-xl text-sm text-white bg-red-600 hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
