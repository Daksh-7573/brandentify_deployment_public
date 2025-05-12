import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useReplitAuth } from "@/hooks/useReplitAuth";

interface ReplitAuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  login: () => void;
}

const ReplitAuthContext = createContext<ReplitAuthContextType | undefined>(undefined);

interface ReplitAuthProviderProps {
  children: ReactNode;
}

export const ReplitAuthProvider = ({ children }: ReplitAuthProviderProps) => {
  const { user, isLoading, isAuthenticated, error } = useReplitAuth();
  
  useEffect(() => {
    if (error) {
      console.error("Replit Auth error:", error);
    }
  }, [error]);
  
  const logout = () => {
    window.location.href = "/api/logout";
  };
  
  const login = () => {
    window.location.href = "/api/login";
  };
  
  const value = {
    user,
    isLoading,
    isAuthenticated,
    logout,
    login
  };
  
  return (
    <ReplitAuthContext.Provider value={value}>
      {children}
    </ReplitAuthContext.Provider>
  );
};

export const useReplitAuthContext = () => {
  const context = useContext(ReplitAuthContext);
  if (context === undefined) {
    throw new Error("useReplitAuthContext must be used within a ReplitAuthProvider");
  }
  return context;
};