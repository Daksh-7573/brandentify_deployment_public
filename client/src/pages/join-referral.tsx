import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Referral Join Handler
 * URL: /join/:code
 * Purpose: Captures referral code and redirects to auth with code stored in localStorage
 */
export default function JoinReferralPage({ code }: { code: string }) {
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (!code) {
      console.warn("[Referral] No code provided, redirecting to auth");
      navigate("/auth");
      return;
    }

    // Store the referral code in sessionStorage (will be cleared after signup)
    sessionStorage.setItem("referral_code", code);
    
    console.log("[Referral] Stored referral code:", code);
    
    // Validate the referral code with the backend
    validateAndRedirect(code);
  }, [code, navigate]);

  const validateAndRedirect = async (referralCode: string) => {
    try {
      const response = await fetch(`/api/referral/validate-code/${referralCode}`);
      
      if (!response.ok) {
        console.warn("[Referral] Invalid referral code, redirecting to auth");
        sessionStorage.removeItem("referral_code");
        navigate("/auth?error=invalid_referral");
        return;
      }

      // Code is valid, redirect to auth page
      console.log("[Referral] Code validated, redirecting to auth");
      navigate("/auth?referral=" + referralCode);
    } catch (error) {
      console.error("[Referral] Error validating code:", error);
      sessionStorage.removeItem("referral_code");
      navigate("/auth?error=validation_failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Joining Brandentifier...</h1>
        <p className="text-gray-400">Please wait while we process your invite link</p>
      </div>
    </div>
  );
}
