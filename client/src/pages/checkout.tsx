import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Header from "@/components/layout/header";

export default function CheckoutPage() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const planType = (searchParams.get("plan") || "monthly") as "monthly" | "yearly";
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [checkoutDetails, setCheckoutDetails] = useState<any>(null);

  const pricing = {
    monthly: {
      amount: "₹799",
      billingCycle: "month",
      totalAmount: "₹799",
    },
    yearly: {
      amount: "₹7,999",
      billingCycle: "year",
      totalAmount: "₹7,999",
      savings: "Save ₹1,589",
    },
  };

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }

    const fetchCheckoutDetails = async () => {
      try {
        const response = await fetch("/api/subscription/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planType }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch checkout details");
        }

        const data = await response.json();
        setCheckoutDetails(data.checkout);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load checkout details",
          variant: "destructive",
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutDetails();
  }, [user, planType, setLocation, toast]);

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Placeholder for Razorpay integration
      // This will be replaced with actual Razorpay payment flow

      // For now, show a message
      toast({
        title: "Ready for Payment",
        description: "Razorpay payment integration will be added next. Click 'Simulate Payment' to complete.",
      });

      // Simulate successful payment for demo
      setTimeout(async () => {
        try {
          const response = await fetch("/api/subscription/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              planType,
              paymentId: `pay_${Date.now()}`,
              orderId: `ord_${Date.now()}`,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to verify payment");
          }

          toast({
            title: "Success!",
            description: "Your premium subscription is now active!",
          });

          // Redirect to subscription management page after 2 seconds
          setTimeout(() => {
            setLocation("/subscription-manage");
          }, 2000);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to activate subscription",
            variant: "destructive",
          });
          console.error(error);
          setProcessing(false);
        }
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Payment processing failed",
        variant: "destructive",
      });
      console.error(error);
      setProcessing(false);
    }
  };

  const plan = pricing[planType];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
          <p className="text-white">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container max-w-2xl mx-auto px-4 pt-24 pb-20">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-white/70 hover:text-white"
          onClick={() => setLocation("/pricing")}
          data-testid="button-back"
        >
          ← Back to Pricing
        </Button>

        {/* Checkout Card */}
        <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-white">Complete Your Purchase</h1>
              <p className="text-white/60">Upgrade to Premium and unlock all features</p>
            </div>

            {/* Order Summary */}
            <div className="bg-white/5 rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Plan</span>
                  <span className="text-white font-medium capitalize">
                    Premium {planType === "monthly" ? "Monthly" : "Annual"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Price</span>
                  <span className="text-white font-medium">{plan.amount}/{plan.billingCycle}</span>
                </div>

                {planType === "yearly" && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Savings</span>
                    <span className="text-green-400 font-medium">{plan.savings}</span>
                  </div>
                )}

                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-2xl font-bold text-yellow-400">{plan.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* User Info */}
            {checkoutDetails && (
              <div className="bg-white/5 rounded-lg p-6 space-y-3">
                <h3 className="text-sm font-semibold text-white/60 uppercase">Billing To</h3>
                <div className="space-y-2">
                  <p className="text-white font-medium">{checkoutDetails.userName}</p>
                  <p className="text-white/60">{checkoutDetails.userEmail}</p>
                </div>
              </div>
            )}

            {/* Warning - Razorpay not integrated yet */}
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-white font-medium text-sm">Demo Mode</p>
                <p className="text-white/70 text-sm">
                  Razorpay payment integration will be added as the final step. For now, you can simulate payment completion to test the subscription activation.
                </p>
              </div>
            </div>

            {/* Payment Methods Info */}
            <div className="bg-white/5 rounded-lg p-6 space-y-3">
              <h3 className="text-sm font-semibold text-white">Payment Methods</h3>
              <p className="text-white/60 text-sm">
                We accept UPI, Credit/Debit Cards, Net Banking, and popular wallets through Razorpay.
              </p>
              <div className="flex gap-2 flex-wrap mt-3">
                {["UPI", "Cards", "NetBanking", "Wallets"].map((method) => (
                  <div key={method} className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/60">
                    {method}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold shadow-lg shadow-yellow-500/30 h-12"
                data-testid="button-proceed-payment"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Simulate Payment (Demo)
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setLocation("/pricing")}
                className="w-full border-white/20 hover:bg-white/10"
                disabled={processing}
                data-testid="button-cancel-payment"
              >
                Cancel and Go Back
              </Button>
            </div>

            {/* Security Note */}
            <div className="text-center text-white/40 text-xs space-y-1">
              <p>🔒 Your payment information is secure and encrypted</p>
              <p>Powered by Razorpay - India's most trusted payment gateway</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
