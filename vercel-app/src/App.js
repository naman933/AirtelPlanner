import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { createClient } from '@supabase/supabase-js';
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import UserManagementPage from "@/pages/UserManagementPage";

// Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
let _supabase = null;
try {
  if (supabaseUrl && supabaseKey) {
    _supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (e) {
  console.error("[Supabase] Init failed:", e.message);
}
export const supabase = _supabase;

// Auth Context
export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Helper to format errors
export const formatApiError = (error) => {
  if (!error) return "Something went wrong";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  return "Something went wrong";
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const checkAuth = async () => {
    const stored = localStorage.getItem('ppo_user');
    if (stored) {
      try {
        const userData = JSON.parse(stored);
        // Verify user still exists
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .single();
        
        if (data) {
          const userInfo = {
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role,
            password_changed: data.password_changed,
            is_first_login: data.role !== 'admin' && !data.password_changed
          };
          setUser(userInfo);
          if (userInfo.is_first_login) {
            setShowPasswordDialog(true);
          }
        }
      } catch (e) {
        localStorage.removeItem('ppo_user');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Get user by email
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error || !userData) {
        toast.error("Invalid email or password");
        return { success: false, error: "Invalid email or password" };
      }

      // Verify password using database function
      const { data: isValid, error: verifyError } = await supabase
        .rpc('verify_user_password', {
          user_email: email.toLowerCase(),
          user_password: password
        });

      if (verifyError || !isValid) {
        toast.error("Invalid email or password");
        return { success: false, error: "Invalid email or password" };
      }

      const userInfo = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        password_changed: userData.password_changed,
        is_first_login: userData.role !== 'admin' && !userData.password_changed
      };

      localStorage.setItem('ppo_user', JSON.stringify(userInfo));
      setUser(userInfo);
      toast.success("Logged in successfully");

      if (userInfo.is_first_login) {
        setShowPasswordDialog(true);
      }

      return { success: true };
    } catch (error) {
      toast.error("Login failed");
      return { success: false, error: "Login failed" };
    }
  };

  const logout = async () => {
    localStorage.removeItem('ppo_user');
    setUser(null);
    setShowPasswordDialog(false);
    toast.success("Logged out successfully");
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data: isValid } = await supabase
        .rpc('verify_user_password', {
          user_email: user.email,
          user_password: currentPassword
        });

      if (!isValid) {
        toast.error("Current password is incorrect");
        return { success: false, error: "Current password is incorrect" };
      }

      // Update password
      const { error } = await supabase
        .rpc('update_user_password', {
          user_email: user.email,
          new_password: newPassword
        });

      if (error) throw error;

      setUser(prev => ({ ...prev, password_changed: true, is_first_login: false }));
      setShowPasswordDialog(false);
      toast.success("Password changed successfully");
      return { success: true };
    } catch (error) {
      toast.error("Failed to change password");
      return { success: false, error: "Failed to change password" };
    }
  };

  const keepPassword = async () => {
    try {
      await supabase
        .from('users')
        .update({ password_changed: true })
        .eq('id', user.id);

      setUser(prev => ({ ...prev, password_changed: true, is_first_login: false }));
      setShowPasswordDialog(false);
      toast.success("Password preference saved");
      return { success: true };
    } catch (error) {
      toast.error("Failed to save preference");
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      checkAuth,
      showPasswordDialog,
      setShowPasswordDialog,
      changePassword,
      keepPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#E40000] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  if (!supabase) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
        <div style={{ textAlign: "center", padding: "2rem", background: "white", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", maxWidth: "480px" }}>
          <h1 style={{ color: "#E40000", fontWeight: "bold", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Configuration Error</h1>
          <p style={{ color: "#374151", marginBottom: "0.5rem" }}>Supabase is not configured correctly.</p>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Set <code style={{ background: "#f3f4f6", padding: "2px 4px", borderRadius: "3px" }}>REACT_APP_SUPABASE_URL</code> (must start with <strong>https://</strong>) and{" "}
            <code style={{ background: "#f3f4f6", padding: "2px 4px", borderRadius: "3px" }}>REACT_APP_SUPABASE_ANON_KEY</code>{" "}
            in Vercel → Settings → Environment Variables, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
