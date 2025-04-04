import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Service } from "@shared/schema";

// Define the form schema with only required fields
const formSchema = z.object({
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: any) => void; // Use any to allow us to transform the data before submission
  isPending: boolean;
}

export default function ServiceForm({ service, onSubmit, isPending }: ServiceFormProps) {
  const [featureInput, setFeatureInput] = useState("");
  
  // Prepare default values for the form - only the required fields
  const defaultValues = {
    features: Array.isArray(service?.features) ? service.features : [],
    isActive: service?.isActive !== false,
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const handleAddFeature = () => {
    if (featureInput.trim() === "") return;
    
    const currentFeatures = form.getValues("features") || [];
    form.setValue("features", [...currentFeatures, featureInput.trim()]);
    setFeatureInput("");
  };
  
  const handleRemoveFeature = (index: number) => {
    const currentFeatures = form.getValues("features") || [];
    form.setValue(
      "features",
      currentFeatures.filter((_, i) => i !== index)
    );
  };
  
  const handleFeatureKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFeature();
    }
  };
  
  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    // Transform form values to match API expectations and preserve existing fields
    const transformedData = {
      // Keep existing service values if editing 
      ...(service || {}),
      // Add required title field if not present (backend requires it)
      title: service?.title || "My Professional Service",
      // Override with new values from the form
      ...values,
      // Keep or set default price fields (required by backend API)
      priceInr: service?.priceInr ?? null,
      priceUsd: service?.priceUsd ?? null,
      // Set default values for required fields in case they're not in the service object
      category: service?.category || "other", 
    };
    
    onSubmit(transformedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pb-2">
        
        <FormField
          control={form.control}
          name="features"
          render={() => (
            <FormItem>
              <FormLabel>Features</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a feature..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={handleFeatureKeyDown}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddFeature}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {form.watch("features")?.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <span>{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {form.watch("features")?.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No features added. Add features to highlight what's included.
                    </p>
                  )}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
        
        <Button type="submit" className="w-full" disabled={isPending}>
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