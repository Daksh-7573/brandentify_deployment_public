import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Service {
  id: number;
  title: string;
  description: string | null;
  category: string;
  priceInr: number | null;
  priceUsd: number | null;
  isHourly: boolean;
  isActive: boolean;
}

export default function ServicesManager({ userId }: { userId: number }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}/services`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }
        
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
        toast({
          title: "Error",
          description: "Failed to load services. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [userId, toast]);

  // Toggle service active status
  const toggleServiceActive = async (serviceId: number) => {
    try {
      setActionInProgress(serviceId);
      
      const response = await fetch(`/api/services/${serviceId}/toggle-active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to toggle service status");
      }
      
      const updatedService = await response.json();
      
      // Update the services state
      setServices(services.map(service => 
        service.id === serviceId ? updatedService : service
      ));
      
      toast({
        title: "Success",
        description: `Service ${updatedService.isActive ? "activated" : "deactivated"} successfully.`,
      });
    } catch (error) {
      console.error("Error toggling service:", error);
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };
  
  // Delete service
  const deleteService = async (serviceId: number) => {
    try {
      if (!window.confirm('Are you sure you want to delete this service?')) {
        return;
      }
      
      setActionInProgress(serviceId);
      
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete service");
      }
      
      // Update the services state
      setServices(services.filter(service => service.id !== serviceId));
      
      toast({
        title: "Success",
        description: "Service deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Format price
  const formatPrice = (price: number | null, isHourly: boolean) => {
    if (price === null) return "Price on request";
    return `$${price}${isHourly ? "/hr" : ""}`;
  };

  // Format category
  const formatCategory = (category: string) => {
    // Replace "other" with a more descriptive category if needed
    if (category.toLowerCase() === "other") {
      return "Custom Service";
    }
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Your Services</CardTitle>
        <CardDescription>
          Toggle services to control their visibility to potential clients
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You haven't added any services yet.</p>
          </div>
        ) : (
          <Table>
            <TableCaption>List of your professional services</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id} className={!service.isActive ? "opacity-60" : ""}>
                  <TableCell className="font-medium">
                    <div>
                      {service.title}
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatCategory(service.category)}</Badge>
                  </TableCell>
                  <TableCell>
                    {formatPrice(service.priceUsd, service.isHourly)}
                  </TableCell>
                  <TableCell>
                    {service.isActive ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Switch
                        checked={service.isActive}
                        disabled={actionInProgress === service.id}
                        onCheckedChange={() => toggleServiceActive(service.id)}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteService(service.id)}
                        disabled={actionInProgress === service.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" x2="10" y1="11" y2="17"></line>
                          <line x1="14" x2="14" y1="11" y2="17"></line>
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Add New Service</Button>
      </CardFooter>
    </Card>
  );
}