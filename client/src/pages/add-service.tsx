import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { NeoGlassLayout, NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { ArrowLeft, Sparkles, Target, Zap } from "lucide-react";

const serviceFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  category: z.enum([
    "consulting",
    "development", 
    "design",
    "marketing",
    "writing",
    "coaching",
    "teaching",
    "other"
  ]),
  description: z.string().min(10, "Description must be at least 10 characters"),
  pricing: z.string().min(1, "Pricing is required"),
  duration: z.string().min(1, "Duration is required"),
  deliverables: z.string().min(10, "Deliverables must be at least 10 characters"),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

export default function AddService() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: "",
      category: "development",
      description: "",
      pricing: "",
      duration: "",
      deliverables: "",
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const res = await apiRequest("POST", "/api/services", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your service has been created successfully.",
      });
      setLocation("/services");
    },
    onError: () => {
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
    <div className="bg-gradient-to-b from-gray-900 to-black w-full min-h-screen">
      <Header />
      <div className="container max-w-7xl mx-auto pt-24 pb-10 px-4 relative">
        <NeoGlassLayout>
          <div className="p-4 md:p-6">
            <div className="flex-1 max-w-4xl">
              {/* Header Section matching Smart Radar */}
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Add New Service</h1>
              
              <div className="mb-6">
                <button 
                  onClick={() => setLocation("/services")}
                  className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border border-white/20 shadow-md transition-all hover:border-white/30 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Services</span>
                </button>
              </div>

              {/* Main Form */}
              <NeoGlassSection>
                <div className="px-4 py-2">
                  <h3 className="text-xl font-semibold mb-3 text-white">Service Details</h3>
                  <p className="text-white/70 mb-6">Fill in the information about your service offering</p>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Service Title */}
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-semibold">Service Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Custom Web Development"
                                {...field}
                                className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category and Duration Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white font-semibold">Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30">
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
                              <FormLabel className="text-white font-semibold">Duration</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., 2-4 weeks"
                                  {...field}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 backdrop-blur-sm"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Description */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-semibold">Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your service in detail..."
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 backdrop-blur-sm min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Pricing */}
                      <FormField
                        control={form.control}
                        name="pricing"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white font-semibold">Pricing</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., $50/hour or $2,000 fixed price"
                                {...field}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 backdrop-blur-sm"
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
                            <FormLabel className="text-white font-semibold">Deliverables</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="What will the client receive? List specific deliverables..."
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 backdrop-blur-sm min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-4 pt-6">
                        <button
                          type="button"
                          onClick={() => setLocation("/services")}
                          className="neo-glass-button-secondary flex items-center gap-2 py-2 px-4"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={createServiceMutation.isPending}
                          className="neo-glass-button flex items-center gap-2 py-2 px-6"
                        >
                          {createServiceMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating...
                            </>
                          ) : (
                            "Create Service"
                          )}
                        </button>
                      </div>
                    </form>
                  </Form>
                </div>
              </NeoGlassSection>

              {/* Features Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <NeoGlassSection>
                  <div className="p-2 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 border border-purple-400/30 rounded-full mb-4">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Professional Showcase</h3>
                    <p className="text-sm text-white/70">
                      Present your services in a professional and attractive format
                    </p>
                  </div>
                </NeoGlassSection>

                <NeoGlassSection>
                  <div className="p-2 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-500/20 border border-pink-400/30 rounded-full mb-4">
                      <Target className="w-6 h-6 text-pink-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Attract Clients</h3>
                    <p className="text-sm text-white/70">
                      Clear service descriptions help potential clients understand your offerings
                    </p>
                  </div>
                </NeoGlassSection>

                <NeoGlassSection>
                  <div className="p-2 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500/20 border border-orange-400/30 rounded-full mb-4">
                      <Zap className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">Easy Management</h3>
                    <p className="text-sm text-white/70">
                      Organize and manage all your services in one convenient location
                    </p>
                  </div>
                </NeoGlassSection>
              </div>
            </div>
          </NeoGlassLayout>
        </div>
      </div>
    </div>
  );
}