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
    queryKey: ['/api/users', userId, 'profile-services', Date.now()], // Add timestamp to bust cache
    queryFn: async () => {
      if (!userId) return { whatIOffer: '', services: [] };
      
      console.log('useProfileServices hook - fetching data for:', userId);
      
      // Add a cache buster to URL to ensure we get fresh data
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(`/api/users/${userId}/profile-services${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        console.error('useProfileServices hook - failed to fetch data:', response.status, response.statusText);
        
        // Try to recover from localStorage
        const savedData = localStorage.getItem('profile_services_data');
        const savedTimestamp = localStorage.getItem('profile_services_fetchedAt');
        
        if (savedData && savedTimestamp) {
          const timestamp = parseInt(savedTimestamp, 10);
          const now = Date.now();
          const isFresh = (now - timestamp) < 1000 * 60 * 30; // 30 minutes
          
          if (isFresh) {
            console.log('useProfileServices hook - using cached data from localStorage');
            return JSON.parse(savedData);
          }
        }
        
        throw new Error('Failed to fetch profile services data');
      }
      
      const data = await response.json();
      console.log('useProfileServices hook - received data:', data);
      
      // Cache in localStorage
      localStorage.setItem('profile_services_data', JSON.stringify(data));
      localStorage.setItem('profile_services_fetchedAt', Date.now().toString());
      
      return data;
    },
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0,    // Don't keep old data in cache
    refetchOnMount: true,
    retry: 2
  });
  
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
  
  // Extract data from the query
  const data = profileServicesQuery.data || {};
  
  // Handle both string and object format for whatIOffer
  let whatIOffer = '';
  if (typeof data.whatIOffer === 'string') {
    whatIOffer = data.whatIOffer;
  } else if (typeof data.whatIOffer === 'object' && data.whatIOffer && 'whatIOffer' in data.whatIOffer) {
    whatIOffer = data.whatIOffer.whatIOffer;
  }
  
  // Handle services array with additional safety checks
  let services = [];
  if (data && 'services' in data) {
    services = Array.isArray(data.services) ? data.services : [];
    console.log('useProfileServices hook - services data present with length:', services.length);
  } else {
    console.log('useProfileServices hook - services data not found in response');
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