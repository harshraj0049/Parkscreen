import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // No token in state — cookie is managed by browser
  // We only store the user object (name, email) for display purposes
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('parkscreen_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (userData) => {
    // Cookie is already set by the backend at this point
    // We just save user info for display (name, email in navbar etc.)
    localStorage.setItem('parkscreen_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Remove display info only — actual cookie cleared by backend
    localStorage.removeItem('parkscreen_user');
    setUser(null);
  };

  // isAuthenticated is based on whether we have user info stored
  // On app load, if user info exists, we verify with backend via getCurrentUser()
  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}