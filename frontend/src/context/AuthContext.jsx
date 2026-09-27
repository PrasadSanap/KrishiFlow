import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('kq_token');
      const cachedUser = localStorage.getItem('kq_user');
      if (token && cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
          const res = await authService.getMe();
          setUser(res.data);
          localStorage.setItem('kq_user', JSON.stringify(res.data));
        } catch (err) {
          localStorage.removeItem('kq_token');
          localStorage.removeItem('kq_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    localStorage.setItem('kq_token', res.data.token);
    localStorage.setItem('kq_user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const register = async (payload) => {
    const res = await authService.register(payload);
    localStorage.setItem('kq_token', res.data.token);
    localStorage.setItem('kq_user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('kq_token');
    localStorage.removeItem('kq_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
