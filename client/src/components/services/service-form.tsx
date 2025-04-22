import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Service } from "@shared/schema";

// Define the form schema with all relevant fields
const formSchema = z.object({
  title: z.string().min(1, "Service title is required"),
  description: z.string().optional(),
  currency: z.string().default("USD"),
  price: z.string().nullable().optional(),
  isHourly: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: any) => void; // Use any to allow us to transform the data before submission
  isPending: boolean;
  existingServicesCount?: number;
}

export default function ServiceForm({ service, onSubmit, isPending, existingServicesCount = 0 }: ServiceFormProps) {
  // Maximum allowed services (6)
  const MAX_SERVICES = 6;
  const isEditing = !!service;
  const canAddService = isEditing || existingServicesCount < MAX_SERVICES;
  
  // Prepare default values for all form fields
  const defaultValues = {
    title: service?.title || "",
    description: service?.description || "",
    currency: service ? (service.priceUsd ? "USD" : "INR") : "USD",
    price: service ? (service.priceUsd ? service.priceUsd.toString() : 
                      service.priceInr ? service.priceInr.toString() : null) : null,
    isHourly: service?.isHourly || false,
    isActive: service?.isActive !== false,
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    // Convert price string to number (avoid NaN issues)
    const priceValue = values.price ? (parseFloat(values.price) || 0) : null;
    
    // Log for debugging
    console.log(`Service form - submitting with currency: ${values.currency}, price: ${priceValue}`);
    
    // Set all currency fields to null initially
    const priceData = {
      priceInr: null as number | null,
      priceUsd: null as number | null,
      priceEur: null as number | null,
      priceGbp: null as number | null,
      priceJpy: null as number | null,
      priceCad: null as number | null,
      priceAud: null as number | null
    };
    
    // Set only the appropriate currency price field
    if (priceValue !== null) {
      switch (values.currency) {
        case 'INR':
          priceData.priceInr = priceValue;
          break;
        case 'USD':
          priceData.priceUsd = priceValue;
          break;
        case 'EUR':
          priceData.priceEur = priceValue;
          break;
        case 'GBP':
          priceData.priceGbp = priceValue;
          break;
        case 'JPY':
          priceData.priceJpy = priceValue;
          break;
        case 'CAD':
          priceData.priceCad = priceValue;
          break;
        case 'AUD':
          priceData.priceAud = priceValue;
          break;
        default:
          // Default to USD if something goes wrong
          priceData.priceUsd = priceValue;
      }
    }
    
    // Transform form values to match API expectations
    const transformedData = {
      // Start with default values for all required fields
      features: [],
      // Add base form values
      title: values.title,
      description: values.description,
      isHourly: values.isHourly,
      isActive: values.isActive,
      // Set category to "other" since we're removing it from the form
      category: "other",
      // Add all pricing fields
      ...priceData,
      // Then add any existing service values for fields we didn't explicitly set
      ...(service ? (({ id, userId }) => ({ id, userId }))(service) : {})
    };
    
    console.log("Service form - submitting transformed data:", transformedData);
    onSubmit(transformedData);
  };

  // If we can't add more services and we're not editing an existing one, show a message
  if (!canAddService && !isEditing) {
    return (
      <div className="p-4 text-center border rounded-md">
        <p className="text-amber-600 font-medium">Maximum of 6 services reached</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Please delete an existing service before adding a new one.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pb-2">
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Title*</FormLabel>
              <FormDescription className="text-xs mb-2">
                Enter a single professional service you offer.
              </FormDescription>
              <FormControl>
                <Input
                  placeholder="Enter your service title..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormDescription className="text-xs mb-2">
                Enter a brief description of your service.
              </FormDescription>
              <FormControl>
                <textarea
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe your service..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Rate Fields */}
        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="text-base font-medium">Pricing Details</h3>
          
          {/* Currency Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="USD">USD (US Dollar)</option>
                        <option value="INR">INR (Indian Rupee)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="GBP">GBP (British Pound)</option>
                        <option value="JPY">JPY (Japanese Yen)</option>
                        <option value="CAD">CAD (Canadian Dollar)</option>
                        <option value="AUD">AUD (Australian Dollar)</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter service price"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          {/* Rate Type */}
          <FormField
            control={form.control}
            name="isHourly"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Hourly Rate</FormLabel>
                  <FormDescription className="text-xs">
                    Toggle on if you charge per hour, off for fixed rate
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription className="text-xs">
                  Is this service currently available?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-white shadow-sm" 
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {service ? "Updating..." : "Creating..."}
            </>
          ) : (
            service ? "Update Service" : "Create Service"
          )}
        </Button>
      </form>
    </Form>
  );
}