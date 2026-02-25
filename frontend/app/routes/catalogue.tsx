import { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "~/lib/api";
import { HiOutlineSearch, HiOutlineLocationMarker, HiOutlineShoppingBag } from "react-icons/hi";

interface Store {
  id: string;
  storeName: string;
  ownerName: string;
  address: string;
  description: string;
}

export default function Catalogue() {
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await api.get("/stores");
      setStores(res.data.stores);
    } catch (err) {
      console.error("Failed to fetch stores:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(
    (s) =>
      s.storeName.toLowerCase().includes(search.toLowerCase()) ||
      s.address?.toLowerCase().includes(search.toLowerCase()) ||
      s.ownerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white">Store Catalogue</h1>
        <p className="text-gray-400 mt-2">Browse sari-sari stores and find what you need</p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="relative">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores by name, location, or owner..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Store Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="text-center py-20">
          <HiOutlineShoppingBag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No stores found</h3>
          <p className="text-gray-500 text-sm mt-1">
            {search ? "Try a different search term." : "No stores have been registered yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <Link
              key={store.id}
              to={`/store/${store.id}`}
              className="group bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/30 hover:bg-gray-900/80 transition-all hover:translate-y-[-2px]"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <HiOutlineShoppingBag className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                    {store.storeName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">by {store.ownerName}</p>
                </div>
              </div>

              {store.address && (
                <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                  <HiOutlineLocationMarker className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{store.address}</span>
                </div>
              )}

              {store.description && (
                <p className="mt-3 text-sm text-gray-500 line-clamp-2">{store.description}</p>
              )}

              <div className="mt-4 text-sm text-emerald-400 font-medium group-hover:underline">
                View Products →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
