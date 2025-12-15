import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showTooltip?: boolean;
}

/**
 * Premium Badge Component
 * NOTE: This component is currently hidden as premium features are disabled.
 * Returns null to hide all premium badges throughout the app.
 */
export function PremiumBadge({ 
  size = "md", 
  className,
  showTooltip = true 
}: PremiumBadgeProps) {
  // Hide premium badge - return null
  return null;
}
