import { useState, useContext } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, AlertCircle, Loader2, Phone } from "lucide-react";
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
import { PhoneInput } from "@/components/ui/phone-input";
import { AuthContext } from "@/context/auth-context";
import { useLocation } from "wouter";
import { MobileSignupForm } from "./mobile-signup-form";

// Phone validation schema
const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?[0-9]+$/, "Phone number must contain only digits"),
});

// OTP validation schema
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^[0-9]+$/, "OTP must contain only digits"),
});

export function PhoneAuth() {
  const authContext = useContext(AuthContext);
  const [_, setLocation] = useLocation();
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPhoneNumber, setCurrentPhoneNumber] = useState("");
  const [userData, setUserData] = useState<any>(null);

  // Phone number form
  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  // OTP form
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Handle phone number submission to request OTP
  const onPhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setOtpSent(true);
      setCurrentPhoneNumber(values.phoneNumber);
      setSuccessMessage(`OTP sent to ${values.phoneNumber}`);
      console.log("OTP for testing:", data.otp);
      
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP verification
  const onOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    try {
      setIsSubmitting(true);
      setError("");

      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: currentPhoneNumber,
          otp: values.otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      setSuccessMessage("Phone verified successfully");
      setOtpVerified(true);
      
      // Check if user is new or existing
      if (data.user) {
        if (data.isNewUser) {
          // For new users, show the signup form
          setUserData(data.user);
        } else {
          // For existing users, log in directly
          authContext.signInWithPhone(data.user);
          
          // Small delay to show success message before redirecting
          setTimeout(() => {
            setLocation("/dashboard");
          }, 1500);
        }
      }
      
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle mobile signup form submission
  const handleSignupComplete = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setError("");
      
      // Update the user with additional profile information
      const response = await fetch(`/api/users/${userData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phoneNumber: currentPhoneNumber,
          profileCompleted: 40, // Set higher completion percentage
        }),
      });
      
      const updatedUser = await response.json();
      
      if (!response.ok) {
        throw new Error("Failed to update user profile");
      }
      
      // Now sign in with the updated user data
      authContext.signInWithPhone(updatedUser);
      
      setSuccessMessage("Profile created successfully! Redirecting...");
      
      // Small delay to show success message before redirecting
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || "Failed to complete signup");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (otpVerified && userData) {
      return <MobileSignupForm 
        phoneNumber={currentPhoneNumber} 
        onComplete={handleSignupComplete} 
      />;
    }
    
    if (otpSent) {
      return (
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(onOtpSubmit)}
            className="space-y-4"
          >
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter OTP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      maxLength={6}
                      {...field}
                      disabled={isSubmitting}
                    />
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
                "Verify OTP"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full mt-2"
              onClick={() => setOtpSent(false)}
              disabled={isSubmitting}
            >
              Change Phone Number
            </Button>
          </form>
        </Form>
      );
    }
    
    return (
      <Form {...phoneForm}>
        <form
          onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
          className="space-y-4"
        >
          <FormField
            control={phoneForm.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Mobile number"
                    disabled={isSubmitting}
                  />
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
              "Send OTP"
            )}
          </Button>
        </form>
      </Form>
    );
  };

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Success</AlertTitle>
          <AlertDescription className="text-green-600">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {renderContent()}
    </div>
  );
}