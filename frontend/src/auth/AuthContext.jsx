import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.accessToken) {
          setUser({
            userId: parsed.userId,
            name: parsed.name,
            email: parsed.email,
            role: parsed.role || 'CUSTOMER',
          });
        }
      } catch {
        localStorage.removeItem('auth');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await loginUser({ email, password });
    localStorage.setItem('auth', JSON.stringify(result));
    setUser({ userId: result.userId, name: result.name, email: result.email, role: result.role });
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const result = await registerUser({ name, email, password, role });
    localStorage.setItem('auth', JSON.stringify(result));
    setUser({ userId: result.userId, name: result.name, email: result.email, role: result.role });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
