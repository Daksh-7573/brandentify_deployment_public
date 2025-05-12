import { useEffect } from "react";
import { useLocation } from "wouter";
import { ReplitAuth } from "@/components/auth/replit-auth";
import { useReplitAuthContext } from "@/contexts/ReplitAuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReplitLoginPage() {
  const { isAuthenticated, isLoading } = useReplitAuthContext();
  const [_, setLocation] = useLocation();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign in to Brandentifier</CardTitle>
          <CardDescription>
            Your AI-powered career development platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <ReplitAuth />
            {isLoading && (
              <div className="text-center text-sm text-muted-foreground">
                Checking authentication status...
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}