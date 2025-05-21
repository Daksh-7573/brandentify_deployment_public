import React, { useState, useEffect } from "react";
import { useProfileServices } from "@/hooks/use-profile-services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Edit, 
  Trash2, 
  Package,
  Plus
} from "lucide-react";
import ServiceForm from "@/components/services/service-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Service } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Helper function to format currency
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Services({ userFirebaseId, userNumericId }: { userFirebaseId: string; userNumericId?: number }) {
  // State for directly managing data and loading states
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Track refresh count to help debug and break cache
  const [refreshCount, setRefreshCount] = useState(0);
  
  // Use the unified hook for data and mutations
  const { 
    services: hookServices,
    createService, 
    updateService, 
    deleteService, 
    isPendingCreate,
    isPendingUpdate,
    isPendingDelete,
    isLoading: isLoadingFromHook
  } = useProfileServices();
  
  // Function to directly fetch the data with improved error handling
  const fetchServicesData = async () => {
    if (!userNumericId) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/services?userId=${userNumericId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setServices(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Effect to load data on mount and when refreshCount changes
  useEffect(() => {
    // Prefer the hook data if available
    if (hookServices) {
      setServices(hookServices);
      setIsLoading(isLoadingFromHook);
      return;
    }
    
    // Fall back to direct fetch if hook data isn't available
    fetchServicesData();
  }, [hookServices, isLoadingFromHook, userNumericId, refreshCount]);
  
  // Function to handle service creation
  const handleCreate = async (formData: any) => {
    try {
      await createService({
        ...formData,
        userId: userNumericId
      });
      setIsCreateDialogOpen(false);
      // Force a refresh
      setRefreshCount(prev => prev + 1);
    } catch (err) {
      console.error("Error creating service:", err);
    }
  };
  
  // Function to handle service update
  const handleUpdate = async (formData: any) => {
    if (!selectedService) return;
    
    try {
      await updateService({
        ...formData,
        id: selectedService.id,
        userId: userNumericId
      });
      setIsEditDialogOpen(false);
      // Force a refresh
      setRefreshCount(prev => prev + 1);
    } catch (err) {
      console.error("Error updating service:", err);
    }
  };
  
  // Function to handle service deletion
  const handleDelete = async () => {
    if (!selectedService) return;
    
    try {
      await deleteService(selectedService.id);
      setIsDeleteDialogOpen(false);
      // Force a refresh
      setRefreshCount(prev => prev + 1);
    } catch (err) {
      console.error("Error deleting service:", err);
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex flex-row items-center justify-between space-y-0 pb-4 mb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white">Specific Services</h2>
          <p className="text-sm text-gray-300">Individual professional services I provide (max 6)</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
              disabled={services.length >= 6 || isPendingCreate || isPendingUpdate}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Service</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Enter a specific professional service you offer (one at a time).
              </DialogDescription>
            </DialogHeader>
            <ServiceForm 
              onSubmit={handleCreate} 
              isPending={isPendingCreate}
              existingServicesCount={services.length}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Specific Services List */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      ) : !services || !Array.isArray(services) || services.length === 0 ? (
        <div className="py-6 text-center">
          <Package className="mx-auto h-10 w-10 text-gray-400/50" />
          <p className="mt-2 text-gray-400">No specific offerings added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="p-4 rounded-lg border border-gray-800 bg-black/40 transition-all hover:translate-y-[-3px]"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-base line-clamp-2 flex-1 text-white">{service.title}</h3>
                <div className="flex items-center space-x-1 ml-2">
                  <button 
                    className="text-gray-300 hover:text-white focus:outline-none rounded-full p-1 hover:bg-gray-800/50"
                    onClick={() => {
                      setSelectedService(service);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    className="text-gray-300 hover:text-red-400 focus:outline-none rounded-full p-1 hover:bg-gray-800/50"
                    onClick={() => {
                      setSelectedService(service);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              
              {/* Service description */}
              {service.description && (
                <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                  {service.description}
                </p>
              )}
              
              {/* Display price information */}
              <div className="mt-2">
                {(service.priceUsd !== undefined && service.priceUsd !== null) && (
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(service.priceUsd, 'USD')}
                    {service.isHourly ? '/hr' : ''}
                  </p>
                )}
                {(service.priceInr !== undefined && service.priceInr !== null) && (
                  <p className="text-sm font-medium text-white">
                    {formatCurrency(service.priceInr, 'INR')}
                    {service.isHourly ? '/hr' : ''}
                  </p>
                )}
              </div>
              
              <div className="mt-2 flex items-center">
                <Badge 
                  className={service.isActive ? 'bg-white/15 text-white hover:bg-white/20 border-none' : 'bg-gray-800/60 text-gray-400 border-none'}
                >
                  {service.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {service.isRemote && (
                  <Badge className="bg-white/15 text-white hover:bg-white/20 border-none ml-2">
                    Remote
                  </Badge>
                )}
                {service.category && (
                  <Badge className="bg-white/15 text-white hover:bg-white/20 border-none ml-2">
                    {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px] max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update your professional service details.
            </DialogDescription>
          </DialogHeader>
          <ServiceForm 
            onSubmit={handleUpdate} 
            isPending={isPendingUpdate}
            existingServicesCount={services.length}
            initialData={selectedService}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Service Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the service "{selectedService?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isPendingDelete}
            >
              {isPendingDelete && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}