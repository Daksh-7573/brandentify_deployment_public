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
    // Convert string price to numeric for form schema compatibility
    price: service ? (service.priceUsd ? parseFloat(service.priceUsd.toString()) : 
                      service.priceInr ? parseFloat(service.priceInr.toString()) : null) : null,
    isHourly: service?.isHourly || false,
    isActive: service?.isActive !== false,
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
      ...(service ? (({ id, userId }) => ({ id, userId }))(service) : {})
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
                      <div className="w-full">
                        <CustomSelect 
                          value={field.value} 
                          onValueChange={field.onChange}
                          options={[
                            { value: 'USD', label: 'USD (US Dollar)' },
                            { value: 'INR', label: 'INR (Indian Rupee)' }
                          ]}
                        />
                      </div>
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
                        placeholder="Enter service price (e.g. 24.99)"
                        value={field.value === null ? '' : field.value}
                        onChange={(e) => {
                          // Accept the raw input value for display
                          const rawValue = e.target.value;
                          
                          // Only proceed with validation if there's input
                          if (rawValue === '') {
                            field.onChange(null);
                            return;
                          }
                          
                          // Allow numbers and a single decimal point
                          if (/^[0-9]*\.?[0-9]*$/.test(rawValue)) {
                            // Convert to number if it's a valid decimal
                            const numValue = parseFloat(rawValue);
                            
                            // Only update if it's a valid number or if it's a partial decimal (like "10." or ".")
                            if (!isNaN(numValue) || /^\d*\.$/.test(rawValue)) {
                              console.log("Price input changed:", rawValue);
                              field.onChange(rawValue);
                            }
                          }
                        }}
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
          className="neo-glass-button w-full flex items-center justify-center gap-2 py-2 px-4" 
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{service ? "Updating..." : "Creating..."}</span>
            </>
          ) : (
            <span>{service ? "Update Service" : "Create Service"}</span>
          )}
        </Button>
      </form>
    </Form>
  );
}