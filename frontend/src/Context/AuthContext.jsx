import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '../Services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ← prevents flicker on page refresh

  // On app start — check if cookie exists and fetch user
  // This keeps the user logged in across page refreshes
  useEffect(() => {
    getCurrentUser()
      .then(userData => setUser(userData))
      .catch(() => setUser(null))  // 401 = not logged in, that's fine
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    // No token to store — cookie was already set by the backend
    // Just update the React state with the user object
    setUser(userData);
  };

  const logout = async () => {
    await logoutUser();       // tells backend to clear the cookie
    setUser(null);            // clear React state
  };

  if (loading) {
    // Prevent the app from rendering before we know if user is logged in
    // Replace with a spinner component if you have one
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user   // true if user object exists
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