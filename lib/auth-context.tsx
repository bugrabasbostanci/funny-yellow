"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  favorites: string[];
  downloadHistory: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  addToFavorites: (stickerId: string) => void;
  removeFromFavorites: (stickerId: string) => void;
  addToDownloadHistory: (stickerId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem("funny-yellow-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    // Mock login - replace with real Supabase auth
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser: User = {
      id: "1",
      email,
      name: email.split("@")[0],
      favorites: [],
      downloadHistory: [],
    };

    setUser(mockUser);
    localStorage.setItem("funny-yellow-user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const register = async (email: string, _password: string, name: string) => {
    setIsLoading(true);
    // Mock registration - replace with real Supabase auth
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser: User = {
      id: "1",
      email,
      name,
      favorites: [],
      downloadHistory: [],
    };

    setUser(mockUser);
    localStorage.setItem("funny-yellow-user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("funny-yellow-user");
  };

  const addToFavorites = (stickerId: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      favorites: [...user.favorites, stickerId],
    };
    setUser(updatedUser);
    localStorage.setItem("funny-yellow-user", JSON.stringify(updatedUser));
  };

  const removeFromFavorites = (stickerId: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      favorites: user.favorites.filter((id) => id !== stickerId),
    };
    setUser(updatedUser);
    localStorage.setItem("funny-yellow-user", JSON.stringify(updatedUser));
  };

  const addToDownloadHistory = (stickerId: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      downloadHistory: [
        stickerId,
        ...user.downloadHistory.filter((id) => id !== stickerId),
      ],
    };
    setUser(updatedUser);
    localStorage.setItem("funny-yellow-user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        addToFavorites,
        removeFromFavorites,
        addToDownloadHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
