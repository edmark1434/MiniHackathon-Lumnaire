import { useState, useEffect } from "react";
import api from "~/lib/api";
import { HiOutlineUserGroup, HiOutlineCheck, HiOutlineX, HiOutlineShieldCheck } from "react-icons/hi";

interface User { uid: string; email: string; displayName: string; role: string; approved: boolean; }

export default function AdminDashboard() {
  const [pending, setPending] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "all">("pending");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [p, u] = await Promise.all([api.get("/admin/pending-owners"), api.get("/admin/users")]);
      setPending(p.data.pendingOwners);
      setUsers(u.data.users);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleApprove = async (uid: string) => {
    try { await api.patch(`/admin/approve-owner/${uid}`); await fetchData(); }
    catch (e: any) { alert(e.response?.data?.message || "Failed"); }
  };

  const handleReject = async (uid: string) => {
    if (!confirm("Reject this owner registration?")) return;
    try { await api.patch(`/admin/reject-owner/${uid}`); await fetchData(); }
    catch (e: any) { alert(e.response?.data?.message || "Failed"); }
  };

  const roleBadge: Record<string, string> = {
    admin: "bg-red-500/10 text-red-400 border-red-500/20",
    owner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    user: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">{pending.length} pending approvals · {users.length} total users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-sm text-gray-400">Total Users</p>
          <p className="text-3xl font-bold text-white mt-1">{users.length}</p>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5">
          <p className="text-sm text-yellow-400">Pending Approvals</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{pending.length}</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
          <p className="text-sm text-emerald-400">Active Owners</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{users.filter(u => u.role === "owner" && u.approved).length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1 w-fit mb-6">
        <button onClick={() => setTab("pending")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "pending" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"}`}>
          Pending ({pending.length})
        </button>
        <button onClick={() => setTab("all")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "all" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"}`}>
          All Users ({users.length})
        </button>
      </div>

      {tab === "pending" ? (
        pending.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
            <HiOutlineShieldCheck className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400">All caught up!</h3>
            <p className="text-gray-500 text-sm">No pending owner approvals.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(u => (
              <div key={u.uid} className="bg-gray-900 border border-yellow-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                    {u.displayName?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{u.displayName || "Unnamed"}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(u.uid)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors">
                    <HiOutlineCheck className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => handleReject(u.uid)} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors">
                    <HiOutlineX className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-800">
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Role</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-800">
                {users.map(u => (
                  <tr key={u.uid} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">{u.displayName || "Unnamed"}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${roleBadge[u.role] || roleBadge.user}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium ${u.approved ? "text-emerald-400" : "text-yellow-400"}`}>
                        {u.approved ? "Active" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
