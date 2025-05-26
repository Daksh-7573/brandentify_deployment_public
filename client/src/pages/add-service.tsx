import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Sparkles, Zap, Target, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Header from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { cn } from "@/lib/utils";

const serviceFormSchema = z.object({
  title: z.string().min(1, "Service title is required"),
  category: z.enum(["consulting", "development", "design", "marketing", "writing", "coaching", "teaching", "other"]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pricing: z.string().min(1, "Pricing information is required"),
  duration: z.string().min(1, "Duration is required"),
  deliverables: z.string().min(1, "Deliverables are required"),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

export default function AddService() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: "",
      category: "consulting",
      description: "",
      pricing: "",
      duration: "",
      deliverables: "",
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      return apiRequest("/api/services", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          userId: user?.uid,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Service Created",
        description: "Your service has been successfully created!",
      });
      form.reset();
      setLocation("/services");
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4 text-purple-600 hover:text-purple-700"
              onClick={() => setLocation("/services")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Add New Service
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Create a professional service offering to showcase your expertise and attract clients
              </p>
            </div>
          </div>

          {/* Main Form */}
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-800">Service Details</CardTitle>
              <CardDescription>
                Fill in the information about your service offering
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-gray-700 font-semibold">Service Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Full-Stack Web Development"
                              {...field}
                              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-200 focus:border-purple-500">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="consulting">Consulting</SelectItem>
                              <SelectItem value="development">Development</SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="writing">Writing</SelectItem>
                              <SelectItem value="coaching">Coaching</SelectItem>
                              <SelectItem value="teaching">Teaching</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold">Duration</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 2-4 weeks"
                              {...field}
                              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your service in detail..."
                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">Pricing</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., $50/hour or $2,000 fixed price"
                            {...field}
                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliverables"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold">Deliverables</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What will the client receive? List specific deliverables..."
                            className="border-gray-200 focus:border-purple-500 focus:ring-purple-500 min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/services")}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createServiceMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                    >
                      {createServiceMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Service
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Professional Showcase</h3>
                <p className="text-sm text-gray-600">
                  Present your services in a professional and attractive format
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mb-4">
                  <Target className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Attract Clients</h3>
                <p className="text-sm text-gray-600">
                  Clear service descriptions help potential clients understand your offerings
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Easy Management</h3>
                <p className="text-sm text-gray-600">
                  Organize and manage all your services in one convenient location
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}