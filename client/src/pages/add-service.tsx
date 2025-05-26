import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Plus, Briefcase, DollarSign, Clock, User, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Header } from "@/components/header";
import { NeoGlassLayout, NeoGlassSection } from "@/components/ui/neo-glass-layout";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { z } from "zod";
import { cn } from "@/lib/utils";

const serviceFormSchema = z.object({
  title: z.string().min(1, "Service title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["consulting", "development", "design", "marketing", "writing", "coaching", "teaching", "other"]),
  pricing: z.string().min(1, "Pricing information is required"),
  duration: z.string().min(1, "Duration is required"),
  location: z.string().optional(),
  deliverables: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

const serviceCategories = [
  { value: "consulting", label: "Consulting", icon: Briefcase },
  { value: "development", label: "Development", icon: User },
  { value: "design", label: "Design", icon: User },
  { value: "marketing", label: "Marketing", icon: User },
  { value: "writing", label: "Writing", icon: User },
  { value: "coaching", label: "Coaching", icon: User },
  { value: "teaching", label: "Teaching", icon: User },
  { value: "other", label: "Other", icon: User },
];

export default function AddService() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "consulting",
      pricing: "",
      duration: "",
      location: "",
      deliverables: "",
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      return apiRequest(`/api/users/${user?.uid}/services`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Service Created",
        description: "Your service has been successfully created!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.uid}/services`] });
      setLocation("/profile");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    createServiceMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[url('/bg-dark-room.jpg')] bg-cover bg-center">
      <div className="min-h-screen bg-black/50 backdrop-blur-sm">
        <Header />
        <div className="container mx-auto p-4 pt-16">
          <div className="flex items-center mb-4">
            <Link to="/profile" className="text-white hover:text-white/80 flex items-center">
              <ChevronLeft className="h-5 w-5 mr-1" />
              <span>Back to Profile</span>
            </Link>
          </div>
          
          <NeoGlassLayout>
            <div className="w-full">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Add New Service</h1>
                <p className="text-white/70">Create a new service offering to share with your professional network</p>
              </div>
              
              {/* Service Category Selection */}
              <NeoGlassSection className="mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Choose Service Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {serviceCategories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <Card 
                        key={category.value}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md bg-[rgba(18,18,18,0.95)] text-white border-white/20",
                          selectedCategory === category.value ? 'ring-2 ring-white/40' : ''
                        )}
                        onClick={() => {
                          setSelectedCategory(category.value);
                          form.setValue('category', category.value as any);
                        }}
                      >
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                          <IconComponent className={cn(
                            "h-8 w-8 mb-2",
                            selectedCategory === category.value ? 'text-white' : 'text-white/60'
                          )} />
                          <span className="text-sm font-medium">{category.label}</span>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </NeoGlassSection>

              {/* Service Details Form */}
              <NeoGlassSection>
                <h2 className="text-lg font-semibold text-white mb-4">Service Details</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Service Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Service Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Full-Stack Web Development"
                              className="bg-[rgba(18,18,18,0.95)] border-white/20 text-white placeholder:text-white/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your service in detail..."
                              className="bg-[rgba(18,18,18,0.95)] border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Pricing and Duration Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="pricing"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Pricing
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., $50/hour or $500 fixed"
                                className="bg-[rgba(18,18,18,0.95)] border-white/20 text-white placeholder:text-white/50"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Duration
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., 2-3 weeks"
                                className="bg-[rgba(18,18,18,0.95)] border-white/20 text-white placeholder:text-white/50"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Location */}
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Location (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Remote, New York, or Worldwide"
                              className="bg-[rgba(18,18,18,0.95)] border-white/20 text-white placeholder:text-white/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Deliverables */}
                    <FormField
                      control={form.control}
                      name="deliverables"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Deliverables (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="What will you deliver? e.g., Complete website, source code, documentation..."
                              className="bg-[rgba(18,18,18,0.95)] border-white/20 text-white placeholder:text-white/50"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation("/profile")}
                        className="bg-transparent border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createServiceMutation.isPending}
                        className="neo-glass-button flex items-center gap-2"
                      >
                        {createServiceMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Create Service
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </NeoGlassSection>
            </div>
          </NeoGlassLayout>
        </div>
      </div>
    </div>
  );
}