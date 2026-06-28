import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ name: "Executive Underwriter", role: "Auditor" });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  
  // Toast notifications state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const login = (username, password) => {
    if (username && password) {
      setUser({ name: username, role: "Auditor" });
      setIsAuthenticated(true);
      showToast("Access granted. Logged in successfully.", "success");
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    showToast("Session terminated. Logged out successfully.", "success");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, setIsAuthenticated, toast, showToast, hideToast }}>
      {children}
      
      {/* Floating Toast Notification overlay */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in flex items-center space-x-3 bg-white border border-slate-200 p-4 rounded-xl shadow-premium max-w-sm font-inter text-xs">
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span className="font-semibold text-slate-700 flex-1">{toast.message}</span>
          <button onClick={hideToast} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be consumed within an AuthProvider");
  }
  return context;
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
