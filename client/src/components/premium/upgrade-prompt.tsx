/**
 * Upgrade Prompt Component
 * NOTE: This component is currently hidden as premium features are disabled.
 * All users now have full access to all features.
 */

interface UpgradePromptProps {
  title?: string;
  message?: string;
  feature?: string;
  variant?: "card" | "inline" | "modal";
  className?: string;
}

export function UpgradePrompt({
  title = "Upgrade to Premium",
  message = "This feature is only available for Premium members.",
  feature,
  variant = "card",
  className = "",
}: UpgradePromptProps) {
  // Hide upgrade prompt - return null
  return null;
}
