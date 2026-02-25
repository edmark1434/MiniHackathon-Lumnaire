import { Link, Outlet, useLocation } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { HiOutlineShoppingBag, HiOutlineSun } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";

export default function PublicLayout() {
  const { firebaseUser, userProfile } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent">
  BentaBoss
</span>
            </Link>

            {/* Nav links */}
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                Home
              </Link>
              <Link
                to="/catalogue"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith("/catalogue")
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                Catalogue
              </Link>
            </nav>

            {/* Auth buttons */}
            <div className="flex items-center gap-3">
              {firebaseUser && userProfile ? (
                <Link
                  to={userProfile.role === "admin" ? "/admin/dashboard" : userProfile.role === "owner" ? "/owner/dashboard" : "/catalogue"}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <HiOutlineShoppingBag className="w-4 h-4" />
              <span>BentaBoss — Inventory Management for Sari-Sari Stores</span>
            </div>
            <p className="text-gray-600 text-xs">© 2026 BentaBoss. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}