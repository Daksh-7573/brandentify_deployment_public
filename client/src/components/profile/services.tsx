import React, { useState, useEffect } from "react";
import { useProfileServices } from "@/hooks/use-profile-services";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  PlusCircle, 
  Edit, 
  Trash2, 
  ShoppingCart,
  Package,
  MessageSquareQuote,
  Quote,
  AlertCircle,
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
import { NeoGlassSection } from "@/components/layout/neo-glass-layout";

export default function Services() {
  const { user } = useAuth();
  const userNumericId = user?.id ? Number(user.id) : undefined;
  
  // State for directly managing data and loading states
  const [isLoading, setIsLoading] = useState(true);
  const [whatIOffer, setWhatIOffer] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Track refresh count to help debug and break cache
  const [refreshCount, setRefreshCount] = useState(0);
  
  // Function to directly fetch the data with improved error handling
  const fetchServicesData = async () => {
    if (!userNumericId) return;
    
    // Increment refresh count to track calls
    setRefreshCount(prev => prev + 1);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Services component - direct fetch #${refreshCount} started for user ID:`, userNumericId);
      
      // Add cache busting
      const cacheBuster = `?t=${Date.now()}&r=${refreshCount}`;
      
      // Add timeout protection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(`/api/users/${userNumericId}/profile-services${cacheBuster}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        signal: controller.signal
      });
      
      // Clear timeout since request completed
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Services component - direct fetch #${refreshCount} result:`, data);
      
      // Save to localStorage as a fallback
      try {
        localStorage.setItem('services_data_backup', JSON.stringify(data));
        localStorage.setItem('services_data_timestamp', Date.now().toString());
      } catch (cacheErr) {
        console.warn('Services component - could not cache data in localStorage:', cacheErr);
      }
      
      // Validate and set data
      if (data && typeof data === 'object') {
        // Handle whatIOffer field
        if ('whatIOffer' in data && typeof data.whatIOffer === 'string') {
          setWhatIOffer(data.whatIOffer);
        }
        
        // Handle services array
        if ('services' in data && Array.isArray(data.services)) {
          setServices(data.services);
          console.log(`Services component - found ${data.services.length} services in response`);
        } else {
          console.warn('Services component - response missing valid services array:', data);
          // Try to keep existing services if new data is invalid
          if (services.length > 0) {
            console.log('Services component - keeping existing services data');
          } else {
            setServices([]);
          }
        }
      } else {
        console.error('Services component - response is not a valid object:', data);
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error(`Services component - fetch #${refreshCount} error:`, err);
      setError(err as Error);
      
      // Try to recover from localStorage if it's a network error or server error
      if (err.name === 'AbortError' || err.message.includes('Server responded with')) {
        try {
          const cachedData = localStorage.getItem('services_data_backup');
          const timestamp = localStorage.getItem('services_data_timestamp');
          
          if (cachedData && timestamp) {
            const parsedTimestamp = parseInt(timestamp, 10);
            const now = Date.now();
            const isFresh = (now - parsedTimestamp) < 1000 * 60 * 30; // 30 minutes
            
            if (isFresh) {
              console.log('Services component - recovering from localStorage cache');
              const data = JSON.parse(cachedData);
              
              if (data.whatIOffer) setWhatIOffer(data.whatIOffer);
              if (Array.isArray(data.services)) setServices(data.services);
            }
          }
        } catch (recoveryErr) {
          console.error('Services component - recovery from cache failed:', recoveryErr);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data on component mount, but don't set up a continuous refresh that causes flickering
  useEffect(() => {
    if (userNumericId) {
      console.log('Services component - initial fetch for user ID:', userNumericId);
      fetchServicesData();
      
      // No regular refresh interval - just do a one-time fetch
      // This prevents the loading indicator from continuously appearing
    }
  }, [userNumericId]);
  
  // Use the unified hook for both data and mutations
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
  
  // Use services from the hook when they become available
  useEffect(() => {
    if (hookServices && Array.isArray(hookServices) && hookServices.length > 0) {
      console.log('Services component - using services from useProfileServices hook:', hookServices.length);
      setServices(hookServices);
      setIsLoading(false);
    }
    
    if (hookWhatIOffer) {
      console.log('Services component - using whatIOffer from hook:', hookWhatIOffer);
      setWhatIOffer(hookWhatIOffer);
    }
  }, [hookServices, hookWhatIOffer]);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditWhatIOfferDialogOpen, setEditWhatIOfferDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const handleCreate = (formData: any) => {
    if (!userNumericId) {
      console.error("Services component - handleCreate: userNumericId is undefined!");
      return;
    }
    
    // Detailed logging to diagnose service creation issues
    console.log("Services component - handleCreate called with formData:", JSON.stringify(formData));
    console.log("Services component - userNumericId:", userNumericId, "type:", typeof userNumericId);
    
    // Always use the numeric ID for the database
    const serviceData = {
      ...formData,
      userId: userNumericId
    };
    
    console.log("Services component - createService submitting:", JSON.stringify(serviceData));
    
    // The try-catch block helps identify errors in service creation
    try {
      createService(serviceData);
      
      console.log("Services component - createService call completed");
      
      // Force a refresh after creation
      setTimeout(() => {
        console.log("Services component - refreshing services data after creation");
        fetchServicesData();
      }, 1000);
      
      setIsCreateDialogOpen(false);
    } catch (err) {
      console.error("Services component - service creation error:", err);
      
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
  
  return (
    <NeoGlassSection title="What I Offer" className="mb-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <p className="text-sm text-slate-300">Professional services I provide (max 6)</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap bg-slate-800/60 text-white hover:bg-slate-700/70"
              disabled={services.length >= 6 || isPendingCreate || isPendingUpdate}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add What I Offer</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add What I Offer</DialogTitle>
              <DialogDescription>
                Enter a professional service you offer (one at a time).
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
    
      <div className="mt-4">
        {/* Specific Services List */}
        <div>
          
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : !services || !Array.isArray(services) || services.length === 0 ? (
            <div className="py-6 text-center border border-white/10 rounded-lg bg-slate-800/50 backdrop-blur-md shadow-xl shadow-black/5 neo-glass-card">
              <Package className="mx-auto h-10 w-10 text-slate-300 mb-2" />
              <p className="mt-2 text-slate-300">No offerings added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {services.map((service) => (
                <div 
                  key={service.id} 
                  className="border border-white/10 rounded-lg p-4 bg-slate-800/50 backdrop-blur-md transition-all hover:bg-slate-700/50 shadow-xl shadow-black/5 neo-glass-card"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-base line-clamp-2 flex-1 text-white">{service.title}</h3>
                    <div className="flex items-center space-x-1 ml-2">
                      <button 
                        className="text-slate-300 hover:text-white focus:outline-none rounded-full p-1 hover:bg-white/10"
                        onClick={() => {
                          setSelectedService(service);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        className="text-slate-300 hover:text-red-400 focus:outline-none rounded-full p-1 hover:bg-white/10"
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
                    <p className="mt-2 text-sm text-slate-300 line-clamp-2">
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
                      className={service.isActive ? 'bg-white/15 text-white hover:bg-white/20 border-none' : 'bg-slate-800/60 text-slate-400 border-none'}
                    >
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* What I Offer content - general description */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-base font-semibold text-white">General Professional Offering</h3>
            <Button
              size="sm"
              className="neo-glass-button flex items-center gap-1 py-1.5 px-3 whitespace-nowrap"
              disabled={isPendingCreate || isPendingUpdate}
              onClick={() => setEditWhatIOfferDialogOpen(true)}
            >
              <MessageSquareQuote className="h-3.5 w-3.5" />
              <span>Edit Description</span>
            </Button>
          </div>
          
          {whatIOffer ? (
            <div className="border border-white/10 rounded-lg p-4 bg-slate-800/50 backdrop-blur-md shadow-xl shadow-black/5 neo-glass-card">
              <Quote className="h-5 w-5 text-slate-300 mb-1" />
              <p className="text-sm text-slate-300 whitespace-pre-line">{whatIOffer}</p>
            </div>
          ) : (
            <div className="border border-dashed border-white/10 rounded-lg p-4 bg-slate-800/50 backdrop-blur-md text-center shadow-xl shadow-black/5 neo-glass-card">
              <AlertCircle className="mx-auto h-8 w-8 text-slate-300/60 mb-2" />
              <p className="text-sm text-slate-300">
                Add a general description of your professional services.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px] max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit What I Offer</DialogTitle>
            <DialogDescription>
              Update your professional service.
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <ServiceForm 
              service={selectedService}
              onSubmit={handleUpdate} 
              isPending={isPendingUpdate}
              existingServicesCount={services.length}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit General Description Dialog */}
      <Dialog open={isEditWhatIOfferDialogOpen} onOpenChange={setEditWhatIOfferDialogOpen}>
        <DialogContent className="sm:max-w-[525px] max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit General Description</DialogTitle>
            <DialogDescription>
              Describe your overall professional services and expertise.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid w-full gap-1.5">
              <label htmlFor="whatIOffer" className="text-sm font-medium leading-none">
                Professional Offering Description
              </label>
              <textarea
                id="whatIOffer"
                placeholder="Describe the professional services you offer..."
                className="min-h-32 flex w-full rounded-md border border-input bg-slate-800/80 px-3 py-2 text-sm text-white shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                defaultValue={whatIOffer}
                onChange={(e) => setWhatIOffer(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">
                Describe your professional expertise, the kind of services you offer, and what clients can expect when working with you.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setEditWhatIOfferDialogOpen(false)}
                className="neo-glass-button bg-transparent hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={() => {
                  if (userNumericId) {
                    // Update the user profile with the new whatIOffer value
                    updateService({
                      id: 0, // Not used for this update, but required by the API
                      data: {
                        userId: userNumericId,
                        whatIOffer: whatIOffer
                      }
                    });
                    setEditWhatIOfferDialogOpen(false);
                    
                    // Force refresh after update
                    setTimeout(() => {
                      fetchServicesData();
                    }, 1000);
                  }
                }}
                disabled={isPendingUpdate}
                className="neo-glass-button flex items-center gap-2 py-2 px-4"
              >
                {isPendingUpdate ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this offering?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              offering and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="neo-glass-button bg-transparent hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isPendingDelete}
              className="neo-glass-button flex items-center gap-2 py-2 px-4 bg-destructive-foreground/20 hover:bg-destructive-foreground/30"
            >
              {isPendingDelete ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NeoGlassSection>
  );
}