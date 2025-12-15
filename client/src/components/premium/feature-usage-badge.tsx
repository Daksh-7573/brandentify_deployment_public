/**
 * Feature Usage Badge Component
 * NOTE: This component is currently hidden as premium features are disabled.
 * All users now have full access to all features.
 */

interface FeatureUsageBadgeProps {
  used: number;
  limit: number;
  label: string;
  isPremium?: boolean;
}

export function FeatureUsageBadge({ used, limit, label, isPremium }: FeatureUsageBadgeProps) {
  // Hide feature usage badge - return null
  return null;
}
