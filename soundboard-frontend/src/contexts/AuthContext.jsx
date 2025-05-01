import React, { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getUserData, loginUser } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch user data when token exists
      getUserData()
        .then((userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          // If there's an error fetching user data, the token might be invalid
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          toast.error("Session expired. Please log in again.");
        });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const login = async (email, password) => {
    // Call the API to authenticate
    const response = await loginUser({ email, password });
    
    // If we get here, authentication was successful
    setUser(response.user);
    setIsAuthenticated(true);
    localStorage.setItem("token", response.token);
    
    return response;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    toast.info("You have been logged out");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
