import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "~/lib/firebase";
import api from "~/lib/api";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "owner" | "user";
  approved: boolean;
  storeId?: string;
}

interface StoreInfo {
  id: string;
  storeName: string;
  address: string;
  description: string;
}

interface AuthContextType {
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  store: StoreInfo | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    role: "user" | "owner"
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setUserProfile(res.data.user);
      setStore(res.data.store);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setUserProfile(null);
      setStore(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchProfile();
      } else {
        setUserProfile(null);
        setStore(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // Profile will be fetched by onAuthStateChanged
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    role: "user" | "owner"
  ) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Create Firestore profile via backend
    await api.post("/auth/register", {
      uid: credential.user.uid,
      email,
      displayName,
      role,
    });
    // Profile will be fetched by onAuthStateChanged
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setStore(null);
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      await fetchProfile();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        store,
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
