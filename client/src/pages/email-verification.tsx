import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function EmailVerification() {
  const [_, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying your email...");
  
  // Get the token from URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }
      
      try {
        const response = await fetch(`/api/verify-email/${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify email. Please try again.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again later.");
        console.error("Verification error:", error);
      }
    };
    
    verifyEmail();
  }, [token]);
  
  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            Brandentifier Account Verification
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-6">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-center text-lg">Verifying your email address...</p>
              <p className="text-center text-muted-foreground mt-2">Please wait a moment</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-center text-lg font-medium text-green-700">{message}</p>
              <p className="text-center text-muted-foreground mt-2">
                Your email has been verified. You can now login to your account.
              </p>
            </div>
          )}
          
          {status === "error" && (
            <div className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-destructive mb-4" />
              <p className="text-center text-lg font-medium text-destructive">{message}</p>
              <p className="text-center text-muted-foreground mt-2">
                The verification link might have expired or is invalid.
                Please try requesting a new verification email.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pb-6">
          <Button onClick={() => setLocation("/auth")} className="px-8">
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}