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
import { Loader2, PlusCircle, Edit, Trash2, ShoppingCart } from "lucide-react";
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
// Removed Sidebar import, using top navigation only
import Header from "@/components/layout/header";
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

export default function ServicesPage() {
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
  
  const formatCurrency = (amount: number | string | null, currency: 'INR' | 'USD') => {
    if (amount === null) return '';
    
    // Convert string to number if needed
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericAmount);
  };
  
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Added padding-top for fixed header */}
        
        <div className="flex-1 overflow-auto">
          <div className="container p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">My Services</h1>
                <p className="text-muted-foreground">
                  Showcase your professional services with pricing and features
                </p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1">
                    <PlusCircle size={16} />
                    <span>Add Service</span>
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
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center p-12 border rounded-lg border-dashed">
                <h3 className="text-xl font-medium mb-2">No services added yet</h3>
                <p className="text-muted-foreground mb-6">
                  Showcase your professional services to potential clients.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="gap-1"
                >
                  <PlusCircle size={16} />
                  <span>Create Your First Service</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id} className="overflow-hidden flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <Badge className="mb-2">
                          {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                        </Badge>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedService(service);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedService(service);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                      <CardTitle>{service.title}</CardTitle>
                      {service.priceInr !== null && (
                        <div className="flex items-center mt-2">
                          <span className="text-2xl font-bold">
                            {formatCurrency(service.priceInr, 'INR')}
                          </span>
                          {service.isHourly && <span className="ml-1 text-muted-foreground">/hr</span>}
                        </div>
                      )}
                      {service.priceUsd !== null && (
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(service.priceUsd, 'USD')}
                          {service.isHourly && <span>/hr</span>}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription className="mb-4">
                        {service.description}
                      </CardDescription>
                      {service.features && Array.isArray(service.features) && service.features.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold mb-2">Features:</h4>
                          <ul className="list-disc pl-5 text-sm space-y-1">
                            {service.features.map((feature: string, index: number) => (
                              <li key={index}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-4 border-t bg-muted/40">
                      <Button className="w-full gap-2">
                        <ShoppingCart size={16} />
                        <span>Request Service</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

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
          </div>
        </div>
      </div>
    </div>
  );
}