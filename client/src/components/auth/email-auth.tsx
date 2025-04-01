import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { useLocation } from "wouter";
import { Check, AlertCircle, Loader2, Mail, Eye, EyeOff } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Login schema
const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

// Registration schema
const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function EmailAuth() {
  const authContext = useContext(AuthContext);
  const [_, setLocation] = useLocation();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // Function to resend verification email
  const resendVerificationEmail = async () => {
    if (!unverifiedEmail) return;
    
    try {
      setIsResendingVerification(true);
      
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: unverifiedEmail,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification email");
      }
      
      setSuccessMessage(`Verification email sent to ${unverifiedEmail}. Please check your inbox.`);
      console.log("Verification token (for dev testing):", data.verificationToken);
      
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email");
    } finally {
      setIsResendingVerification(false);
    }
  };
  
  // Handle login form submission
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsSubmitting(true);
      setError("");
      setUnverifiedEmail(null); // Reset unverified email
      
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Special handling for unverified email
        if (response.status === 403 && data.isVerificationError) {
          setUnverifiedEmail(data.email);
          setError("Email not verified. Please verify your email to login.");
          return;
        }
        
        throw new Error(data.message || "Invalid credentials");
      }
      
      setSuccessMessage("Login successful!");
      
      // Use Auth Context to set the user
      authContext.signInWithEmail(data);
      
      // Small delay to show success message before redirecting
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle registration form submission
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      setIsSubmitting(true);
      setError("");
      
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          username: values.email.split("@")[0], // Generate a username from email
          profileCompleted: 40, // Set higher completion percentage for email signups
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Registration failed");
      }
      
      const responseData = await response.json();
      
      // Use the user data from the registration response
      const userData = responseData.user;
      const verificationToken = responseData.verificationToken;
      
      console.log("Registration successful:", userData);
      console.log("Verification token (for dev testing):", verificationToken);
      
      // Set the unverified email for potential resend
      setUnverifiedEmail(userData.email);
      
      // Display success message with verification instructions
      setSuccessMessage(`Registration successful! A verification email has been sent to ${userData.email}. Please verify your email before logging in.`);
      
      // Switch to login tab
      setAuthMode("login");
      
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          
          {/* Show resend verification button when needed */}
          {unverifiedEmail && (
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={resendVerificationEmail}
                disabled={isResendingVerification}
              >
                {isResendingVerification ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>Resend Verification Email</>
                )}
              </Button>
            </div>
          )}
        </Alert>
      )}
      
      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Success</AlertTitle>
          <AlertDescription className="text-green-600">
            {successMessage}
          </AlertDescription>
          
          {/* Show resend verification button for new registrations */}
          {unverifiedEmail && !error && (
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700" 
                onClick={resendVerificationEmail}
                disabled={isResendingVerification}
              >
                {isResendingVerification ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>Resend Verification Email</>
                )}
              </Button>
            </div>
          )}
        </Alert>
      )}
      
      <Tabs defaultValue="login" onValueChange={(v) => setAuthMode(v as "login" | "register")}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Create Account</TabsTrigger>
        </TabsList>
        
        {/* Login Form */}
        <TabsContent value="login">
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-4"
            >
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="youremail@example.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
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
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
        
        {/* Registration Form */}
        <TabsContent value="register">
          <Form {...registerForm}>
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-4"
            >
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="youremail@example.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
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
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}