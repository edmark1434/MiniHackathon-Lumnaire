import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import api from "~/lib/api";
import StatsCard from "~/components/StatsCard";
import {
  HiOutlineCube,
  HiOutlineExclamation,
  HiOutlineCurrencyDollar,
  HiOutlineCash,
  HiOutlinePlus,
  HiOutlineShoppingBag,
} from "react-icons/hi";

interface DashboardData {
  stats: {
    totalProducts: number;
    lowStockItems: number;
    totalInventoryValue: number;
    totalDebts: number;
    totalDebtAmount: number;
    totalCollected: number;
    outstandingBalance: number;
    unpaidDebts: number;
    partialDebts: number;
    paidDebts: number;
  };
  recentProducts: any[];
  recentDebts: any[];
}

export default function OwnerDashboard() {
  const { store, userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (store) {
      fetchDashboard();
    } else {
      setLoading(false);
      setShowStoreForm(true);
    }
  }, [store]);

  const fetchDashboard = async () => {
    if (!store) return;
    try {
      const res = await api.get(`/stores/${store.id}/dashboard`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/stores", {
        storeName,
        address: storeAddress,
        description: storeDesc,
        latitude: latitude || null,
        longitude: longitude || null,
      });
      await refreshProfile();
      setShowStoreForm(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create store");
    } finally {
      setCreating(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
        },
        (error) => {
          alert("Unable to get your location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Store creation form
  if (showStoreForm && !store) {
    return (
      <div className="max-w-lg mx-auto py-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4">
            <HiOutlineShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Your Store</h1>
          <p className="text-gray-400 mt-1">Set up your sari-sari store to get started</p>
        </div>

        <form
          onSubmit={handleCreateStore}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Store Name *</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g., Aling Maria's Sari-Sari Store"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
            <input
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              placeholder="e.g., 123 Barangay Street, City"
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={storeDesc}
              onChange={(e) => setStoreDesc(e.target.value)}
              placeholder="Tell customers about your store..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location Coordinates</label>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="mb-3 w-full py-2 rounded-lg text-sm text-white bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              📍 Use My Current Location
            </button>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude (e.g., 14.5995)"
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude (e.g., 120.9842)"
                  className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Optional: Add coordinates to show your store on the map</p>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Store"}
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back, {userProfile?.displayName || "Owner"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/owner/products"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={<HiOutlineCube className="w-6 h-6" />}
            label="Total Products"
            value={stats.totalProducts}
            color="emerald"
          />
          <StatsCard
            icon={<HiOutlineExclamation className="w-6 h-6" />}
            label="Low Stock"
            value={stats.lowStockItems}
            subtext="Items with ≤5 stock"
            color="yellow"
          />
          <StatsCard
            icon={<HiOutlineCurrencyDollar className="w-6 h-6" />}
            label="Outstanding Debts"
            value={`₱${stats.outstandingBalance.toFixed(2)}`}
            subtext={`${stats.unpaidDebts + stats.partialDebts} unpaid records`}
            color="red"
          />
          <StatsCard
            icon={<HiOutlineCash className="w-6 h-6" />}
            label="Collected"
            value={`₱${stats.totalCollected.toFixed(2)}`}
            subtext={`of ₱${stats.totalDebtAmount.toFixed(2)} total`}
            color="blue"
          />
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Products</h3>
            <Link to="/owner/products" className="text-sm text-emerald-400 hover:underline">
              View all
            </Link>
          </div>
          {data?.recentProducts.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No products yet</p>
          ) : (
            <div className="space-y-3">
              {data?.recentProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category} · {p.stock} {p.unit}(s)</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">₱{p.price?.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Debts */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Debts</h3>
            <Link to="/owner/debts" className="text-sm text-emerald-400 hover:underline">
              View all
            </Link>
          </div>
          {data?.recentDebts.length === 0 ? (
            <p className="text-gray-500 text-sm py-4 text-center">No debts recorded</p>
          ) : (
            <div className="space-y-3">
              {data?.recentDebts.map((d) => {
                const statusColors: Record<string, string> = {
                  paid: "text-emerald-400 bg-emerald-500/10",
                  partial: "text-yellow-400 bg-yellow-500/10",
                  unpaid: "text-red-400 bg-red-500/10",
                };
                const statusColor = statusColors[d.status as string] || "text-gray-400 bg-gray-500/10";

                return (
                  <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{d.customerName}</p>
                      <p className="text-xs text-gray-500">₱{d.amountPaid?.toFixed(2)} / ₱{d.totalAmount?.toFixed(2)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      {d.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
