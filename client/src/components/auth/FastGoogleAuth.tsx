import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function FastGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const FastGoogleAuth = async () => {
    setIsLoading(true);

    try {
      console.log("🔄 Starting Google authentication...");

      const { signInWithPopup, GoogleAuthProvider } = await import(
        "firebase/auth"
      );
      const firebaseModule = await import("@/lib/firebase");
      const auth: any = firebaseModule.auth;

      if (!auth) {
        throw new Error("Firebase auth not initialized");
      }

      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");

      // Critical: Set proper parameters to prevent popup issues
      provider.setCustomParameters({
        prompt: "select_account",
        access_type: "online",
        include_granted_scopes: "true",
      });

      console.log("🔄 Opening Google sign-in popup...");

      // Create popup with explicit settings
      const popupFeatures =
        "width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no";

      // Use signInWithPopup with proper error handling
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        // Handle specific popup errors
        if (popupError.code === "auth/popup-closed-by-user") {
          console.log("ℹ️ User closed popup - this is normal");
          setIsLoading(false);
          return;
        }

        if (popupError.code === "auth/cancelled-popup-request") {
          console.log("ℹ️ Popup request cancelled");
          setIsLoading(false);
          return;
        }

        // For other popup errors, try redirect as fallback
        if (popupError.code === "auth/popup-blocked") {
          console.log("🔄 Popup blocked, trying redirect...");
          const { signInWithRedirect } = await import("firebase/auth");
          await signInWithRedirect(auth, provider);
          return;
        }

        throw popupError;
      }

      console.log("✅ Google popup completed successfully!");

      const userData = {
        firebaseUid: result.user.uid,
        email: result.user.email || "",
        name: result.user.displayName || "Google User",
        photoURL: result.user.photoURL || "",
        googleId: result.user.uid,
        authProvider: "google",
        emailVerified: result.user.emailVerified || false,
      };

      console.log("📡 Sending to backend...");

      const response = await fetch("/api/auth/google-signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.user) {
        sessionStorage.setItem("brandentifier_user", JSON.stringify(data.user));
        window.location.href = "/dashboard";
      } else {
        throw new Error(data.message || "Authentication failed");
      }
    } catch (error: any) {
      console.error("❌ Google authentication error:", error);

      // Don't show error for user-cancelled actions
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        setIsLoading(false);
        return;
      }

      let errorMessage = "Authentication failed. Please try again.";

      if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.code === "auth/unauthorized-domain") {
        errorMessage = "This domain is not authorized. Please contact support.";
      }

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });

      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={FastGoogleAuth}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-5 h-5"
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
          Continue with Google==
        </>
      )}
    </Button>
  );
}
