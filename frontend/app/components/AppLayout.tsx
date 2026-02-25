import { useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "~/context/AuthContext";
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
  HiOutlineUserGroup,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineChevronDown,
} from "react-icons/hi";

const ownerNavItems = [
  { path: "/owner/dashboard", label: "Dashboard", icon: HiOutlineHome },
  { path: "/owner/products", label: "Products", icon: HiOutlineCube },
  { path: "/owner/debts", label: "Debt Tracker", icon: HiOutlineCurrencyDollar },
];

const adminNavItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: HiOutlineHome },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { firebaseUser, userProfile, store, logout, loading } = useAuth();
  const location = useLocation();

  const navItems = userProfile?.role === "admin" ? adminNavItems : ownerNavItems;

  const handleLogout = async () => {
    await logout();
  };

  const roleBadgeColor: Record<string, string> = {
    admin: "bg-red-500/20 text-red-400 border-red-500/30",
    owner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    user: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!firebaseUser || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  // Regular users can't access owner/admin pages
  if (userProfile.role === "user") {
    return <Navigate to="/" replace />;
  }

  // Unapproved owners get a pending screen
  if (userProfile.role === "owner" && !userProfile.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Pending Approval</h2>
          <p className="text-gray-400 mb-6">
            Your store owner account is awaiting admin approval. You'll be able to access your dashboard once approved.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <HiOutlineShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">SariTrack</h1>
                <p className="text-xs text-gray-500">Inventory System</p>
              </div>
            </Link>
          </div>

          {/* Store info (owner) */}
          {store && (
            <div className="px-4 py-3 mx-3 mt-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
              <p className="text-sm font-medium text-white truncate">{store.storeName}</p>
              <p className="text-xs text-gray-500 truncate">{store.address || "No address set"}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-800">
              <Link
                to="/catalogue"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname.startsWith("/catalogue")
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                }`}
              >
                <HiOutlineShoppingBag className="w-5 h-5 flex-shrink-0" />
                Public Catalogue
              </Link>
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-800">
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800/60 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                  {userProfile?.displayName?.[0]?.toUpperCase() || userProfile?.email?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {userProfile?.displayName || userProfile?.email}
                  </p>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full border ${roleBadgeColor[userProfile?.role || "user"]}`}>
                    {userProfile?.role}
                  </span>
                </div>
                <HiOutlineChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <HiOutlineLogout className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
            >
              <HiOutlineMenu className="w-6 h-6" />
            </button>
            <div className="lg:hidden" />
            <div />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
