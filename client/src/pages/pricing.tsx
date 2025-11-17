import { Check, Sparkles, Zap, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";

export default function PricingPage() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const isPremium = (user as any)?.subscriptionTier === "premium";

  const features = {
    free: [
      "Full professional profile",
      "2 portfolio templates (Corporate Executive, Scholar)",
      "2 visiting card templates (Professional, Quantum Tech)",
      "5 AI chat messages per month",
      "1 resume analysis per month",
      "Basic hashtag suggestions (3 per post)",
      "Career quests only",
      "1 career capsule",
      "10 Insightful + 10 Misinformed reactions daily",
      "Basic analytics",
    ],
    premium: [
      "Everything in Free, plus:",
      "All portfolio templates (12+ designs)",
      "All visiting card templates",
      "Unlimited AI chat messages",
      "Unlimited resume analysis",
      "Advanced hashtag suggestions (10+ per post)",
      "All quest types (Career + Social Media)",
      "Unlimited career capsules",
      "20 Insightful + 20 Misinformed reactions daily",
      "Priority support",
      "Early access to new features",
      "Premium badge on profile",
      "Ad-free experience",
    ],
  };

  const handleUpgrade = (planType: "monthly" | "yearly") => {
    if (!user) {
      setLocation("/login");
      return;
    }
    
    // For now, just navigate to a placeholder
    // Payment integration will be added later
    setLocation(`/checkout?plan=${planType}`);
  };

  return (
    <div className="min-h-screen p-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">Limited Time Offer</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Unlock Your Full Potential
          </h1>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Choose the plan that fits your career growth journey. Upgrade anytime, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="relative p-8 bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">₹0</span>
                  <span className="text-white/60">/month</span>
                </div>
                <p className="text-sm text-white/60 mt-2">Perfect for getting started</p>
              </div>

              <Button
                variant="outline"
                className="w-full border-white/20 hover:bg-white/10"
                disabled={!isPremium}
                data-testid="button-free-plan"
              >
                {isPremium ? "Current Plan" : "Your Current Plan"}
              </Button>

              <div className="space-y-3">
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Premium Plan */}
          <Card className="relative p-8 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-amber-600/10 backdrop-blur-xl border-yellow-400/30 rounded-2xl shadow-2xl">
            {/* Premium Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-4 py-1">
                <Crown className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  Premium
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">₹799</span>
                  <span className="text-white/60">/month</span>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                  <div className="flex items-center gap-2 text-yellow-400 mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-semibold">Save 17% with Annual Plan</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">₹7,999</span>
                    <span className="text-white/60 text-sm">/year</span>
                    <span className="text-xs text-white/50 line-through ml-2">₹9,588</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold shadow-lg shadow-yellow-500/30"
                  onClick={() => handleUpgrade("monthly")}
                  data-testid="button-upgrade-monthly"
                >
                  Upgrade to Premium - Monthly
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-yellow-400/30 hover:bg-yellow-400/10 text-yellow-400"
                  onClick={() => handleUpgrade("yearly")}
                  data-testid="button-upgrade-yearly"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Upgrade to Premium - Yearly (Save ₹1,589)
                </Button>
              </div>

              <div className="space-y-3">
                {features.premium.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-white/90 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
              <h3 className="font-semibold text-white mb-2">Can I cancel anytime?</h3>
              <p className="text-white/60 text-sm">
                Yes! You can cancel your subscription anytime. You'll continue to have access to premium features until the end of your billing period.
              </p>
            </Card>

            <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
              <h3 className="font-semibold text-white mb-2">What payment methods do you accept?</h3>
              <p className="text-white/60 text-sm">
                We accept UPI, Credit/Debit Cards, Net Banking, and popular wallets through Razorpay - India's leading payment gateway.
              </p>
            </Card>

            <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
              <h3 className="font-semibold text-white mb-2">What happens to my data if I downgrade?</h3>
              <p className="text-white/60 text-sm">
                Your data is always safe. If you downgrade, you'll lose access to premium features but all your content and profile information will remain intact.
              </p>
            </Card>

            <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10">
              <h3 className="font-semibold text-white mb-2">Can I upgrade from monthly to yearly?</h3>
              <p className="text-white/60 text-sm">
                Absolutely! You can switch between monthly and yearly plans anytime from your subscription settings.
              </p>
            </Card>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center items-center gap-8 flex-wrap text-white/40 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Instant Activation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
