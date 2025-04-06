import { InsertService, Service } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useServices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const userNumericId = user?.id;
  // Always use the numeric ID for API requests since our backend expects numeric IDs
  const userId = userNumericId?.toString();
  
  const servicesQuery = useQuery<Service[]>({
    queryKey: ['/api/users', userId, 'services'],
    queryFn: async () => {
      if (!userId) return [];
      console.log('useServices hook - fetching services for:', userId, 'userNumericId:', userNumericId);
      const response = await fetch(`/api/users/${userId}/services`);
      if (!response.ok) {
        console.error('useServices hook - failed to fetch services:', response.status, response.statusText);
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      console.log('useServices hook - received services data:', data);
      return data;
    },
    enabled: !!userId,
  });
  
  const createServiceMutation = useMutation({
    mutationFn: async (service: InsertService) => {
      const response = await apiRequest('POST', '/api/services', service);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'services'] });
      toast({
        title: "Service created",
        description: "Your service has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create service",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Service> }) => {
      const response = await apiRequest('PUT', `/api/services/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'services'] });
      toast({
        title: "Service updated",
        description: "Your service has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update service",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'services'] });
      toast({
        title: "Service deleted",
        description: "Your service has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete service",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  console.log('useServices hook - returning data', { 
    servicesData: servicesQuery.data,
    isLoading: servicesQuery.isLoading,
    isError: servicesQuery.isError,
    error: servicesQuery.error?.message
  });
  
  return {
    services: servicesQuery.data || [],
    isLoading: servicesQuery.isLoading,
    isError: servicesQuery.isError,
    error: servicesQuery.error,
    createService: createServiceMutation.mutate,
    updateService: updateServiceMutation.mutate,
    deleteService: deleteServiceMutation.mutate,
    isPendingCreate: createServiceMutation.isPending,
    isPendingUpdate: updateServiceMutation.isPending,
    isPendingDelete: deleteServiceMutation.isPending
  };
}