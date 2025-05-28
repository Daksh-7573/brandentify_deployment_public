import React, { useState, useEffect } from "react";
import { useProfileServices } from "@/hooks/use-profile-services";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Edit, 
  Trash2, 
  Package,
  MessageSquareQuote,
  Quote,
  AlertCircle,
  Plus
} from "lucide-react";
import ServiceFormGlass from "@/components/services/service-form-glass";
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
import { NeoGlassSection } from "@/components/layout/neo-glass-layout";

export default function Services() {
  const { user } = useAuth();
  const userNumericId = user?.id ? Number(user.id) : undefined;
  
  // State for directly managing data and loading states
  const [isLoading, setIsLoading] = useState(true);
  const [whatIOffer, setWhatIOffer] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  // State for dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditWhatIOfferDialogOpen, setEditWhatIOfferDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Track refresh count to help debug and break cache
  const [refreshCount, setRefreshCount] = useState(0);
  
  // Use the unified hook for data and mutations
  const { 
    services: hookServices,
    whatIOffer: hookWhatIOffer,
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
    
    setRefreshCount(prev => prev + 1);
    setIsLoading(true);
    setError(null);
    
    try {
      const cacheBuster = `?t=${Date.now()}&r=${refreshCount}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(`/api/users/${userNumericId}/profile-services${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Save to localStorage as a fallback
      try {
        localStorage.setItem('services_data_backup', JSON.stringify(data));
        localStorage.setItem('services_data_timestamp', Date.now().toString());
      } catch (cacheErr) {
        console.warn('Could not cache data in localStorage:', cacheErr);
      }
      
      // Validate and set data
      if (data && typeof data === 'object') {
        if ('whatIOffer' in data && typeof data.whatIOffer === 'string') {
          setWhatIOffer(data.whatIOffer);
        }
        
        if ('services' in data && Array.isArray(data.services)) {
          setServices(data.services);
        } else if (services.length === 0) {
          setServices([]);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      setError(err as Error);
      
      // Try to recover from localStorage
      if (err.name === 'AbortError' || (err.message && err.message.includes('Server responded with'))) {
        try {
          const cachedData = localStorage.getItem('services_data_backup');
          const timestamp = localStorage.getItem('services_data_timestamp');
          
          if (cachedData && timestamp) {
            const parsedTimestamp = parseInt(timestamp, 10);
            const now = Date.now();
            const isFresh = (now - parsedTimestamp) < 1000 * 60 * 30; // 30 minutes
            
            if (isFresh) {
              const data = JSON.parse(cachedData);
              
              if (data.whatIOffer) setWhatIOffer(data.whatIOffer);
              if (Array.isArray(data.services)) setServices(data.services);
            }
          }
        } catch (recoveryErr) {
          console.error('Recovery from cache failed:', recoveryErr);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    if (userNumericId) {
      fetchServicesData();
    }
  }, [userNumericId]);
  
  // Use services from the hook when they become available
  useEffect(() => {
    if (hookServices && Array.isArray(hookServices) && hookServices.length > 0) {
      setServices(hookServices);
      setIsLoading(false);
    }
    
    if (hookWhatIOffer) {
      setWhatIOffer(hookWhatIOffer);
    }
  }, [hookServices, hookWhatIOffer]);
  
  const handleCreate = (formData: any) => {
    if (!userNumericId) return;
    
    const serviceData = {
      ...formData,
      userId: userNumericId
    };
    
    try {
      createService(serviceData);
      
      // Force a refresh after creation
      setTimeout(() => {
        fetchServicesData();
      }, 1000);
      
      setIsCreateDialogOpen(false);
    } catch (err) {
      // Ensure dialog is closed even on error
      setIsCreateDialogOpen(false);
    }
  };
  
  const handleUpdate = (formData: any) => {
    if (!selectedService || !userNumericId) return;
    
    updateService({
      id: selectedService.id,
      data: {
        ...formData,
        userId: userNumericId // Ensure userId is always included
      }
    });
    
    // Force a refresh after update
    setTimeout(() => {
      fetchServicesData();
    }, 1000);
    
    setIsEditDialogOpen(false);
  };
  
  const handleDelete = () => {
    if (!selectedService) return;
    
    deleteService(selectedService.id);
    
    // Force a refresh after deletion
    setTimeout(() => {
      fetchServicesData();
    }, 1000);
    
    setIsDeleteDialogOpen(false);
  };
  
  const formatCurrency = (amount: number | null, currency: 'INR' | 'USD') => {
    if (amount === null) return '';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const handleUpdateWhatIOffer = (whatIOffer: string) => {
    if (!userNumericId) return;
    
    // Call the update service method with whatIOffer field
    updateService({
      id: -1, // Special ID that indicates we're updating the whatIOffer field
      data: { whatIOffer } 
    });
    
    // Force a refresh to get the updated data
    setTimeout(() => {
      fetchServicesData();
    }, 1000);
    
    setEditWhatIOfferDialogOpen(false);
  };
  
  return (
    <>
      {/* Services Section */}
      <NeoGlassSection className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">What I Offer</h2>
            <p className="text-sm text-gray-300">Specific professional services I provide (max 6)</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
                disabled={services.length >= 6 || isPendingCreate || isPendingUpdate}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Service</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden neo-glass-card bg-transparent">
              <DialogHeader>
                <DialogTitle className="text-white text-xl font-semibold">Add Service</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Enter a professional service you offer (one at a time).
                </DialogDescription>
              </DialogHeader>
              
              <div className="max-h-[70vh] overflow-y-auto pr-2" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.3) rgba(255,255,255,0.1)'
              }}>
                <div className="py-5">
                  <ServiceFormGlass 
                    onSubmit={handleCreate} 
                    isPending={isPendingCreate}
                    existingServicesCount={services.length}
                  />
                </div>
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md border border-white/20 rounded-lg p-5 shadow-xl transition-all hover:shadow-2xl hover:border-white/30 hover:transform hover:scale-[1.02] group"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-base line-clamp-2 flex-1 text-white">{service.title}</h3>
                  <div className="flex items-center space-x-2 ml-2">
                    <button 
                      className="text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/20 rounded-md p-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
                      onClick={() => {
                        setSelectedService(service);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      className="text-white/70 hover:text-red-300 hover:bg-red-500/10 backdrop-blur-sm border border-white/20 hover:border-red-400/30 rounded-md p-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400/30"
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
                <div className="mt-3 pt-3 border-t border-white/10">
                  {(service.priceUsd !== undefined && service.priceUsd !== null) && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Price</span>
                      <span className="text-sm font-semibold text-white bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">
                        {formatCurrency(service.priceUsd, 'USD')}
                        {service.isHourly ? '/hr' : ''}
                      </span>
                    </div>
                  )}
                  {(service.priceInr !== undefined && service.priceInr !== null) && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Price</span>
                      <span className="text-sm font-semibold text-white bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">
                        {formatCurrency(service.priceInr, 'INR')}
                        {service.isHourly ? '/hr' : ''}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Removed status and category badges as requested */}
              </div>
            ))}
          </div>
        )}
      </NeoGlassSection>
      
      {/* Edit What I Offer Dialog */}
      <Dialog open={isEditWhatIOfferDialogOpen} onOpenChange={setEditWhatIOfferDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit General Professional Offering</DialogTitle>
            <DialogDescription>
              Describe your overall professional services and expertise.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="whatIOffer" className="text-sm font-medium text-white">
                Description
              </label>
              <textarea
                id="whatIOffer"
                rows={5}
                className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                placeholder="Describe your professional services..."
                value={whatIOffer || ''}
                onChange={(e) => setWhatIOffer(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditWhatIOfferDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="neo-glass-button" 
                disabled={isPendingUpdate}
                onClick={() => handleUpdateWhatIOffer(whatIOffer)}
              >
                {isPendingUpdate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px] max-h-[88vh] overflow-y-auto bg-transparent">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update your professional service details.
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <ServiceFormGlass 
              onSubmit={handleUpdate} 
              isPending={isPendingUpdate}
              existingServicesCount={services.length}
              initialData={selectedService}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service
              from your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={handleDelete}
              disabled={isPendingDelete}
            >
              {isPendingDelete && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}