"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: "volunteer" | "ngo" | "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted auth data on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // Store token and user
        const authToken = data.token || data.access_token;
        const userData: User = {
          id: data.user?.id || "",
          email: data.user?.email || email,
          name: data.user?.name || "",
          role: data.user?.role || "volunteer",
        };

        localStorage.setItem("authToken", authToken);
        localStorage.setItem("user", JSON.stringify(userData));

        setToken(authToken);
        setUser(userData);
      } catch (error) {
        setToken(null);
        setUser(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint on backend
      const token = localStorage.getItem("authToken");
      if (token) {
        await fetch(`${API_URL}/api/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear context state
      setUser(null);
      setToken(null);
      
      // Clear storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      
      // Redirect to login page
      window.location.href = "/login";
    }
  }, []);

  // Update token function
  const updateToken = useCallback((newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("authToken", newToken);
    } else {
      localStorage.removeItem("authToken");
    }
    setToken(newToken);
  }, []);

  // Update user function
  const updateUser = useCallback((newUser: User | null) => {
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
    setUser(newUser);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    setUser: updateUser,
    setToken: updateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
