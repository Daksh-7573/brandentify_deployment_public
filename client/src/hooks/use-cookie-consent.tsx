import { useState, useEffect, createContext, useContext } from 'react';

// Define the consent categories
export type ConsentCategory = 'essential' | 'functional' | 'analytics' | 'advertising' | 'social';

// Status from the server
export type ConsentStatus = 'granted' | 'denied' | 'withdrawn' | 'expired';

// Response format from the server
export interface ConsentResponse {
  category: ConsentCategory;
  status: ConsentStatus;
}

// Consent preferences interface
export interface ConsentPreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
  social: boolean;
}

// Context interface
interface CookieConsentContextValue {
  preferences: ConsentPreferences;
  hasConsented: boolean;
  updatePreference: (category: ConsentCategory, granted: boolean) => Promise<void>;
  acceptAll: () => Promise<void>;
  rejectNonEssential: () => Promise<void>;
  savePreferences: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Create the context
const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

// Provider component
export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    essential: true, // Always required
    functional: false,
    analytics: false,
    advertising: false,
    social: false,
  });
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's consent preferences on initial load
  useEffect(() => {
    fetchPreferences();
  }, []);

  // Function to fetch current preferences
  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      const isAuthenticated = !!localStorage.getItem('authToken');
      
      // If not authenticated, try to load from localStorage first
      if (!isAuthenticated) {
        const savedPreferences = localStorage.getItem('cookiePreferences');
        if (savedPreferences) {
          try {
            const parsedPreferences = JSON.parse(savedPreferences);
            setPreferences(parsedPreferences);
            setHasConsented(true);
            setLoading(false);
            return;
          } catch (parseError) {
            console.warn('Could not parse saved preferences', parseError);
            // Continue with default preferences
          }
        }
        
        // No saved preferences, use default settings for unauthenticated users
        setHasConsented(false);
        setLoading(false);
        return;
      }
      
      // For authenticated users, try server first
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/privacy/cookie-consent', {
        headers: {
          'Authorization': `Bearer ${authToken || ''}`,
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data: ConsentResponse[] = await response.json();
        
        // Default preferences
        const newPreferences: ConsentPreferences = {
          essential: true, // Always required
          functional: false,
          analytics: false,
          advertising: false,
          social: false,
        };
        
        // Update from server response
        data.forEach(consent => {
          newPreferences[consent.category] = consent.status === 'granted';
        });
        
        setPreferences(newPreferences);
        
        // Check if non-essential preferences have been explicitly set
        const hasExplicitlyConsented = data.some(consent => 
          consent.category !== 'essential' && 
          (consent.status === 'granted' || consent.status === 'denied')
        );
        
        setHasConsented(hasExplicitlyConsented);
      } else {
        // If not authorized or no preferences yet on server, try localStorage
        const savedPreferences = localStorage.getItem('cookiePreferences');
        if (savedPreferences) {
          try {
            const parsedPreferences = JSON.parse(savedPreferences);
            setPreferences(parsedPreferences);
            setHasConsented(true);
          } catch (parseError) {
            console.warn('Could not parse saved preferences', parseError);
            // Use default preferences (already set)
            setHasConsented(false);
          }
        } else {
          // No preferences anywhere, use defaults
          setHasConsented(false);
        }
      }
    } catch (err) {
      // On error, fallback to localStorage
      const savedPreferences = localStorage.getItem('cookiePreferences');
      if (savedPreferences) {
        try {
          const parsedPreferences = JSON.parse(savedPreferences);
          setPreferences(parsedPreferences);
          setHasConsented(true);
        } catch (parseError) {
          console.warn('Could not parse saved preferences', parseError);
          // Use default preferences (already set)
        }
      }
      
      console.error('Error fetching cookie consent preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update a single preference
  const updatePreference = async (category: ConsentCategory, granted: boolean) => {
    if (category === 'essential') return; // Cannot change essential cookies
    
    setPreferences(prev => ({
      ...prev,
      [category]: granted,
    }));
  };

  // Accept all cookies
  const acceptAll = async () => {
    setPreferences({
      essential: true,
      functional: true,
      analytics: true,
      advertising: true,
      social: true,
    });
    await savePreferences();
  };

  // Reject all non-essential cookies
  const rejectNonEssential = async () => {
    setPreferences({
      essential: true,
      functional: false,
      analytics: false,
      advertising: false,
      social: false,
    });
    await savePreferences();
  };

  // Save current preferences to the server
  const savePreferences = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get CSRF token from cookie if it exists
      const getCsrfToken = () => {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'XSRF-TOKEN') {
            return value;
          }
        }
        return '';
      };
      
      const csrfToken = getCsrfToken();
      
      // If user is not authenticated, store in localStorage instead
      // This is a fallback for unauthenticated users
      if (!localStorage.getItem('authToken')) {
        // Store in localStorage for unauthenticated users
        localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        setHasConsented(true);
        return;
      }
      
      // Save each preference to the server for authenticated users
      for (const [category, granted] of Object.entries(preferences)) {
        if (category === 'essential') continue; // Essential cookies are always required
        
        const response = await fetch('/api/privacy/cookie-consent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          },
          body: JSON.stringify({
            category,
            status: granted ? 'granted' : 'denied',
          }),
          credentials: 'include',
        });
        
        if (!response.ok) {
          // If server response fails, fallback to localStorage
          localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
          console.warn(`Server-side preference saving failed, using localStorage fallback for ${category}`);
        }
      }
      
      setHasConsented(true);
    } catch (err) {
      // On error, use localStorage as fallback
      localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
      console.error('Error saving cookie consent preferences:', err);
      // Don't set error state for users, since we've successfully saved to localStorage
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value: CookieConsentContextValue = {
    preferences,
    hasConsented,
    updatePreference,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    loading,
    error,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};

// Hook to use the cookie consent context
export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  
  return context;
};

// Utility function to check if a specific cookie category is allowed
export const useHasConsent = (category: ConsentCategory) => {
  const { preferences } = useCookieConsent();
  return preferences[category];
};