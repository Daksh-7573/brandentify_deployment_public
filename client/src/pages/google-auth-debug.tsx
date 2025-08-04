import { useState } from "react";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function GoogleAuthDebug() {
  const [loading, setLoading] = useState(false);
  const [authResult, setAuthResult] = useState<any>(null);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handlePopupAuth = async () => {
    try {
      setLoading(true);
      console.log("Testing popup authentication...");
      
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result?.user) {
        console.log("Popup success:", result.user);
        setAuthResult({
          method: "popup",
          user: {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName
          }
        });
        
        toast({
          title: "Popup Authentication Success",
          description: `Signed in as ${result.user.email}`,
        });
        
        // Navigate to dashboard after successful auth
        setTimeout(() => {
          setLocation("/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Popup error:", error);
      toast({
        title: "Popup Failed",
        description: `Error: ${error.code || error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectAuth = async () => {
    try {
      setLoading(true);
      console.log("Testing redirect authentication...");
      
      await signInWithRedirect(auth, googleProvider);
      // User will be redirected, so we won't reach this point
    } catch (error: any) {
      console.error("Redirect error:", error);
      toast({
        title: "Redirect Failed",
        description: `Error: ${error.code || error.message}`,
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const checkRedirectResult = async () => {
    try {
      console.log("Checking redirect result...");
      const result = await getRedirectResult(auth);
      
      if (result?.user) {
        console.log("Redirect result found:", result.user);
        setAuthResult({
          method: "redirect",
          user: {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName
          }
        });
        
        toast({
          title: "Redirect Authentication Success",
          description: `Signed in as ${result.user.email}`,
        });
        
        // Navigate to dashboard after successful auth
        setTimeout(() => {
          setLocation("/dashboard");
        }, 2000);
      } else {
        console.log("No redirect result found");
        toast({
          title: "No Redirect Result",
          description: "No pending authentication redirect found",
        });
      }
    } catch (error: any) {
      console.error("Redirect result error:", error);
      toast({
        title: "Redirect Result Error",
        description: `Error: ${error.code || error.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Google Authentication Debug</CardTitle>
            <CardDescription className="text-gray-300">
              Test different Google authentication methods to diagnose issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={handlePopupAuth}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Loading..." : "Test Popup Auth"}
              </Button>
              
              <Button 
                onClick={handleRedirectAuth}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Loading..." : "Test Redirect Auth"}
              </Button>
              
              <Button 
                onClick={checkRedirectResult}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Check Redirect Result
              </Button>
            </div>

            {authResult && (
              <Card className="bg-green-500/10 border-green-400/20">
                <CardHeader>
                  <CardTitle className="text-green-400">Authentication Success</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-300 space-y-2">
                    <p><strong>Method:</strong> {authResult.method}</p>
                    <p><strong>UID:</strong> {authResult.user.uid}</p>
                    <p><strong>Email:</strong> {authResult.user.email}</p>
                    <p><strong>Name:</strong> {authResult.user.displayName}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Domain:</strong> {window.location.hostname}</p>
              <p><strong>Protocol:</strong> {window.location.protocol}</p>
              <p><strong>Current Auth:</strong> {auth.currentUser?.email || "None"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}