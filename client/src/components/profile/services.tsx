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
  Package 
} from "lucide-react";
import { useState } from "react";
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

export default function Services() {
  const { user } = useAuth();
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
          <CardTitle className="text-xl font-bold">My Services</CardTitle>
          <CardDescription>Showcase your professional services with pricing and features</CardDescription>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>
                Add a new service you offer to clients.
              </DialogDescription>
            </DialogHeader>
            <ServiceForm 
              onSubmit={handleCreate} 
              isPending={isPendingCreate} 
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
    
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : services.length === 0 ? (
          <div className="py-6 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">No services added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <div key={service.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between mb-2">
                  <Badge className="mb-1">
                    {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => {
                        setSelectedService(service);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => {
                        setSelectedService(service);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-medium mb-1">{service.title}</h3>
                
                <div className="flex items-center mb-2">
                  {service.priceInr !== null && (
                    <span className="font-bold text-primary text-lg">
                      {formatCurrency(Number(service.priceInr), 'INR')}
                      {service.isHourly && <span className="text-sm font-normal text-muted-foreground ml-1">/hr</span>}
                    </span>
                  )}
                  {service.priceUsd !== null && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({formatCurrency(Number(service.priceUsd), 'USD')}
                      {service.isHourly && <span>/hr</span>})
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {service.description}
                </p>
                
                {Array.isArray(service.features) && service.features.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium">Features:</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1 list-disc pl-4">
                      {service.features.slice(0, 3).map((feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-primary">+{service.features.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t">
                  <Button size="sm" className="w-full gap-1 text-xs">
                    <ShoppingCart className="h-3 w-3" />
                    <span>Request Service</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update your service details.
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <ServiceForm 
              service={selectedService}
              onSubmit={handleUpdate} 
              isPending={isPendingUpdate}
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
              Are you sure you want to delete this service?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              service and remove it from our servers.
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