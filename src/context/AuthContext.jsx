import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('deadlinehub_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('deadlinehub_token') || null;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify and restore authenticated session on startup
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('deadlinehub_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            setToken(savedToken);
            localStorage.setItem('deadlinehub_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session validation failed:', err.message);
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await authApi.login({ email, password });
      if (res.success && res.token && res.user) {
        localStorage.setItem('deadlinehub_token', res.token);
        localStorage.setItem('deadlinehub_user', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return res.user;
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('deadlinehub_token');
    localStorage.removeItem('deadlinehub_user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
