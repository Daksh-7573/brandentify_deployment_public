import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useReplitAuthContext } from "@/contexts/ReplitAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ReplitAuth } from "@/components/auth/replit-auth";
import { Loader2 } from "lucide-react";

export default function ReplitLoginPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/replit-login");
  const { isAuthenticated, isLoading } = useReplitAuthContext();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation("/profile");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking authentication status...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <img
              src="/logo.svg"
              alt="Logo"
              className="h-10 w-10"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReplitAuth />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => window.location.href = "/login"}
            className="w-full"
          >
            Use Email & Password
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            variant="ghost"
            onClick={() => setLocation("/signup")}
            className="w-full text-sm text-muted-foreground"
          >
            Don't have an account? Sign up
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}