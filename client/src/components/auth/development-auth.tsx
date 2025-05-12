import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

// Special development-only auth component to bypass cookies and security restrictions
// IMPORTANT: This should NEVER be used in production environments
const DevelopmentAuth = () => {
  const [email, setEmail] = useState('dev@example.com');
  const [password, setPassword] = useState('development');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const auth = getAuth();

  const handleDirectLogin = async () => {
    setLoading(true);
    try {
      // Try to sign in with the provided email/password
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Development login successful",
        description: "You are now signed in using development credentials",
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // If user doesn't exist, create a new user for development
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          toast({
            title: "Development account created",
            description: "Created and signed in with new development account",
          });
        } catch (createError: any) {
          toast({
            title: "Error creating development account",
            description: createError.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Development login error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      // Use anonymous sign-in (no credentials needed)
      await signInAnonymously(auth);
      toast({
        title: "Anonymous login successful",
        description: "You are now signed in anonymously for development purposes",
      });
    } catch (error: any) {
      toast({
        title: "Anonymous login error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Development Authentication</CardTitle>
        <CardDescription>
          This is a special development-only authentication bypass for Replit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <AlertTitle>Development Mode Active</AlertTitle>
          <AlertDescription>
            This authentication method bypasses normal security for development purposes only.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleDirectLogin}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Development Login
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={handleAnonymousLogin}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Anonymous Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevelopmentAuth;