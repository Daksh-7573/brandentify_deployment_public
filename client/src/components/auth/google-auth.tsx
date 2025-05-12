import { Loader2, AlertTriangle, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Define schema for the form
const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export function GoogleAuth() {
  // Renamed for legacy reasons, this is now EmailAuth but we keep the component name
  const { signInWithEmail } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true);
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
        console.log("Firebase config check:", {
          projectIdExists: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
          apiKeyLength: import.meta.env.VITE_FIREBASE_API_KEY?.length || 0,
          appIdLength: import.meta.env.VITE_FIREBASE_APP_ID?.length || 0
        });
      }
    };
    
    checkFirebaseConfig();
  }, []);
  
  const handleEmailAuth = async (values: FormValues) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
      
      <div className="rounded-md bg-blue-50 p-3 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Email Authentication</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Sign in with your email and password. If you don't have an account yet, 
                one will be created for you automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
      
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
    </div>
  );
}