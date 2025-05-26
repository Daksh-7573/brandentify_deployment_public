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
import { CustomSelect } from "@/components/ui/custom-select";

import { Service } from "@shared/schema";

// Define the form schema with all relevant fields
const formSchema = z.object({
  title: z.string().min(1, "Service title is required"),
  description: z.string().optional(),
  currency: z.string().default("USD"),
  // Handle price input more robustly - accept string or number, transform to number
  price: z.union([
    z.string().transform(val => {
      if (!val || val === '') return null;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    }),
    z.number(),
    z.null()
  ]).nullable().optional(),
  isHourly: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  service?: Service;
  initialData?: Service | null;
  onSubmit: (data: any) => void; // Use any to allow us to transform the data before submission
  isPending: boolean;
  existingServicesCount?: number;
}

export default function ServiceForm({ service, initialData, onSubmit, isPending, existingServicesCount = 0 }: ServiceFormProps) {
  // Use initialData if provided, otherwise fall back to service
  const serviceData = initialData || service;
  // Maximum allowed services (6)
  const MAX_SERVICES = 6;
  const isEditing = !!serviceData;
  const canAddService = isEditing || existingServicesCount < MAX_SERVICES;
  
  // Prepare default values for all form fields
  const defaultValues = {
    title: serviceData?.title || "",
    description: serviceData?.description || "",
    currency: serviceData ? (serviceData.priceUsd ? "USD" : "INR") : "USD",
    // Convert string price to numeric for form schema compatibility
    price: serviceData ? (serviceData.priceUsd ? parseFloat(serviceData.priceUsd.toString()) : 
                      serviceData.priceInr ? parseFloat(serviceData.priceInr.toString()) : null) : null,
    isHourly: serviceData?.isHourly || false,
    isActive: serviceData?.isActive !== false,
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    // The price value should already be a number from the form schema validation
    // but we'll ensure it's either a proper number or null
    let priceValue: number | null = null;
    
    if (values.price !== undefined && values.price !== null) {
      if (typeof values.price === 'string') {
        // If it's a string (which it shouldn't be, but just in case), parse it
        const parsed = parseFloat(values.price);
        priceValue = isNaN(parsed) ? null : parsed;
        console.log("Service form - converted string price to number:", values.price, "→", priceValue);
      } else if (typeof values.price === 'number') {
        // It's already a number, which is what we want
        priceValue = Number.isFinite(values.price) ? values.price : null;
        console.log("Service form - using numeric price:", priceValue);
      } else {
        console.log("Service form - unexpected price type:", typeof values.price);
      }
    } else {
      console.log("Service form - price is undefined or null");
    }
    
    // Log for debugging
    console.log(`Service form - submitting with currency: ${values.currency}, price: ${priceValue}, price type: ${typeof priceValue}`);
    
    // Set only the required price fields to match our database schema
    // Strip decimal values to avoid potential database issues
    const priceData: {priceInr: number | null, priceUsd: number | null} = {
      priceInr: null,
      priceUsd: null
    };
    
    // Set only the appropriate currency price field - Only USD and INR are supported in the DB
    if (priceValue !== null && Number.isFinite(priceValue)) {
      // Round to 2 decimal places to ensure clean database values
      const roundedPrice = Math.round(priceValue * 100) / 100;
      
      switch (values.currency) {
        case 'INR':
          priceData.priceInr = roundedPrice;
          console.log("Service form - setting INR price:", roundedPrice);
          break;
        case 'USD':
        default:
          // Default to USD for all other currencies as the database only supports INR and USD
          priceData.priceUsd = roundedPrice;
          console.log("Service form - setting USD price:", roundedPrice);
          break;
      }
    } else {
      console.log("Service form - not setting any price due to invalid value");
    }
    
    // Log price data for debugging
    console.log("Service form - final price data:", JSON.stringify(priceData));
    
    // Transform form values to match API expectations
    const transformedData = {
      // Start with default values for all required fields
      features: [],
      // Add base form values
      title: values.title,
      description: values.description,
      isHourly: values.isHourly,
      isActive: values.isActive,
      // Set hardcoded category to "other" - this is required by the database
      category: "other",
      // Add all pricing fields
      ...priceData,
      // Then add any existing service values for fields we didn't explicitly set
      ...(serviceData ? (({ id, userId }) => ({ id, userId }))(serviceData) : {})
    };
    
    // If we don't have userId from an existing service, add it from auth context
    if (!transformedData.userId) {
      const firebaseUid = localStorage.getItem('firebaseUid');
      const numericUserId = localStorage.getItem('numericUserId');
      
      // Log details about what userId we're using
      console.log("Service form - user ID details:", { 
        firebaseUid,
        numericUserId,
        hasExistingUserId: !!service?.userId
      });
      
      // Prefer numeric user ID if available
      if (numericUserId) {
        transformedData.userId = parseInt(numericUserId, 10);
      } else if (firebaseUid) {
        // The Firebase UID can be used as a string, but we need to properly handle it
        // in the API endpoint since Drizzle expects a numeric ID
        transformedData.userId = firebaseUid as unknown as number;
      }
      
      console.log("Service form - setting userId to:", transformedData.userId);
    }
    
    // Make sure we have a userId
    if (!transformedData.userId) {
      console.error("Service form - no userId available for service creation!");
    }
    
    console.log("Service form - submitting final transformed data:", transformedData);
    onSubmit(transformedData);
  };

  // If we can't add more services and we're not editing an existing one, show a message
  if (!canAddService && !isEditing) {
    return (
      <div className="neo-glass-container p-6 text-center border border-white/20 bg-black/30 backdrop-blur-md shadow-neo rounded-lg">
        <p className="text-white font-medium text-lg mb-3">Maximum Services Reached</p>
        <p className="text-white/70 text-sm">
          You can have up to 6 services. Please delete an existing service before adding a new one.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="neo-glass-container max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 p-6 my-4 border border-white/20 bg-black/30 backdrop-blur-md shadow-neo">
        <h3 className="font-bold text-white mb-6 text-center text-xl">
          {serviceData ? "Update Service" : "Add New Service"}
        </h3>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-base font-medium">Service Title*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your service title..."
                    className="neo-glass-input bg-white/5 border-white/10 backdrop-blur-sm focus:ring-white/20 focus:border-white/30 text-white placeholder:text-white/50 transition-all"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-white/70 text-xs mt-1">
                  Enter a single professional service you offer.
                </FormDescription>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-base font-medium">Description</FormLabel>
                <FormControl>
                  <textarea
                    className="neo-glass-input flex w-full rounded-md border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-2 text-white ring-offset-background placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:border-white/30 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe your service..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-white/70 text-xs mt-1">
                  Enter a brief description of your service.
                </FormDescription>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        

        
          {/* Pricing Section */}
          <div className="neo-glass-section border border-white/10 bg-white/5 backdrop-blur-sm rounded-lg p-5 space-y-4">
            <h3 className="text-white text-lg font-medium mb-4">Pricing Details</h3>
            
            {/* Currency Selection */}
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-base font-medium">Currency*</FormLabel>
                  <FormControl>
                    <CustomSelect 
                      value={field.value} 
                      onValueChange={field.onChange}
                      options={[
                        { value: 'USD', label: 'USD (US Dollar)' },
                        { value: 'INR', label: 'INR (Indian Rupee)' }
                      ]}
                      className="neo-glass-select bg-white/5 border-white/10 text-white backdrop-blur-sm hover:bg-white/10 transition-all"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white text-base font-medium">Rate Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter service price (e.g. 24.99)"
                      className="neo-glass-input bg-white/5 border-white/10 backdrop-blur-sm focus:ring-white/20 focus:border-white/30 text-white placeholder:text-white/50 transition-all"
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        if (rawValue === '') {
                          field.onChange(null);
                          return;
                        }
                        if (/^[0-9]*\.?[0-9]*$/.test(rawValue)) {
                          const numValue = parseFloat(rawValue);
                          if (!isNaN(numValue) || /^\d*\.$/.test(rawValue)) {
                            field.onChange(rawValue);
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>
          
          {/* Rate Type */}
          <FormField
            control={form.control}
            name="isHourly"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm p-4 transition-all hover:bg-white/5 hover:border-white/20">
                <div className="space-y-0.5">
                  <FormLabel className="text-white text-base font-medium">Hourly Rate</FormLabel>
                  <FormDescription className="text-white/70 text-xs">
                    Toggle on if you charge per hour, off for fixed rate
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="neo-glass-switch data-[state=checked]:bg-white/20 data-[state=checked]:border-white/30 border-white/20 bg-black/50"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 bg-black/30 backdrop-blur-sm p-4 transition-all hover:bg-white/5 hover:border-white/20">
                <div className="space-y-0.5">
                  <FormLabel className="text-white text-base font-medium">Active Status</FormLabel>
                  <FormDescription className="text-white/70 text-xs">
                    Is this service currently available?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="neo-glass-switch data-[state=checked]:bg-white/20 data-[state=checked]:border-white/30 border-white/20 bg-black/50"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="neo-glass-button w-full flex items-center justify-center gap-2 py-3 px-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-neo font-medium" 
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{serviceData ? "Updating..." : "Creating..."}</span>
              </>
            ) : (
              <span>{serviceData ? "Update Service" : "Create Service"}</span>
            )}
          </Button>
        </form>
      </div>
    </Form>
  );
}