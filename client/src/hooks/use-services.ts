import { useAuth } from "./use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Service, InsertService } from "@shared/schema";
import { useState, useEffect } from "react";

export function useServices() {
  const { user } = useAuth();
  const [userNumericId, setUserNumericId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      // Convert user.id to a number if it's a string
      const numericId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      setUserNumericId(numericId);
    }
  }, [user]);

  const {
    data: services = [],
    isLoading,
    error,
  } = useQuery<Service[]>({
    queryKey: userNumericId ? [`/api/users/${userNumericId}/services`] : null,
    queryFn: async () => {
      console.log("Services - Fetching services with numeric userId:", userNumericId);
      const response = await apiRequest('GET', `/api/users/${userNumericId}/services`);
      const data = await response.json();
      console.log("Services - Got services data:", data);
      return data;
    },
    enabled: !!userNumericId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertService) => {
      console.log("Creating service with data:", data);
      const response = await apiRequest('POST', '/api/services', data);
      return response.json();
    },
    onSuccess: () => {
      console.log("Service created successfully, invalidating queries");
      if (userNumericId) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userNumericId}/services`] });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Service> }) => {
      console.log(`Updating service ${id} with data:`, data);
      const response = await apiRequest('PUT', `/api/services/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      console.log("Service updated successfully, invalidating queries");
      if (userNumericId) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userNumericId}/services`] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log(`Deleting service ${id}`);
      await apiRequest('DELETE', `/api/services/${id}`);
    },
    onSuccess: () => {
      console.log("Service deleted successfully, invalidating queries");
      if (userNumericId) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userNumericId}/services`] });
      }
    },
  });

  return {
    services,
    isLoading,
    error,
    createService: createMutation.mutate,
    updateService: updateMutation.mutate,
    deleteService: deleteMutation.mutate,
    isPendingCreate: createMutation.isPending,
    isPendingUpdate: updateMutation.isPending,
    isPendingDelete: deleteMutation.isPending,
  };
}