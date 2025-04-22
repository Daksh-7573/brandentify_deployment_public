import { useServices } from "@/hooks/use-services";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
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
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function Services() {
  const { user } = useAuth();
  const userNumericId = user?.id ? Number(user.id) : undefined;
  
  const { 
    services, 
    isLoading, 
    createService, 
    updateService, 
    deleteService, 
    isPendingCreate,
    isPendingUpdate,
    isPendingDelete
  } = useServices();
  
  // Special query to get whatIOffer with our dedicated endpoint with extra cache-busting
  const { data: whatIOffer, isLoading: isLoadingWhatIOffer } = useQuery({
    queryKey: ['/api/users', userNumericId, 'what-i-offer', Date.now()], // Use timestamp to bust cache
    queryFn: async () => {
      if (!userNumericId) return null;
      
      console.log("Fetching whatIOffer field with dedicated endpoint in services component");
      try {
        // Generate a cache-busting parameter
        const cacheBuster = `?t=${Date.now()}`;
        
        // Use our dedicated endpoint to get just the whatIOffer field with cacheBuster
        const response = await fetch(`/api/users/${userNumericId}/what-i-offer${cacheBuster}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Services component: Fetched whatIOffer with dedicated endpoint:", data);
          
          // Store in localStorage as backup with timestamp
          if (data && data.whatIOffer) {
            localStorage.setItem('whatIOffer_data', JSON.stringify(data));
            localStorage.setItem('whatIOffer_fetchedAt', Date.now().toString());
          }
          
          return data;
        } else {
          console.error("Services component: Dedicated whatIOffer endpoint failed:", response.status);
          
          // Try to recover from localStorage
          const savedData = localStorage.getItem('whatIOffer_data');
          if (savedData) {
            console.log("Services component: Using cached whatIOffer data from localStorage");
            return JSON.parse(savedData);
          }
          
          return null;
        }
      } catch (error) {
        console.error("Services component: Error fetching whatIOffer with dedicated endpoint:", error);
        return null;
      }
    },
    enabled: !!userNumericId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always"
  });
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const handleCreate = (formData: any) => {
    if (!user?.id) return;
    
    createService({
      ...formData,
      userId: user.id
    });
    setIsCreateDialogOpen(false);
  };
  
  const handleUpdate = (formData: any) => {
    if (!selectedService) return;
    
    updateService({
      id: selectedService.id,
      data: formData
    });
    setIsEditDialogOpen(false);
  };
  
  const handleDelete = () => {
    if (!selectedService) return;
    
    deleteService(selectedService.id);
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
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold">What I Offer</CardTitle>
          <CardDescription>List professional services you provide (max 6)</CardDescription>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          {/* Add button removed - using central Edit Profile functionality */}
          <DialogContent className="sm:max-w-[525px] max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add What You Offer</DialogTitle>
              <DialogDescription>
                Enter a single service you offer professionally (one at a time).
              </DialogDescription>
            </DialogHeader>
            <ServiceForm 
              onSubmit={handleCreate} 
              isPending={isPendingCreate}
              existingServicesCount={services.length}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
    
      <CardContent>
        {/* Special "What I Offer" Statement Section */}
        {whatIOffer && whatIOffer.whatIOffer && (
          <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start space-x-2">
              <Quote className="h-6 w-6 text-primary/70 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-primary-foreground mb-2">My Professional Offering</h3>
                <p className="text-gray-700">{whatIOffer.whatIOffer}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Specific Services List */}
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-4">Specific Services</h3>
          
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !Array.isArray(services) || services.length === 0 ? (
            <div className="py-6 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No specific services added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {services.map((service) => (
                <div 
                  key={service.id} 
                  className="border bg-background rounded-lg p-4 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-base line-clamp-2 flex-1">{service.title}</h3>
                    <div className="flex items-center space-x-1 ml-2">
                      <button 
                        className="text-muted-foreground hover:text-primary focus:outline-none rounded-full p-1 hover:bg-muted"
                        onClick={() => {
                          setSelectedService(service);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        className="text-muted-foreground hover:text-destructive focus:outline-none rounded-full p-1 hover:bg-muted"
                        onClick={() => {
                          setSelectedService(service);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center">
                    <Badge variant="outline" className={service.isActive ? 'bg-primary/10 text-primary border-primary/30' : 'bg-muted'}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px] max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit What You Offer</DialogTitle>
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isPendingDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPendingDelete ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}