import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-user";
import { useLocation } from "wouter";
import { Crown, Calendar, CreditCard, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/layout/header";
import { PremiumBadge } from "@/components/ui/premium-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

export default function SubscriptionManage() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const subscriptionTier = (user as any)?.subscriptionTier || 'free';
  const isPremium = subscriptionTier === 'premium';
  
  // Derive subscription status properly - free users are not subscribed
  const subscriptionStatus = isPremium 
    ? ((user as any)?.subscriptionStatus || 'active')
    : 'not_subscribed';
  
  const subscriptionStartDate = (user as any)?.subscriptionStartDate;
  const subscriptionEndDate = (user as any)?.subscriptionEndDate;
  const paymentProvider = (user as any)?.paymentProvider;

  const isActive = subscriptionStatus === 'active';

  const handleCancelSubscription = async () => {
    // This will be implemented when Razorpay integration is ready
    console.log('Cancel subscription');
    setShowCancelDialog(false);
    // TODO: Call API to cancel subscription via Razorpay
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container max-w-4xl mx-auto px-4 pt-24 pb-20">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-white/70 hover:text-white"
          onClick={() => setLocation('/profile')}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <h1 className="text-3xl font-bold text-white">Subscription Management</h1>
            {isPremium && <PremiumBadge size="lg" />}
          </div>
          <p className="text-white/60">
            Manage your subscription, billing, and premium features
          </p>
        </div>

        {/* Current Plan Card */}
        <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                {isPremium ? (
                  <>
                    <Crown className="w-6 h-6 text-yellow-400" />
                    Premium Plan
                  </>
                ) : (
                  'Free Plan'
                )}
              </h2>
              <p className="text-white/60">
                {isPremium ? 'Access to all premium features' : 'Limited features available'}
              </p>
            </div>
            <Badge
              className={
                isPremium && isActive
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : subscriptionStatus === 'not_subscribed'
                  ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }
            >
              {subscriptionStatus === 'not_subscribed' ? (
                <>
                  Free Tier
                </>
              ) : isActive ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  {subscriptionStatus}
                </>
              )}
            </Badge>
          </div>

          {isPremium && isActive && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscriptionStartDate && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5">
                    <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-white/60 mb-1">Start Date</p>
                      <p className="text-white font-medium">
                        {format(new Date(subscriptionStartDate), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}

                {subscriptionEndDate && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5">
                    <Calendar className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-white/60 mb-1">Next Billing Date</p>
                      <p className="text-white font-medium">
                        {format(new Date(subscriptionEndDate), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {paymentProvider && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5">
                  <CreditCard className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-white/60 mb-1">Payment Method</p>
                    <p className="text-white font-medium capitalize">{paymentProvider}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isPremium && (
            <div className="mt-6">
              <Button
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold shadow-lg shadow-yellow-500/30"
                onClick={() => setLocation('/pricing')}
                data-testid="button-upgrade"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          )}
        </Card>

        {/* Premium Features Card */}
        <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {isPremium ? 'Your Premium Features' : 'What You Get with Premium'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Unlimited AI chat messages',
              'Unlimited resume analysis',
              'All portfolio templates',
              'All visiting card templates',
              'Advanced hashtag suggestions (10+)',
              'Career + Social media quests',
              'Unlimited career capsules',
              '20 pulse reactions daily',
              'Premium badge on profile',
              'Priority support',
              'Early access to features',
              'Ad-free experience',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                <span className="text-sm text-white/80">{feature}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Cancel Subscription */}
        {isPremium && isActive && (
          <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Cancel Subscription</h3>
            <p className="text-white/60 mb-4">
              You'll continue to have access to premium features until the end of your billing period.
            </p>
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  data-testid="button-cancel-subscription"
                >
                  Cancel Subscription
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Are you sure?</DialogTitle>
                  <DialogDescription className="text-white/60">
                    You'll lose access to all premium features at the end of your billing period. You can
                    resubscribe anytime.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelDialog(false)}
                    data-testid="button-cancel-dialog-close"
                  >
                    Keep Premium
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    data-testid="button-confirm-cancel"
                  >
                    Confirm Cancellation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>
        )}
      </div>
    </div>
  );
}
