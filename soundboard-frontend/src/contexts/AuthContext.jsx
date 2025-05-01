import React, { createContext, useState, useEffect } from "react";
import { getUserData } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (token) {
      // Instead of fetching user data, just set isAuthenticated
      setIsAuthenticated(true);
      // You can decode the JWT token to get basic user info if needed
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', userData.token); // Add this line
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
