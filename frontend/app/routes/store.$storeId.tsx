import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import api from "~/lib/api";
import {
  HiOutlineSearch,
  HiOutlineCube,
  HiOutlineArrowLeft,
  HiOutlineLocationMarker,
  HiOutlineTag,
} from "react-icons/hi";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  description: string;
}

interface Store {
  id: string;
  storeName: string;
  ownerName: string;
  address: string;
  description: string;
}

export default function StoreDetail() {
  const { storeId } = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) {
      fetchStoreAndProducts();
    }
  }, [storeId]);

  const fetchStoreAndProducts = async () => {
    try {
      const [storeRes, productsRes] = await Promise.all([
        api.get(`/stores/${storeId}`),
        api.get(`/stores/${storeId}/products`),
      ]);
      setStore(storeRes.data.store);
      setProducts(productsRes.data.products);
    } catch (err) {
      console.error("Failed to fetch store:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(products.map((p) => p.category))].sort();

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Store not found</h2>
        <Link to="/catalogue" className="text-emerald-400 mt-4 inline-block hover:underline">
          ← Back to catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        to="/catalogue"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to Catalogue
      </Link>

      {/* Store header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🏪</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{store.storeName}</h1>
            <p className="text-gray-500 text-sm mt-0.5">by {store.ownerName}</p>
            {store.address && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-400">
                <HiOutlineLocationMarker className="w-4 h-4" />
                {store.address}
              </div>
            )}
            {store.description && <p className="text-gray-400 text-sm mt-2">{store.description}</p>}
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
          />
        </div>

        {categories.length > 1 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 rounded-xl bg-gray-900 border border-gray-800 text-white outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Products count */}
      <p className="text-sm text-gray-500 mb-4">
        {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
      </p>

      {/* Product grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <HiOutlineCube className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No products found</h3>
          <p className="text-gray-500 text-sm mt-1">
            {search || selectedCategory
              ? "Try adjusting your search or filters."
              : "This store hasn't added any products yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <HiOutlineCube className="w-5 h-5 text-emerald-400" />
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    product.stock > 5
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : product.stock > 0
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </span>
              </div>

              <h3 className="text-white font-semibold truncate">{product.name}</h3>

              <div className="flex items-center gap-1.5 mt-1">
                <HiOutlineTag className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500">{product.category}</span>
              </div>

              {product.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>
              )}

              <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                <span className="text-xl font-bold text-emerald-400">
                  ₱{product.price.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">per {product.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
