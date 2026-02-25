import { Navigate } from "react-router";
import { useAuth } from "~/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  requireApproval?: boolean;
}

export default function ProtectedRoute({
  children,
  roles,
  requireApproval = false,
}: ProtectedRouteProps) {
  const { firebaseUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser || !userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(userProfile.role)) {
    return <Navigate to="/" replace />;
  }

  if (requireApproval && userProfile.role === "owner" && !userProfile.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 border border-yellow-500/30 rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Pending Approval</h2>
          <p className="text-gray-400">
            Your store owner account is awaiting admin approval. You'll be
            notified once your account has been activated.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
