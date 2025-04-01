import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mobile signup schema
const mobileSignupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .optional(),
  title: z
    .string()
    .min(2, "Job title must be at least 2 characters")
    .optional(),
});

type MobileSignupFormProps = {
  phoneNumber: string;
  onComplete: (userData: z.infer<typeof mobileSignupSchema>) => void;
};

export function MobileSignupForm({ phoneNumber, onComplete }: MobileSignupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Mobile signup form
  const form = useForm<z.infer<typeof mobileSignupSchema>>({
    resolver: zodResolver(mobileSignupSchema),
    defaultValues: {
      name: "",
      email: "",
      location: "",
      title: "",
    },
  });

  // Handle signup form submission
  const onSubmit = async (values: z.infer<typeof mobileSignupSchema>) => {
    try {
      setIsSubmitting(true);
      setError("");
      
      // Call the onComplete callback with the form data
      onComplete(values);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-center">Complete Your Profile</h3>
      <p className="text-sm text-muted-foreground text-center">
        Your phone number <span className="font-medium">{phoneNumber}</span> has been verified.
        Please complete your profile to continue.
      </p>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name*</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email*</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="Software Engineer" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="San Francisco, CA" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Complete Signup"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}