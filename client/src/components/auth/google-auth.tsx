import { Loader2, AlertTriangle, Info, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Define schema for the form
const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export function GoogleAuth() {
  const { signInWithGoogle, isLoading, signInWithEmail } = useAuth();
  const { toast } = useToast();
  const [authAttempted, setAuthAttempted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true);
  const [isGoogleAttempted, setIsGoogleAttempted] = useState(false);
  const [mode, setMode] = useState<"google" | "email">("google");
  const auth = getAuth();
  
  // Form setup for email auth
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Check if Firebase is properly configured
  useEffect(() => {
    const checkFirebaseConfig = () => {
      const hasProjectId = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;
      const hasApiKey = !!import.meta.env.VITE_FIREBASE_API_KEY;
      const hasAppId = !!import.meta.env.VITE_FIREBASE_APP_ID;
      
      const isConfigured = hasProjectId && hasApiKey && hasAppId;
      setIsFirebaseConfigured(isConfigured);
      
      if (!isConfigured) {
        console.error("Firebase configuration is incomplete");
      } else {
        console.log("Firebase config:", {
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
          hasAppId: !!import.meta.env.VITE_FIREBASE_APP_ID
        });
      }
    };
    
    checkFirebaseConfig();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthAttempted(true);
    setAuthError(null);
    setIsGoogleAttempted(true);
    
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Error in Google Auth component:", error);
      
      // Set appropriate error message based on the error type
      if (error.code === 'auth/internal-error') {
        setAuthError("Third-party cookies may be disabled in your browser settings");
        setMode("email"); // Switch to email auth as fallback
      } else if (error.code === 'auth/popup-blocked') {
        setAuthError("Sign-in popup was blocked by your browser");
      } else if (error.code && error.message) {
        setAuthError(`${error.code}: ${error.message}`);
      } else {
        setAuthError("Authentication failed. Please try again.");
      }
    }
  };
  
  const handleEmailAuth = async (values: FormValues) => {
    setAuthAttempted(true);
    setAuthError(null);
    
    try {
      // First try to sign in - if the user exists
      try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;
        
        // Call our custom auth context to handle the user
        if (user) {
          signInWithEmail({
            id: parseInt(user.uid.substring(0, 5), 36) || Math.floor(Math.random() * 10000),
            uid: user.uid,
            username: user.email?.split('@')[0] || '',
            email: user.email,
            name: user.displayName,
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
            password: null
          });
          
          toast({
            title: "Sign in successful",
            description: "Welcome to Brandentifier!",
          });
        }
      } catch (signInError: any) {
        // If the user doesn't exist, create a new account
        if (signInError.code === 'auth/user-not-found') {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            
            if (user) {
              signInWithEmail({
                id: parseInt(user.uid.substring(0, 5), 36) || Math.floor(Math.random() * 10000),
                uid: user.uid,
                username: user.email?.split('@')[0] || '',
                email: user.email,
                name: user.displayName,
                phoneNumber: user.phoneNumber,
                photoURL: user.photoURL,
                password: null
              });
              
              toast({
                title: "Account created",
                description: "Your account has been created and you're now signed in!",
              });
            }
          } catch (createError: any) {
            setAuthError("Error creating account: " + createError.message);
          }
        } else {
          // Handle other sign-in errors
          if (signInError.code === 'auth/wrong-password') {
            setAuthError("Incorrect password. Please try again.");
          } else {
            setAuthError(signInError.message);
          }
        }
      }
    } catch (error: any) {
      console.error("Error in Email Auth:", error);
      setAuthError(error.message);
    }
  };

  return (
    <div className="space-y-4">
      {!isFirebaseConfigured && (
        <div className="p-2 mb-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Firebase configuration is incomplete. Please check your environment variables.</span>
        </div>
      )}
      
      {mode === "google" ? (
        // Google Sign-in Option
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading || !isFirebaseConfigured}
          className="w-full relative"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg
              className="mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
          )}
          {isLoading ? "Signing in..." : "Continue with Google"}
        </Button>
      ) : (
        // Email Sign-in Form
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleEmailAuth)} className="space-y-4">
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
              {isLoading ? "Signing in..." : "Sign In / Sign Up"}
            </Button>
          </form>
        </Form>
      )}
      
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
      
      {/* Toggle between Google and Email authentication */}
      <div className="text-center">
        <Button 
          variant="link" 
          className="text-sm font-medium" 
          onClick={() => setMode(mode === "google" ? "email" : "google")}
        >
          {mode === "google" 
            ? "Use email and password instead" 
            : "Try Google sign-in again"}
        </Button>
      </div>
      
      {isGoogleAttempted && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="text-sm space-y-2">
            <div className="flex items-center text-blue-800 font-medium mb-1">
              <Info className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Having trouble with Google Sign-in?</span>
            </div>
            
            <p className="text-blue-700 text-sm">
              We've added a simpler email-based sign-in option that should work without running into cookie-related issues. 
              You can use this method to create a new account or sign in with an existing one.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}