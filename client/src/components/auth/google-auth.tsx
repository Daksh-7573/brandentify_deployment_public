import { Loader2, Check, AlertTriangle, Info, User, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";

// Define schema for the form
const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

// Simple demo mode authentication - completely replaces Firebase auth
export function GoogleAuth() {
  const { signInWithEmail, isLoading } = useAuth();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form setup for email auth
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
  });

  // Direct authentication with our backend
  const handleDirectAuth = async (values: FormValues) => {
    setAuthError(null);
    
    try {
      // Attempt to sign in directly with our backend
      const signInResponse = await apiRequest('POST', '/api/auth/login', {
        email: values.email,
        password: values.password
      });
      
      if (signInResponse.ok) {
        const userData = await signInResponse.json();
        
        // Successfully authenticated with our backend
        signInWithEmail({
          id: userData.id || Math.floor(Math.random() * 10000),
          username: userData.username || values.email.split('@')[0],
          email: values.email,
          name: userData.name || values.name || values.email.split('@')[0],
          phoneNumber: null,
          photoURL: null,
          password: null
        });
        
        toast({
          title: "Sign in successful",
          description: "Welcome to Brandentifier!",
        });
      } else if (signInResponse.status === 404 && isSignUp) {
        // User not found, but we're in signup mode, so create the account
        const signUpResponse = await apiRequest('POST', '/api/auth/register', {
          email: values.email,
          password: values.password,
          name: values.name || values.email.split('@')[0],
          username: values.email.split('@')[0]
        });
        
        if (signUpResponse.ok) {
          const userData = await signUpResponse.json();
          
          // Successfully created account
          signInWithEmail({
            id: userData.id || Math.floor(Math.random() * 10000),
            username: userData.username || values.email.split('@')[0],
            email: values.email,
            name: userData.name || values.name || values.email.split('@')[0],
            phoneNumber: null,
            photoURL: null,
            password: null
          });
          
          toast({
            title: "Account created",
            description: "Your account has been created and you're now signed in!",
          });
        } else {
          // Failed to create account
          const errorData = await signUpResponse.text();
          setAuthError(`Failed to create account: ${errorData || "Unknown error"}`);
        }
      } else if (signInResponse.status === 404) {
        // User not found and we're in login mode
        setAuthError("No account found with this email. Please sign up first.");
        setIsSignUp(true); // Switch to sign up mode
      } else if (signInResponse.status === 401) {
        // Invalid credentials
        setAuthError("Invalid email or password");
      } else {
        // Other error
        const errorData = await signInResponse.text();
        setAuthError(`Authentication failed: ${errorData || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error in Direct Auth:", error);
      
      // Create a direct demo/development account as fallback
      const userId = Math.floor(Math.random() * 10000);
      
      // Generate username from email or use fallback
      const username = values.email ? values.email.split('@')[0] : `user${userId}`;
      
      // Create user directly from form data (development/demo mode)
      try {
        await apiRequest('POST', '/api/users', {
          id: userId,
          username: username,
          email: values.email,
          name: values.name || username,
          title: "New User",
          location: "Global",
          photoURL: null
        });
        
        signInWithEmail({
          id: userId,
          username: username,
          email: values.email,
          name: values.name || username,
          phoneNumber: null,
          photoURL: null,
          password: null
        });
        
        toast({
          title: "Demo account created",
          description: "A demo account has been created for you.",
        });
      } catch (createError) {
        console.error("Error creating demo user:", createError);
        setAuthError("Failed to create a demo account. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 mb-4">
        <div className="flex items-center justify-center mb-4 text-center">
          <div className="bg-primary/10 text-primary rounded-full p-3 mr-3">
            {isSignUp ? <User size={22} /> : <Mail size={22} />}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{isSignUp ? "Create an Account" : "Sign In to Brandentifier"}</h3>
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Set up your new account" : "Continue to your dashboard"}
            </p>
          </div>
        </div>
      
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleDirectAuth)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isSignUp && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>
        </Form>
        
        <div className="mt-4 text-center">
          <Button 
            variant="link" 
            className="text-sm font-medium" 
            onClick={() => setIsSignUp(!isSignUp)}
            type="button"
          >
            {isSignUp 
              ? "Already have an account? Sign in" 
              : "Need an account? Sign up"}
          </Button>
        </div>
      </div>
      
      {authError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Authentication Error</p>
              <p>{authError}</p>
            </div>
          </div>
        </div>
      )}
      
      <Card className="p-4 space-y-3">
        <h4 className="font-medium text-sm flex items-center">
          <Info className="h-4 w-4 mr-2 text-blue-500" />
          Features you'll get access to:
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start">
            <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
            <span>AI-powered career guidance tailored to your experience</span>
          </div>
          <div className="flex items-start">
            <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
            <span>Smart networking with professionals in your field</span>
          </div>
          <div className="flex items-start">
            <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
            <span>Resume parsing and profile enhancement</span>
          </div>
        </div>
      </Card>
    </div>
  );
}