// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { getStoredAuth, saveAuthData, clearAuthData } from '../api/authStorage';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth());
  const [isChecking, setIsChecking] = useState(true);

  const isLoggedIn = !!auth?.token;
  const isAdmin = auth?.user?.role === 'Admin';

  const login = (data) => {
    saveAuthData(data);
    setAuth(data);
  };

  const logout = () => {
    clearAuthData();
    setAuth(null);
  };

  useEffect(() => {
    setAuth(getStoredAuth());
    setIsChecking(false);
  }, []);

  if (isChecking) return null;

  return (
    <AuthContext.Provider value={{ ...auth, isLoggedIn, isAdmin, login, logout, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
