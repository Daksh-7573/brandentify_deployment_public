import React, { createContext, useState, useContext, ReactNode } from "react";
import ProfileLoadingAnimation from "@/components/ui/profile-loading-animation";

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  loadingText: string;
  setLoadingText: (text: string) => void;
  showLoadingOverlay: (text?: string) => void;
  hideLoadingOverlay: () => void;
}

const defaultLoadingContext: LoadingContextType = {
  isLoading: false,
  setLoading: () => {},
  loadingText: "Loading...",
  setLoadingText: () => {},
  showLoadingOverlay: () => {},
  hideLoadingOverlay: () => {},
};

const LoadingContext = createContext<LoadingContextType>(defaultLoadingContext);

export const useLoading = () => useContext(LoadingContext);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const showLoadingOverlay = (text?: string) => {
    if (text) {
      setLoadingText(text);
    }
    setIsLoading(true);
  };

  const hideLoadingOverlay = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setLoading,
        loadingText,
        setLoadingText,
        showLoadingOverlay,
        hideLoadingOverlay,
      }}
    >
      {children}
      
      {/* Full-screen loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card shadow-lg rounded-lg p-6 border border-border">
            <ProfileLoadingAnimation 
              size="large" 
              text={loadingText}
            />
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;