import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Crown, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import { PremiumBadge } from "@/components/ui/premium-badge";

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container max-w-2xl mx-auto px-4 pt-24 pb-20">
        <Card className="p-12 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-amber-600/10 backdrop-blur-xl border-yellow-400/30 rounded-2xl shadow-2xl text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50 mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-white">Welcome to Premium!</h1>
              <PremiumBadge size="lg" />
            </div>
            <p className="text-lg text-white/70">
              Your subscription has been activated successfully
            </p>
          </div>

          {/* Celebration Message */}
          <div className="mb-8 p-6 rounded-lg bg-white/5">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">You're all set!</h2>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-white/70">
              You now have access to all premium features including unlimited AI chat, resume
              analysis, all templates, and much more.
            </p>
          </div>

          {/* Premium Features Highlights */}
          <div className="mb-8 space-y-3 text-left max-w-md mx-auto">
            {[
              'Unlimited AI chat messages',
              'Unlimited resume analysis',
              'All portfolio & visiting card templates',
              'Advanced hashtag suggestions',
              'Career + Social media quests',
              '20 pulse reactions daily',
              'Premium badge on your profile',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-yellow-400 shrink-0" />
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold shadow-lg shadow-yellow-500/30"
              onClick={() => setLocation('/profile')}
              data-testid="button-go-to-profile"
            >
              Go to My Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
              onClick={() => setLocation('/subscription/manage')}
              data-testid="button-manage-subscription"
            >
              Manage Subscription
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-white/50 mt-8">
            You'll receive a confirmation email with your subscription details shortly.
          </p>
        </Card>
      </div>
    </div>
  );
}
