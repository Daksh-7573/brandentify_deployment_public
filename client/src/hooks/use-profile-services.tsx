import { Service, InsertService } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

/**
 * Combined hook for fetching and managing both the "What I Offer" field and services
 */
export function useProfileServices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const userNumericId = user?.id;
  // Always use the numeric ID for API requests since our backend expects numeric IDs
  const userId = userNumericId?.toString();
  
  // Use the new combined endpoint that returns both whatIOffer and services
  const profileServicesQuery = useQuery({
    queryKey: ['/api/users', userId, 'profile-services'], // Remove timestamp to ensure consistent queryKey across components
    queryFn: async () => {
      if (!userId) return { whatIOffer: '', services: [] };
      
      console.log('useProfileServices hook - fetching data for:', userId);
      
      try {
        // Add a cache buster to URL to ensure we get fresh data
        const cacheBuster = `?t=${Date.now()}`;
        const controller = new AbortController();
        
        // Set timeout to prevent long-hanging requests
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
        
        const response = await fetch(`/api/users/${userId}/profile-services${cacheBuster}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          signal: controller.signal
        });
        
        // Clear the timeout as request completed
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.error('useProfileServices hook - failed to fetch data:', response.status, response.statusText);
          
          // Attempt recovery from localStorage for certain error codes that indicate server issues
          if (response.status >= 500) {
            console.log('useProfileServices hook - server error, attempting recovery from cache');
            const recoveredData = recoverFromLocalStorage();
            if (recoveredData) return recoveredData;
          }
          
          throw new Error(`Failed to fetch profile services data - ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('useProfileServices hook - received data:', data);
        
        // If we got a valid response but there are no services, check if this looks valid
        if (!data.services || !Array.isArray(data.services)) {
          console.warn('useProfileServices hook - response has no services array, checking format');
          
          // If we have reason to believe the response is malformed, try recovery
          if (!data.whatIOffer && Object.keys(data).length < 2) {
            console.warn('useProfileServices hook - suspicious response, attempting recovery');
            const recoveredData = recoverFromLocalStorage();
            if (recoveredData) return recoveredData;
          }
        }
        
        // Cache in localStorage
        localStorage.setItem('profile_services_data', JSON.stringify(data));
        localStorage.setItem('profile_services_fetchedAt', Date.now().toString());
        
        return data;
      } catch (error) {
        console.error('useProfileServices hook - fetch error:', error);
        
        // Network errors (like timeout, abort, or offline) should try to use cached data
        const recoveredData = recoverFromLocalStorage();
        if (recoveredData) return recoveredData;
        
        // If we can't recover, rethrow the error
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes - improves performance and prevents duplicate requests
    gcTime: 1000 * 60 * 10,   // 10 minutes - keep data in cache longer
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false,   // Don't refetch on reconnect
    retry: 3, // Increase retry count for better resilience
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000) // Exponential backoff
  });
  
  // Helper function to recover data from localStorage
  function recoverFromLocalStorage() {
    const savedData = localStorage.getItem('profile_services_data');
    const savedTimestamp = localStorage.getItem('profile_services_fetchedAt');
    
    if (savedData && savedTimestamp) {
      const timestamp = parseInt(savedTimestamp, 10);
      const now = Date.now();
      const isFresh = (now - timestamp) < 1000 * 60 * 30; // 30 minutes
      
      if (isFresh) {
        console.log('useProfileServices hook - recovering with cached data from localStorage');
        return JSON.parse(savedData);
      } else {
        console.log('useProfileServices hook - cached data too old, not using it');
      }
    }
    
    return null; // No valid cached data
  }
  
  const updateWhatIOfferMutation = useMutation({
    mutationFn: async (whatIOffer: string) => {
      if (!userId) throw new Error('User ID is required');
      
      console.log('useProfileServices hook - updating whatIOffer:', whatIOffer);
      const response = await apiRequest('POST', `/api/users/${userId}/sync-profile-services`, { whatIOffer });
      
      if (!response.ok) {
        throw new Error('Failed to update "What I Offer" field');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('useProfileServices hook - whatIOffer updated successfully:', data);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'profile-services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'what-i-offer'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      
      // Update localStorage cache
      localStorage.setItem('profile_services_data', JSON.stringify(data));
      localStorage.setItem('profile_services_fetchedAt', Date.now().toString());
      
      toast({
        title: "Profile updated",
        description: "Your professional offering has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      console.error('useProfileServices hook - error updating whatIOffer:', error);
      toast({
        title: "Update failed",
        description: error.message || "There was a problem updating your profile.",
        variant: "destructive",
      });
    }
  });
  
  const createServiceMutation = useMutation({
    mutationFn: async (service: InsertService) => {
      console.log('useProfileServices hook - creating service:', service);
      const response = await apiRequest('POST', '/api/profile-services', service);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('useProfileServices hook - service created successfully:', data);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'profile-services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'services'] });
      
      // Update localStorage cache with new data
      if (data.service && data.services) {
        localStorage.setItem('profile_services_data', JSON.stringify({
          whatIOffer: data.whatIOffer || profileServicesQuery.data?.whatIOffer || '',
          services: data.services || [],
          success: true,
          timestamp: Date.now()
        }));
        localStorage.setItem('profile_services_fetchedAt', Date.now().toString());
      }
      
      toast({
        title: "Service created",
        description: "Your service has been successfully created.",
      });
    },
    onError: (error: Error) => {
      console.error('useProfileServices hook - error creating service:', error);
      toast({
        title: "Failed to create service",
        description: error.message || "There was a problem creating your service.",
        variant: "destructive",
      });
    }
  });
  
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Service> }) => {
      console.log('useProfileServices hook - updating service:', id, data);
      const response = await apiRequest('PUT', `/api/profile-services/${id}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('useProfileServices hook - service updated successfully:', data);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'profile-services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'services'] });
      
      // Update localStorage cache with new data
      if (data.service && data.services) {
        localStorage.setItem('profile_services_data', JSON.stringify({
          whatIOffer: data.whatIOffer || profileServicesQuery.data?.whatIOffer || '',
          services: data.services || [],
          success: true,
          timestamp: Date.now()
        }));
        localStorage.setItem('profile_services_fetchedAt', Date.now().toString());
      }
      
      toast({
        title: "Service updated",
        description: "Your service has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      console.error('useProfileServices hook - error updating service:', error);
      toast({
        title: "Failed to update service",
        description: error.message || "There was a problem updating your service.",
        variant: "destructive",
      });
    }
  });
  
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('useProfileServices hook - deleting service:', id);
      const response = await apiRequest('DELETE', `/api/profile-services/${id}?userId=${userId}`);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('useProfileServices hook - service deleted successfully:', data);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'profile-services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'services'] });
      
      // Update localStorage cache with new data
      if (data.services) {
        localStorage.setItem('profile_services_data', JSON.stringify({
          whatIOffer: data.whatIOffer || profileServicesQuery.data?.whatIOffer || '',
          services: data.services || [],
          success: true,
          timestamp: Date.now()
        }));
        localStorage.setItem('profile_services_fetchedAt', Date.now().toString());
      }
      
      toast({
        title: "Service deleted",
        description: "Your service has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      console.error('useProfileServices hook - error deleting service:', error);
      toast({
        title: "Failed to delete service",
        description: error.message || "There was a problem deleting your service.",
        variant: "destructive",
      });
    }
  });
  
  // Extract data from the query with more robust error handling
  const data = profileServicesQuery.data || {};
  
  // Handle both string and object format for whatIOffer with improved checking
  let whatIOffer = '';
  if (typeof data === 'object' && data !== null) {
    if (typeof data.whatIOffer === 'string') {
      whatIOffer = data.whatIOffer;
    } else if (typeof data.whatIOffer === 'object' && data.whatIOffer && 'whatIOffer' in data.whatIOffer) {
      whatIOffer = data.whatIOffer.whatIOffer;
    }
  }
  
  // Handle services array with improved safety checks and fallback mechanisms
  let services = [];
  
  // Try different possible paths where services might be
  if (data && typeof data === 'object') {
    if ('services' in data && Array.isArray(data.services)) {
      services = data.services;
      console.log('useProfileServices hook - services found directly:', services.length);
    } else if ('data' in data && typeof data.data === 'object' && data.data && 'services' in data.data) {
      // Sometimes APIs nest data one level down
      services = Array.isArray(data.data.services) ? data.data.services : [];
      console.log('useProfileServices hook - services found in nested data object:', services.length);
    }
  }
  
  // Log empty services as this might indicate a problem
  if (services.length === 0) {
    console.log('useProfileServices hook - no services found in response. Raw data:', data);
  }
  
  console.log('useProfileServices hook - processed data', { 
    whatIOffer,
    servicesCount: services.length,
    isLoading: profileServicesQuery.isLoading,
    isError: profileServicesQuery.isError,
    error: profileServicesQuery.error?.message
  });
  
  return {
    whatIOffer,
    services,
    isLoading: profileServicesQuery.isLoading,
    isError: profileServicesQuery.isError,
    error: profileServicesQuery.error,
    updateWhatIOffer: updateWhatIOfferMutation.mutate,
    createService: createServiceMutation.mutate,
    updateService: updateServiceMutation.mutate,
    deleteService: deleteServiceMutation.mutate,
    isPendingWhatIOffer: updateWhatIOfferMutation.isPending,
    isPendingCreate: createServiceMutation.isPending,
    isPendingUpdate: updateServiceMutation.isPending,
    isPendingDelete: deleteServiceMutation.isPending
  };
}